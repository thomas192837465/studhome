import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { OwnerDraft, OwnerListing, OwnerUser } from "../data/ownerTypes";
import { emptyDraft } from "../data/ownerTypes";
import { defaultOwnerUser, seedOwnerListings } from "../data/ownerSeed";

interface PersistedOwnerState {
  isOwnerAuthenticated: boolean;
  ownerUser: OwnerUser;
  listings: OwnerListing[];
  draft: OwnerDraft;
}

const STORAGE_KEY = "studhome-owner-state";

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
    listings: seedOwnerListings,
    draft: emptyDraft,
  };
}

interface OwnerContextValue {
  isOwnerAuthenticated: boolean;
  ownerUser: OwnerUser;
  listings: OwnerListing[];
  draft: OwnerDraft;
  login: (user?: Partial<OwnerUser>) => void;
  logout: () => void;
  updateDraft: (patch: Partial<OwnerDraft>) => void;
  resetDraft: () => void;
  submitDraft: () => string;
  getListing: (id: string) => OwnerListing | undefined;
}

const OwnerContext = createContext<OwnerContextValue | null>(null);

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedOwnerState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = (user?: Partial<OwnerUser>) =>
    setState((s) => ({ ...s, isOwnerAuthenticated: true, ownerUser: { ...s.ownerUser, ...user } }));

  const logout = () => setState((s) => ({ ...s, isOwnerAuthenticated: false }));

  const updateDraft = (patch: Partial<OwnerDraft>) =>
    setState((s) => ({ ...s, draft: { ...s.draft, ...patch } }));

  const resetDraft = () => setState((s) => ({ ...s, draft: emptyDraft }));

  const submitDraft = () => {
    const id = `own-${Date.now()}`;
    const d = state.draft;
    const newListing: OwnerListing = {
      id,
      title: `${d.type || "Logement"} meublé à ${d.quartier || d.ville}`,
      city: d.ville,
      quartier: d.quartier,
      price: Number(d.loyer) || 0,
      status: "En attente de vérification",
      submittedDate: new Date().toLocaleDateString("fr-FR"),
      image: seedOwnerListings[0].image,
      universities: d.universities,
      description: d.description,
      equipements: d.equipements,
      type: d.type,
      views: 0,
      favorites: 0,
      unlocks: 0,
      performance: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    };
    setState((s) => ({ ...s, listings: [newListing, ...s.listings], draft: emptyDraft }));
    return id;
  };

  const getListing = (id: string) => state.listings.find((l) => l.id === id);

  const value = useMemo<OwnerContextValue>(
    () => ({
      isOwnerAuthenticated: state.isOwnerAuthenticated,
      ownerUser: state.ownerUser,
      listings: state.listings,
      draft: state.draft,
      login,
      logout,
      updateDraft,
      resetDraft,
      submitDraft,
      getListing,
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
