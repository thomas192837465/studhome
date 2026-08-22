import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AdminListing, AdminSession, PortalRole, Signalement } from "../data/adminTypes";
import { seedAdminListings, seedSignalements, seedTransactions, seedAdministrators, seedLogs } from "../data/adminSeed";

interface PersistedAdminState {
  session: AdminSession | null;
  listings: AdminListing[];
  signalements: Signalement[];
}

const STORAGE_KEY = "studhome-admin-state";

function loadState(): PersistedAdminState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedAdminState;
  } catch {
    // ignore
  }
  return { session: null, listings: seedAdminListings, signalements: seedSignalements };
}

interface AdminPortalContextValue {
  session: AdminSession | null;
  listings: AdminListing[];
  signalements: Signalement[];
  transactions: typeof seedTransactions;
  administrators: typeof seedAdministrators;
  logs: typeof seedLogs;
  login: (role: PortalRole, name?: string) => void;
  logout: () => void;
  publishListing: (id: string) => void;
  refuseListing: (id: string) => void;
  requestModification: (id: string, message: string, reason: string) => void;
  resolveSignalement: (id: string) => void;
  getListing: (id: string) => AdminListing | undefined;
}

const AdminPortalContext = createContext<AdminPortalContextValue | null>(null);

export function AdminPortalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedAdminState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = (role: PortalRole, name?: string) =>
    setState((s) => ({ ...s, session: { role, name: name ?? (role === "Super Admin" ? "Super Admin" : "Christian") } }));

  const logout = () => setState((s) => ({ ...s, session: null }));

  const publishListing = (id: string) =>
    setState((s) => ({
      ...s,
      listings: s.listings.map((l) => (l.id === id ? { ...l, status: "Publiée" } : l)),
    }));

  const refuseListing = (id: string) =>
    setState((s) => ({
      ...s,
      listings: s.listings.map((l) => (l.id === id ? { ...l, status: "Refusée" } : l)),
    }));

  const requestModification = (id: string, message: string, reason: string) =>
    setState((s) => ({
      ...s,
      listings: s.listings.map((l) =>
        l.id === id
          ? { ...l, status: "Modifications demandées", modificationMessage: message, modificationReason: reason }
          : l,
      ),
    }));

  const resolveSignalement = (id: string) =>
    setState((s) => ({
      ...s,
      signalements: s.signalements.map((sig) => (sig.id === id ? { ...sig, statut: "Résolu" } : sig)),
    }));

  const getListing = (id: string) => state.listings.find((l) => l.id === id);

  const value = useMemo<AdminPortalContextValue>(
    () => ({
      session: state.session,
      listings: state.listings,
      signalements: state.signalements,
      transactions: seedTransactions,
      administrators: seedAdministrators,
      logs: seedLogs,
      login,
      logout,
      publishListing,
      refuseListing,
      requestModification,
      resolveSignalement,
      getListing,
    }),
    [state],
  );

  return <AdminPortalContext.Provider value={value}>{children}</AdminPortalContext.Provider>;
}

export function useAdminPortal() {
  const ctx = useContext(AdminPortalContext);
  if (!ctx) throw new Error("useAdminPortal must be used within AdminPortalProvider");
  return ctx;
}
