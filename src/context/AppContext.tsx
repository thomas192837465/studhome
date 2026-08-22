import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Transaction, User } from "../data/types";
import { defaultCredits, defaultUser, seedTransactions } from "../data/seed";

interface PersistedState {
  isAuthenticated: boolean;
  user: User;
  credits: number;
  favorites: string[];
  unlockedListings: string[];
  transactions: Transaction[];
}

const STORAGE_KEY = "studhome-state";

function loadState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedState;
  } catch {
    // ignore corrupted storage
  }
  return {
    isAuthenticated: false,
    user: defaultUser,
    credits: defaultCredits,
    favorites: [],
    unlockedListings: [],
    transactions: seedTransactions,
  };
}

interface AppContextValue {
  isAuthenticated: boolean;
  user: User;
  credits: number;
  favorites: string[];
  unlockedListings: string[];
  transactions: Transaction[];
  login: () => void;
  logout: () => void;
  updateUser: (patch: Partial<User>) => void;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  isUnlocked: (id: string) => boolean;
  unlockListing: (id: string, cost: number, label: string) => boolean;
  buyPack: (credits: number, price: number, packName: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = () => setState((s) => ({ ...s, isAuthenticated: true }));
  const logout = () => setState((s) => ({ ...s, isAuthenticated: false }));

  const updateUser = (patch: Partial<User>) =>
    setState((s) => ({ ...s, user: { ...s.user, ...patch } }));

  const toggleFavorite = (id: string) =>
    setState((s) => ({
      ...s,
      favorites: s.favorites.includes(id)
        ? s.favorites.filter((f) => f !== id)
        : [...s.favorites, id],
    }));

  const isFavorite = (id: string) => state.favorites.includes(id);
  const isUnlocked = (id: string) => state.unlockedListings.includes(id);

  const unlockListing = (id: string, cost: number, label: string) => {
    if (state.unlockedListings.includes(id)) return true;
    if (state.credits < cost) return false;
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
    setState((s) => ({
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
    setState((s) => ({
      ...s,
      credits: s.credits + credits,
      transactions: [tx, ...s.transactions],
    }));
  };

  const value = useMemo<AppContextValue>(
    () => ({
      isAuthenticated: state.isAuthenticated,
      user: state.user,
      credits: state.credits,
      favorites: state.favorites,
      unlockedListings: state.unlockedListings,
      transactions: state.transactions,
      login,
      logout,
      updateUser,
      toggleFavorite,
      isFavorite,
      isUnlocked,
      unlockListing,
      buyPack,
    }),
    [state],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
