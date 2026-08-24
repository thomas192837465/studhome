import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Transaction, User } from "../data/types";
import { supabase } from "../lib/supabase";
import { makeReferralCode, type ProfileRow } from "../lib/profileMapper";

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
    role: "Etudiant",
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

// Not tied to the real account — kept local per browser for now, same as
// before real auth existed. Migrating these to per-account Supabase data is
// a separate piece of work.
interface LocalState {
  favorites: string[];
  unlockedListings: string[];
  transactions: Transaction[];
  credits: number;
}

const STORAGE_KEY = "studhome-state";

function loadLocalState(): LocalState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        favorites: parsed.favorites ?? [],
        unlockedListings: parsed.unlockedListings ?? [],
        transactions: parsed.transactions ?? [],
        credits: parsed.credits ?? 0,
      };
    }
  } catch {
    // ignore corrupted storage
  }
  return { favorites: [], unlockedListings: [], transactions: [], credits: 0 };
}

interface AppContextValue {
  isAuthenticated: boolean;
  authLoading: boolean;
  user: User;
  credits: number;
  favorites: string[];
  unlockedListings: string[];
  transactions: Transaction[];
  sendOtp: (email: string, meta?: { firstName?: string; lastName?: string }) => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (patch: Partial<User>) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  isUnlocked: (id: string) => boolean;
  unlockListing: (id: string, cost: number, label: string) => boolean;
  buyPack: (credits: number, price: number, packName: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [local, setLocal] = useState<LocalState>(loadLocalState);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  const [user, setUser] = useState<User>(emptyUser);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(local));
  }, [local]);

  useEffect(() => {
    let active = true;

    const applySession = async (session: { user: { id: string } } | null) => {
      if (!session?.user) {
        if (!active) return;
        setAuthUserId(null);
        setUser(emptyUser);
        setIsAuthenticated(false);
        setAuthLoading(false);
        return;
      }
      const profile = await fetchProfile(session.user.id);
      if (!active) return;
      setAuthUserId(session.user.id);
      setUser(profile ? profileToUser(profile) : emptyUser);
      setIsAuthenticated(true);
      setAuthLoading(false);
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const sendOtp = async (email: string, meta?: { firstName?: string; lastName?: string }) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        data: { first_name: meta?.firstName ?? "", last_name: meta?.lastName ?? "", role: "etudiant" },
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
    setAuthUserId(authUser.id);
    setUser(profile ? profileToUser(profile) : emptyUser);
    setIsAuthenticated(true);
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

  const toggleFavorite = (id: string) =>
    setLocal((s) => ({
      ...s,
      favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [...s.favorites, id],
    }));

  const isFavorite = (id: string) => local.favorites.includes(id);
  const isUnlocked = (id: string) => local.unlockedListings.includes(id);

  const unlockListing = (id: string, cost: number, label: string) => {
    if (local.unlockedListings.includes(id)) return true;
    if (local.credits < cost) return false;
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "Utilisation",
      description: `Contact propriétaire - ${label}`,
      credits: -cost,
      amount: 0,
      status: "Terminé",
    };
    setLocal((s) => ({
      ...s,
      credits: s.credits - cost,
      unlockedListings: [...s.unlockedListings, id],
      transactions: [tx, ...s.transactions],
    }));
    return true;
  };

  const buyPack = (credits: number, price: number, packName: string) => {
    const tx: Transaction = {
      id: `tx-${Date.now()}`,
      date: new Date().toLocaleString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: "Achat",
      description: `${packName} - ${credits} crédits`,
      credits,
      amount: price,
      status: "Terminé",
    };
    setLocal((s) => ({ ...s, credits: s.credits + credits, transactions: [tx, ...s.transactions] }));
  };

  const value = useMemo<AppContextValue>(
    () => ({
      isAuthenticated,
      authLoading,
      user,
      credits: local.credits,
      favorites: local.favorites,
      unlockedListings: local.unlockedListings,
      transactions: local.transactions,
      sendOtp,
      verifyOtp,
      logout,
      updateUser,
      toggleFavorite,
      isFavorite,
      isUnlocked,
      unlockListing,
      buyPack,
    }),
    [isAuthenticated, authLoading, user, local, authUserId],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
