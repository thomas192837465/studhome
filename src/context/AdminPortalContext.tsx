import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AdminSession, PortalRole, Signalement } from "../data/adminTypes";
import { seedSignalements, seedTransactions, seedLogs } from "../data/adminSeed";

interface PersistedAdminState {
  session: AdminSession | null;
  signalements: Signalement[];
}

const STORAGE_KEY = "studhome-admin-state-v2";

function loadState(): PersistedAdminState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedAdminState;
  } catch {
    // ignore
  }
  return { session: null, signalements: seedSignalements };
}

interface AdminPortalContextValue {
  session: AdminSession | null;
  signalements: Signalement[];
  transactions: typeof seedTransactions;
  logs: typeof seedLogs;
  login: (role: PortalRole, name?: string) => void;
  logout: () => void;
  resolveSignalement: (id: string) => void;
}

const AdminPortalContext = createContext<AdminPortalContextValue | null>(null);

export function AdminPortalProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedAdminState>(loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const login = (role: PortalRole, name?: string) =>
    setState((s) => ({ ...s, session: { role, name: name ?? role } }));

  const logout = () => setState((s) => ({ ...s, session: null }));

  const resolveSignalement = (id: string) =>
    setState((s) => ({
      ...s,
      signalements: s.signalements.map((sig) => (sig.id === id ? { ...sig, statut: "Résolu" } : sig)),
    }));

  const value = useMemo<AdminPortalContextValue>(
    () => ({
      session: state.session,
      signalements: state.signalements,
      transactions: seedTransactions,
      logs: seedLogs,
      login,
      logout,
      resolveSignalement,
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
