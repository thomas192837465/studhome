import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ListingDraft } from "../data/listingTypes";
import { emptyDraft } from "../data/listingTypes";
import type { OwnerUser } from "../data/ownerTypes";
import { supabase } from "../lib/supabase";
import type { ProfileRow } from "../lib/profileMapper";
import { useListings } from "./ListingsContext";

const emptyOwnerUser: OwnerUser = {
  fullName: "",
  email: "",
  phone: "",
  memberSince: new Date().toISOString(),
  avatar: "",
};

function profileToOwnerUser(row: ProfileRow): OwnerUser {
  return {
    fullName: `${row.first_name} ${row.last_name}`.trim() || "Propriétaire",
    email: row.email ?? "",
    phone: row.phone,
    memberSince: row.created_at,
    avatar: row.avatar,
  };
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

interface LocalOwnerState {
  draft: ListingDraft;
}

const STORAGE_KEY = "studhome-owner-state-v2";

function loadLocalState(): LocalOwnerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { draft: parsed.draft ?? emptyDraft };
    }
  } catch {
    // ignore
  }
  return { draft: emptyDraft };
}

interface OwnerContextValue {
  isOwnerAuthenticated: boolean;
  authLoading: boolean;
  ownerId: string | null;
  ownerUser: OwnerUser;
  draft: ListingDraft;
  sendOtp: (email: string, meta?: { fullName?: string; phone?: string }) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateOwnerUser: (patch: Partial<OwnerUser>) => void;
  updateDraft: (patch: Partial<ListingDraft>) => void;
  resetDraft: () => void;
  submitDraft: () => Promise<string>;
}

const OwnerContext = createContext<OwnerContextValue | null>(null);

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [local, setLocal] = useState<LocalOwnerState>(loadLocalState);
  const [authLoading, setAuthLoading] = useState(true);
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [ownerUser, setOwnerUser] = useState<OwnerUser>(emptyOwnerUser);
  const { submitListing } = useListings();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  }, [local]);

  useEffect(() => {
    let active = true;

    const applySession = async (session: { user: { id: string } } | null) => {
      if (!session?.user) {
        if (!active) return;
        setAuthUserId(null);
        setOwnerUser(emptyOwnerUser);
        setIsOwnerAuthenticated(false);
        setAuthLoading(false);
        return;
      }
      const profile = await fetchProfile(session.user.id);
      if (!active) return;
      // A session can belong to a student account browsing while an owner
      // portal tab is also open — only treat it as owner-authenticated when
      // the profile was actually created as a "proprietaire" account.
      if (!profile || profile.role !== "proprietaire") {
        setAuthUserId(null);
        setOwnerUser(emptyOwnerUser);
        setIsOwnerAuthenticated(false);
        setAuthLoading(false);
        return;
      }
      setAuthUserId(session.user.id);
      setOwnerUser(profileToOwnerUser(profile));
      setIsOwnerAuthenticated(true);
      setAuthLoading(false);
    };

    // Deliberately not also calling getSession() here: it can resolve with a
    // stale/null session before the client has finished loading the stored
    // one, which would flip authLoading to false too early and let OwnerGuard
    // redirect away before the real session arrives. onAuthStateChange always
    // fires once with an INITIAL_SESSION event carrying the correctly
    // resolved session, so it alone is the race-free source of truth.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const sendOtp = async (email: string, meta?: { fullName?: string; phone?: string }) => {
    const [firstName, ...rest] = (meta?.fullName ?? "").trim().split(/\s+/).filter(Boolean);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { first_name: firstName ?? "", last_name: rest.join(" "), phone: meta?.phone ?? "", role: "proprietaire" },
      },
    });
    if (error) throw error;
  };

  const verifyOtp = async (email: string, token: string) => {
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
    if (error) throw error;
    const authUser = data.user;
    if (!authUser) throw new Error("Vérification impossible, réessayez.");
    const profile = await fetchProfile(authUser.id);
    if (profile && profile.role !== "proprietaire") {
      // Don't sign out here — verifying this OTP may have simply re-confirmed
      // the user's own already-active session (e.g. they tried the owner
      // signup with their existing student email). Signing out would kill a
      // perfectly valid session in every open tab for no reason; we just
      // decline to grant owner access.
      throw new Error("Cette adresse email est déjà associée à un compte étudiant.");
    }
    setAuthUserId(authUser.id);
    setOwnerUser(profile ? profileToOwnerUser(profile) : emptyOwnerUser);
    setIsOwnerAuthenticated(true);
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateOwnerUser = (patch: Partial<OwnerUser>) => {
    setOwnerUser((u) => ({ ...u, ...patch }));
    if (!authUserId) return;
    const dbPatch: Record<string, string> = {};
    if (patch.fullName !== undefined) {
      const [firstName, ...rest] = patch.fullName.trim().split(/\s+/).filter(Boolean);
      dbPatch.first_name = firstName ?? "";
      dbPatch.last_name = rest.join(" ");
    }
    if (patch.phone !== undefined) dbPatch.phone = patch.phone;
    if (patch.avatar !== undefined) dbPatch.avatar = patch.avatar;
    if (Object.keys(dbPatch).length > 0) {
      supabase.from("profiles").update(dbPatch).eq("id", authUserId).then();
    }
  };

  const updateDraft = (patch: Partial<ListingDraft>) => setLocal((s) => ({ ...s, draft: { ...s.draft, ...patch } }));
  const resetDraft = () => setLocal((s) => ({ ...s, draft: emptyDraft }));

  const submitDraft = async () => {
    if (!authUserId) throw new Error("Vous devez être connecté pour publier une annonce.");
    const id = await submitListing(local.draft, {
      id: authUserId,
      name: ownerUser.fullName,
      phone: ownerUser.phone,
      email: ownerUser.email,
      avatarImg: ownerUser.avatar,
      memberSince: ownerUser.memberSince,
    });
    setLocal((s) => ({ ...s, draft: emptyDraft }));
    return id;
  };

  const value = useMemo<OwnerContextValue>(
    () => ({
      isOwnerAuthenticated,
      authLoading,
      ownerId: authUserId,
      ownerUser,
      draft: local.draft,
      sendOtp,
      verifyOtp,
      logout,
      updateOwnerUser,
      updateDraft,
      resetDraft,
      submitDraft,
    }),
    [isOwnerAuthenticated, authLoading, ownerUser, local, authUserId],
  );

  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
}

export function useOwner() {
  const ctx = useContext(OwnerContext);
  if (!ctx) throw new Error("useOwner must be used within OwnerProvider");
  return ctx;
}
