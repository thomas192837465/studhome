import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { ProfileRow } from "../lib/profileMapper";
import type { AdminSession, ActivityLog, PortalRole } from "../data/adminTypes";
import { seedTransactions } from "../data/adminSeed";
import { isPhoneVerifiedForSession, markPhoneVerifiedForSession } from "../lib/phoneVerification";

function roleToPortalRole(role: string): PortalRole | null {
  if (role === "admin") return "Admin";
  if (role === "superadmin") return "Super Admin";
  return null;
}

function profileToSession(profile: ProfileRow): AdminSession | null {
  const role = roleToPortalRole(profile.role);
  if (!role) return null;
  const name = `${profile.first_name} ${profile.last_name}`.trim() || profile.email || "Admin";
  return { id: profile.id, name, email: profile.email ?? "", role };
}

async function fetchProfile(id: string): Promise<ProfileRow | null> {
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (data) return data as ProfileRow;
    if (error) break;
    await new Promise((r) => setTimeout(r, 350));
  }
  return null;
}

interface AdminPortalContextValue {
  session: AdminSession | null;
  authLoading: boolean;
  authError: string;
  mfaPending: boolean;
  mfaPhone: string;
  transactions: typeof seedTransactions;
  logs: ActivityLog[];
  loginWithPassword: (email: string, password: string) => Promise<void>;
  completeMfaChallenge: () => Promise<void>;
  logout: () => Promise<void>;
  logAction: (action: string, cible?: string, details?: string) => Promise<void>;
}

const AdminPortalContext = createContext<AdminPortalContextValue | null>(null);

export function AdminPortalProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaPhone, setMfaPhone] = useState("");
  const [pendingProfile, setPendingProfile] = useState<{ userId: string; session: AdminSession } | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  // Decides, from an already-resolved admin/superadmin session, whether the
  // custom SMS 2FA challenge (via our own Twilio-backed endpoints) is still owed for this
  // browser session before granting admin access.
  const finalizeAuth = (userId: string, profile: ProfileRow, nextSession: AdminSession) => {
    if (profile.phone_verified && !isPhoneVerifiedForSession(userId)) {
      setPendingProfile({ userId, session: nextSession });
      setMfaPhone(profile.phone);
      setMfaPending(true);
      return;
    }
    setSession(nextSession);
    setMfaPending(false);
    setPendingProfile(null);
    setMfaPhone("");
  };

  useEffect(() => {
    let active = true;

    const applySession = async (authSession: { user: { id: string } } | null) => {
      if (!authSession?.user) {
        if (!active) return;
        setSession(null);
        setMfaPending(false);
        setMfaPhone("");
        setPendingProfile(null);
        setAuthLoading(false);
        return;
      }
      const profile = await fetchProfile(authSession.user.id);
      if (!active) return;
      // A session can belong to a student/owner account browsing while an
      // admin portal tab is also open — only treat it as admin-authenticated
      // when the profile was actually created with an admin/superadmin role.
      const nextSession = profile ? profileToSession(profile) : null;
      if (!nextSession || !profile) {
        setSession(null);
        setMfaPending(false);
        setMfaPhone("");
        setPendingProfile(null);
        setAuthLoading(false);
        return;
      }
      finalizeAuth(authSession.user.id, profile, nextSession);
      setAuthLoading(false);
    };

    const { data: sub } = supabase.auth.onAuthStateChange((_event, authSession) => {
      applySession(authSession);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) {
      setLogs([]);
      return;
    }

    const fetchLogs = async () => {
      const { data } = await supabase
        .from("activity_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (data) {
        setLogs(
          data.map((row) => ({
            id: row.id,
            time: row.created_at,
            admin: row.admin_name,
            action: row.action,
            cible: row.cible,
            details: row.details,
            ip: row.ip,
          })),
        );
      }
    };

    fetchLogs();

    const channel = supabase
      .channel("activity-logs-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "activity_logs" }, () => {
        fetchLogs();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  const loginWithPassword = async (email: string, password: string) => {
    setAuthError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error("Email ou mot de passe incorrect.");
    }
    const profile = data.user ? await fetchProfile(data.user.id) : null;
    const nextSession = profile ? profileToSession(profile) : null;
    if (!nextSession || !profile || !data.user) {
      await supabase.auth.signOut();
      throw new Error("Ce compte n'a pas accès à l'espace administrateur.");
    }
    finalizeAuth(data.user.id, profile, nextSession);
  };

  const completeMfaChallenge = async () => {
    if (!pendingProfile) return;
    markPhoneVerifiedForSession(pendingProfile.userId);
    setSession(pendingProfile.session);
    setMfaPending(false);
    setMfaPhone("");
    setPendingProfile(null);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const logAction = async (action: string, cible = "", details = "") => {
    if (!session) return;
    let ip = "";
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      ip = data.ip ?? "";
    } catch {
      // best-effort only — a missing IP shouldn't block the log entry
    }
    await supabase.from("activity_logs").insert({
      admin_id: session.id,
      admin_name: session.name,
      action,
      cible,
      details,
      ip,
    });
  };

  const value = useMemo<AdminPortalContextValue>(
    () => ({
      session,
      authLoading,
      authError,
      mfaPending,
      mfaPhone,
      transactions: seedTransactions,
      logs,
      loginWithPassword,
      completeMfaChallenge,
      logout,
      logAction,
    }),
    [session, authLoading, authError, mfaPending, mfaPhone, logs, pendingProfile],
  );

  return <AdminPortalContext.Provider value={value}>{children}</AdminPortalContext.Provider>;
}

export function useAdminPortal() {
  const ctx = useContext(AdminPortalContext);
  if (!ctx) throw new Error("useAdminPortal must be used within AdminPortalProvider");
  return ctx;
}
