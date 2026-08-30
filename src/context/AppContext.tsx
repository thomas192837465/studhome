import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Transaction, User } from "../data/types";
import { supabase } from "../lib/supabase";
import { makeReferralCode, type ProfileRow } from "../lib/profileMapper";
import { rowToTransaction, type TransactionRow } from "../lib/transactionMapper";
import { isTwoFactorVerifiedForSession, markTwoFactorVerifiedForSession, type TwoFactorMethod } from "../lib/twoFactor";

const emptyUser: User = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  university: "",
  bio: "",
  avatar: "",
  role: "Etudiant",
  referralCode: "",
};

function profileToUser(row: ProfileRow): User {
  return {
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email ?? "",
    phone: row.phone,
    city: row.city,
    university: row.university,
    bio: row.bio,
    avatar: row.avatar,
    role: row.role === "proprietaire" ? "Propriétaire" : "Etudiant",
    referralCode: row.referral_code || makeReferralCode(row.first_name),
  };
}

async function fetchProfile(id: string): Promise<ProfileRow | null> {
  // The profile row is inserted by a DB trigger right after the auth user is
  // created, in the same transaction — this retry only guards against the
  // rare case where our read races that insert by a beat.
  for (let attempt = 0; attempt < 4; attempt++) {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", id).maybeSingle();
    if (data) return data as ProfileRow;
    if (error) break;
    await new Promise((r) => setTimeout(r, 350));
  }
  return null;
}

interface AppContextValue {
  isAuthenticated: boolean;
  authLoading: boolean;
  mfaPending: boolean;
  mfaMethod: TwoFactorMethod | null;
  mfaIdentifier: string;
  user: User;
  credits: number;
  favorites: string[];
  unlockedListings: string[];
  transactions: Transaction[];
  signup: (
    email: string,
    password: string,
    meta: { firstName: string; lastName: string },
    verified: { method: TwoFactorMethod; identifier: string },
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  completeMfaChallenge: () => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  isUnlocked: (id: string) => boolean;
  unlockListing: (id: string, cost: number, label: string) => Promise<boolean>;
  buyPack: (credits: number, price: number, packName: string, paymentMethod?: string) => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mfaPending, setMfaPending] = useState(false);
  const [mfaMethod, setMfaMethod] = useState<TwoFactorMethod | null>(null);
  const [mfaIdentifier, setMfaIdentifier] = useState("");
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User>(emptyUser);
  const [credits, setCredits] = useState(0);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [unlockedListings, setUnlockedListings] = useState<string[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const fetchAccountData = async (userId: string) => {
    const [favRes, unlockRes, txRes] = await Promise.all([
      supabase.from("favorites").select("listing_id").eq("user_id", userId),
      supabase.from("unlocked_listings").select("listing_id").eq("user_id", userId),
      supabase.from("credit_transactions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
    ]);
    setFavorites((favRes.data ?? []).map((r) => r.listing_id as string));
    setUnlockedListings((unlockRes.data ?? []).map((r) => r.listing_id as string));
    setTransactions(((txRes.data ?? []) as TransactionRow[]).map(rowToTransaction));
  };

  const applyAuthenticatedUser = async (userId: string, profile: ProfileRow | null) => {
    setAuthUserId(userId);
    setUser(profile ? profileToUser(profile) : emptyUser);
    setCredits(profile?.credits ?? 0);
    setIsAuthenticated(true);
    setMfaPending(false);
    setPendingUserId(null);
    setMfaMethod(null);
    setMfaIdentifier("");
    await fetchAccountData(userId);
  };

  // Single entry point after any successful primary auth (signup, login, or
  // session restore on page load): fetches the profile once and decides
  // whether the custom 2FA challenge (SMS or email, via our own endpoints)
  // is still owed for this browser session.
  const finalizeAuth = async (userId: string) => {
    const profile = await fetchProfile(userId);
    if (profile?.two_factor_method && !isTwoFactorVerifiedForSession(userId)) {
      setPendingUserId(userId);
      setMfaMethod(profile.two_factor_method);
      setMfaIdentifier(profile.two_factor_method === "email" ? profile.email ?? "" : profile.phone);
      setMfaPending(true);
      return;
    }
    await applyAuthenticatedUser(userId, profile);
  };

  useEffect(() => {
    let active = true;

    const applySession = async (session: { user: { id: string } } | null) => {
      if (!session?.user) {
        if (!active) return;
        setAuthUserId(null);
        setUser(emptyUser);
        setCredits(0);
        setFavorites([]);
        setUnlockedListings([]);
        setTransactions([]);
        setIsAuthenticated(false);
        setMfaPending(false);
        setMfaMethod(null);
        setMfaIdentifier("");
        setPendingUserId(null);
        setAuthLoading(false);
        return;
      }
      await finalizeAuth(session.user.id);
      if (!active) return;
      setAuthLoading(false);
    };

    // Deliberately not also calling getSession() here: it can resolve with a
    // stale/null session before the client has finished loading the stored
    // one, which would flip authLoading to false too early and let a guard
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

  // Called only after the caller (Login.tsx) has already sent and verified a
  // code for `verified.identifier` via our own SMS/email endpoints — the
  // account itself is created here for the first time, so an abandoned
  // signup never leaves a real account behind without 2FA proven.
  const signup = async (
    email: string,
    password: string,
    meta: { firstName: string; lastName: string },
    verified: { method: TwoFactorMethod; identifier: string },
  ) => {
    const phone = verified.method === "sms" ? verified.identifier : "";
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { first_name: meta.firstName, last_name: meta.lastName, phone, role: "etudiant" },
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
    await finalizeAuth(data.user.id);
  };

  const login = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Email ou mot de passe incorrect.");
    if (!data.user) throw new Error("Connexion impossible, réessayez.");
    await finalizeAuth(data.user.id);
  };

  const completeMfaChallenge = async () => {
    if (!pendingUserId) return;
    markTwoFactorVerifiedForSession(pendingUserId);
    await applyAuthenticatedUser(pendingUserId, await fetchProfile(pendingUserId));
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const updateUser = (patch: Partial<User>) => {
    setUser((u) => ({ ...u, ...patch }));
    if (!authUserId) return;
    const dbPatch: Record<string, string> = {};
    if (patch.firstName !== undefined) dbPatch.first_name = patch.firstName;
    if (patch.lastName !== undefined) dbPatch.last_name = patch.lastName;
    if (patch.email !== undefined) dbPatch.email = patch.email;
    if (patch.phone !== undefined) dbPatch.phone = patch.phone;
    if (patch.city !== undefined) dbPatch.city = patch.city;
    if (patch.university !== undefined) dbPatch.university = patch.university;
    if (patch.bio !== undefined) dbPatch.bio = patch.bio;
    if (patch.avatar !== undefined) dbPatch.avatar = patch.avatar;
    if (Object.keys(dbPatch).length > 0) {
      supabase.from("profiles").update(dbPatch).eq("id", authUserId).then();
    }
  };

  const toggleFavorite = (id: string) => {
    if (!authUserId) return;
    const isFav = favorites.includes(id);
    if (isFav) {
      setFavorites((f) => f.filter((x) => x !== id));
      supabase.from("favorites").delete().eq("user_id", authUserId).eq("listing_id", id).then();
    } else {
      setFavorites((f) => [...f, id]);
      supabase.from("favorites").insert({ user_id: authUserId, listing_id: id }).then();
    }
  };

  const isFavorite = (id: string) => favorites.includes(id);
  const isUnlocked = (id: string) => unlockedListings.includes(id);

  const unlockListing = async (id: string, cost: number, label: string): Promise<boolean> => {
    if (unlockedListings.includes(id)) return true;
    if (!authUserId) return false;
    const { data, error } = await supabase.rpc("unlock_listing", {
      p_listing_id: id,
      p_cost: cost,
      p_label: label,
    });
    if (error || !data) return false;
    setUnlockedListings((u) => [...u, id]);
    setCredits((c) => c - cost);
    await fetchAccountData(authUserId);
    return true;
  };

  const buyPack = async (creditsAmount: number, price: number, packName: string, paymentMethod = "KoraPay") => {
    if (!authUserId) return;
    const { error } = await supabase.rpc("buy_credits", {
      p_credits: creditsAmount,
      p_amount: price,
      p_pack_name: packName,
      p_payment_method: paymentMethod,
    });
    if (error) throw error;
    setCredits((c) => c + creditsAmount);
    await fetchAccountData(authUserId);
  };

  const value = useMemo<AppContextValue>(
    () => ({
      isAuthenticated,
      authLoading,
      mfaPending,
      mfaMethod,
      mfaIdentifier,
      user,
      credits,
      favorites,
      unlockedListings,
      transactions,
      signup,
      login,
      completeMfaChallenge,
      logout,
      updateUser,
      toggleFavorite,
      isFavorite,
      isUnlocked,
      unlockListing,
      buyPack,
    }),
    [
      isAuthenticated,
      authLoading,
      mfaPending,
      mfaMethod,
      mfaIdentifier,
      user,
      credits,
      favorites,
      unlockedListings,
      transactions,
      authUserId,
      pendingUserId,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
