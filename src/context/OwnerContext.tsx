import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { ListingDraft } from "../data/listingTypes";
import { emptyDraft } from "../data/listingTypes";
import type { OwnerUser } from "../data/ownerTypes";
import { defaultOwnerUser } from "../data/ownerSeed";
import { useListings } from "./ListingsContext";

interface PersistedOwnerState {
  isOwnerAuthenticated: boolean;
  ownerUser: OwnerUser;
  draft: ListingDraft;
}

const STORAGE_KEY = "studhome-owner-state-v2";

function loadState(): PersistedOwnerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedOwnerState;
  } catch {
    // ignore
  }
  return {
    isOwnerAuthenticated: false,
    ownerUser: defaultOwnerUser,
    draft: emptyDraft,
  };
}

interface OwnerContextValue {
  isOwnerAuthenticated: boolean;
  ownerUser: OwnerUser;
  draft: ListingDraft;
  login: (user?: Partial<OwnerUser>) => void;
  logout: () => void;
  updateOwnerUser: (patch: Partial<OwnerUser>) => void;
  updateDraft: (patch: Partial<ListingDraft>) => void;
  resetDraft: () => void;
  submitDraft: () => Promise<string>;
}

const OwnerContext = createContext<OwnerContextValue | null>(null);

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedOwnerState>(loadState);
  const { submitListing } = useListings();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = (user?: Partial<OwnerUser>) =>
    setState((s) => {
      const nextUser = { ...s.ownerUser, ...user };
      return { ...s, isOwnerAuthenticated: true, ownerUser: nextUser };
    });

  const logout = () => setState((s) => ({ ...s, isOwnerAuthenticated: false }));

  const updateOwnerUser = (patch: Partial<OwnerUser>) =>
    setState((s) => ({ ...s, ownerUser: { ...s.ownerUser, ...patch } }));

  const updateDraft = (patch: Partial<ListingDraft>) =>
    setState((s) => ({ ...s, draft: { ...s.draft, ...patch } }));

  const resetDraft = () => setState((s) => ({ ...s, draft: emptyDraft }));

  const submitDraft = async () => {
    const owner = state.ownerUser;
    const id = await submitListing(state.draft, {
      id: owner.phone,
      name: owner.fullName,
      phone: owner.phone,
      avatarImg: owner.avatar,
      memberSince: owner.memberSince ?? new Date().toISOString(),
    });
    setState((s) => ({ ...s, draft: emptyDraft }));
    return id;
  };

  const value = useMemo<OwnerContextValue>(
    () => ({
      isOwnerAuthenticated: state.isOwnerAuthenticated,
      ownerUser: state.ownerUser,
      draft: state.draft,
      login,
      logout,
      updateOwnerUser,
      updateDraft,
      resetDraft,
      submitDraft,
    }),
    [state],
  );

  return <OwnerContext.Provider value={value}>{children}</OwnerContext.Provider>;
}

export function useOwner() {
  const ctx = useContext(OwnerContext);
  if (!ctx) throw new Error("useOwner must be used within OwnerProvider");
  return ctx;
}
