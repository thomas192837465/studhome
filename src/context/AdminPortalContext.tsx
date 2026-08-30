import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import type { ProfileRow } from "../lib/profileMapper";
import type { AdminSession, ActivityLog, AdminTransaction, PortalRole } from "../data/adminTypes";
import { isTwoFactorVerifiedForSession, markTwoFactorVerifiedForSession, type TwoFactorMethod } from "../lib/twoFactor";

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
  mfaMethod: TwoFactorMethod | null;
  mfaIdentifier: string;
  transactions: AdminTransaction[];
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
  const [mfaMethod, setMfaMethod] = useState<TwoFactorMethod | null>(null);
  const [mfaIdentifier, setMfaIdentifier] = useState("");
  const [pendingProfile, setPendingProfile] = useState<{ userId: string; session: AdminSession } | null>(null);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);

  // Decides, from an already-resolved admin/superadmin session, whether the
  // custom 2FA challenge (SMS or email, via our own endpoints) is still owed
  // for this browser session before granting admin access.
  const finalizeAuth = (userId: string, profile: ProfileRow, nextSession: AdminSession) => {
    if (profile.two_factor_method && !isTwoFactorVerifiedForSession(userId)) {
      setPendingProfile({ userId, session: nextSession });
      setMfaMethod(profile.two_factor_method);
      setMfaIdentifier(profile.two_factor_method === "email" ? profile.email ?? "" : profile.phone);
      setMfaPending(true);
      return;
    }
    setSession(nextSession);
    setMfaPending(false);
    setPendingProfile(null);
    setMfaMethod(null);
    setMfaIdentifier("");
  };

  useEffect(() => {
    let active = true;

    const applySession = async (authSession: { user: { id: string } } | null) => {
      if (!authSession?.user) {
        if (!active) return;
        setSession(null);
        setMfaPending(false);
        setMfaMethod(null);
        setMfaIdentifier("");
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
        setMfaMethod(null);
        setMfaIdentifier("");
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

  useEffect(() => {
    if (!session) {
      setTransactions([]);
      return;
    }

    const fetchTransactions = async () => {
      const { data: rows } = await supabase
        .from("credit_transactions")
        .select("id, user_id, description, amount, payment_method, status, created_at")
        .eq("type", "Achat")
        .order("created_at", { ascending: false })
        .limit(200);
      if (!rows || rows.length === 0) {
        setTransactions([]);
        return;
      }

      // credit_transactions.user_id references auth.users, not public.profiles
      // directly, so PostgREST can't embed the join — fetch the profiles for
      // the involved users separately and merge client-side.
      const userIds = [...new Set(rows.map((r) => r.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email")
        .in("id", userIds);
      const nameById = new Map(
        (profiles ?? []).map((p) => [p.id, `${p.first_name} ${p.last_name}`.trim() || p.email || "Utilisateur"]),
      );

      setTransactions(
        rows.map((row) => ({
          id: row.id,
          date: new Date(row.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }),
          utilisateur: nameById.get(row.user_id) ?? "Utilisateur",
          pack: row.description,
          mode: row.payment_method,
          montant: row.amount,
          statut: row.status === "Terminé" ? "Réussi" : "Échoué",
        })),
      );
    };

    fetchTransactions();

    const channel = supabase
      .channel("credit-transactions-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "credit_transactions" }, () => {
        fetchTransactions();
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
    markTwoFactorVerifiedForSession(pendingProfile.userId);
    setSession(pendingProfile.session);
    setMfaPending(false);
    setMfaMethod(null);
    setMfaIdentifier("");
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
      mfaMethod,
      mfaIdentifier,
      transactions,
      logs,
      loginWithPassword,
      completeMfaChallenge,
      logout,
      logAction,
    }),
    [session, authLoading, authError, mfaPending, mfaMethod, mfaIdentifier, transactions, logs, pendingProfile],
  );

  return <AdminPortalContext.Provider value={value}>{children}</AdminPortalContext.Provider>;
}

export function useAdminPortal() {
  const ctx = useContext(AdminPortalContext);
  if (!ctx) throw new Error("useAdminPortal must be used within AdminPortalProvider");
  return ctx;
}
