import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ListingDraft } from "../data/listingTypes";
import { emptyDraft } from "../data/listingTypes";
import type { OwnerUser } from "../data/ownerTypes";
import { supabase } from "../lib/supabase";
import type { ProfileRow } from "../lib/profileMapper";
import { useListings } from "./ListingsContext";
import { isTwoFactorVerifiedForSession, markTwoFactorVerifiedForSession, type TwoFactorMethod } from "../lib/twoFactor";

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
  mfaPending: boolean;
  mfaMethod: TwoFactorMethod | null;
  mfaIdentifier: string;
  ownerId: string | null;
  ownerUser: OwnerUser;
  draft: ListingDraft;
  signup: (
    email: string,
    password: string,
    meta: { fullName: string },
    verified: { method: TwoFactorMethod; identifier: string },
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  completeMfaChallenge: () => Promise<void>;
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
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<TwoFactorMethod | null>(null);
  const [mfaIdentifier, setMfaIdentifier] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [ownerUser, setOwnerUser] = useState<OwnerUser>(emptyOwnerUser);
  const { submitListing } = useListings();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  }, [local]);

  const applyAuthenticatedUser = (userId: string, profile: ProfileRow) => {
    setAuthUserId(userId);
    setOwnerUser(profileToOwnerUser(profile));
    setIsOwnerAuthenticated(true);
    setMfaPending(false);
    setPendingUserId(null);
    setMfaMethod(null);
    setMfaIdentifier("");
  };

  // Decides, from an already-fetched "proprietaire" profile, whether the
  // custom 2FA challenge (SMS or email, via our own endpoints) is still owed
  // for this browser session before granting owner access.
  const finalizeAuth = (userId: string, profile: ProfileRow) => {
    if (profile.two_factor_method && !isTwoFactorVerifiedForSession(userId)) {
      setPendingUserId(userId);
      setMfaMethod(profile.two_factor_method);
      setMfaIdentifier(profile.two_factor_method === "email" ? profile.email ?? "" : profile.phone);
      setMfaPending(true);
      return;
    }
    applyAuthenticatedUser(userId, profile);
  };

  useEffect(() => {
    let active = true;

    const applySession = async (session: { user: { id: string } } | null) => {
      if (!session?.user) {
        if (!active) return;
        setAuthUserId(null);
        setOwnerUser(emptyOwnerUser);
        setIsOwnerAuthenticated(false);
        setMfaPending(false);
        setMfaMethod(null);
        setMfaIdentifier("");
        setPendingUserId(null);
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
        setMfaPending(false);
        setMfaMethod(null);
        setMfaIdentifier("");
        setPendingUserId(null);
        setAuthLoading(false);
        return;
      }
      finalizeAuth(session.user.id, profile);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Called only after the caller (OwnerSignup.tsx) has already sent and
  // verified a code for `verified.identifier` via our own endpoints — the
  // account itself is created here for the first time, so an abandoned
  // signup never leaves a real account behind without 2FA proven.
  const signup = async (
    email: string,
    password: string,
    meta: { fullName: string },
    verified: { method: TwoFactorMethod; identifier: string },
  ) => {
    const [firstName, ...rest] = meta.fullName.trim().split(/\s+/).filter(Boolean);
    const phone = verified.method === "sms" ? verified.identifier : "";
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName ?? "", last_name: rest.join(" "), phone, role: "proprietaire" },
      },
    });
    if (error) throw error;
    if (!data.session || !data.user) {
      // Supabase only returns a session immediately when "Confirm email" is
      // disabled — required here since identity is verified by SMS/email
      // instead.
      throw new Error(
        "La confirmation par email est encore activée côté Supabase (Authentication > Sign In / Providers > Email). Désactivez-la pour une inscription uniquement par téléphone/email.",
      );
    }
    const patch: Record<string, string> = { two_factor_method: verified.method };
    if (verified.method === "sms") patch.phone = verified.identifier;
    const { error: updateError } = await supabase.from("profiles").update(patch).eq("id", data.user.id);
    if (updateError) throw updateError;
    markTwoFactorVerifiedForSession(data.user.id);
    const profile = await fetchProfile(data.user.id);
    if (!profile) throw new Error("Erreur lors de la création du compte, réessayez.");
    finalizeAuth(data.user.id, profile);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Email ou mot de passe incorrect.");
    const authUser = data.user;
    if (!authUser) throw new Error("Connexion impossible, réessayez.");
    const profile = await fetchProfile(authUser.id);
    if (!profile || profile.role !== "proprietaire") {
      // Don't sign out — this could be a valid student session that just
      // tried the wrong login form.
      throw new Error("Aucun compte propriétaire trouvé avec ces identifiants.");
    }
    finalizeAuth(authUser.id, profile);
  };

  const completeMfaChallenge = async () => {
    if (!pendingUserId) return;
    markTwoFactorVerifiedForSession(pendingUserId);
    const profile = await fetchProfile(pendingUserId);
    if (profile) applyAuthenticatedUser(pendingUserId, profile);
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
      mfaPending,
      mfaMethod,
      mfaIdentifier,
      ownerId: authUserId,
      ownerUser,
      draft: local.draft,
      signup,
      login,
      completeMfaChallenge,
      logout,
      updateOwnerUser,
      updateDraft,
      resetDraft,
      submitDraft,
    }),
    [
      isOwnerAuthenticated,
      authLoading,
      mfaPending,
      mfaMethod,
      mfaIdentifier,
      ownerUser,
      local,
      authUserId,
      pendingUserId,
    ],
  );

  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
}

export function useOwner() {
  const ctx = useContext(OwnerContext);
  if (!ctx) throw new Error("useOwner must be used within OwnerProvider");
  return ctx;
}
