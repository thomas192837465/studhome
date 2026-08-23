import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AdminSession, PortalRole } from "../data/adminTypes";
import { seedTransactions, seedLogs } from "../data/adminSeed";

interface PersistedAdminState {
  session: AdminSession | null;
}

const STORAGE_KEY = "studhome-admin-state-v2";

function loadState(): PersistedAdminState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PersistedAdminState;
  } catch {
    // ignore
  }
  return { session: null };
}

interface AdminPortalContextValue {
  session: AdminSession | null;
  transactions: typeof seedTransactions;
  logs: typeof seedLogs;
  login: (role: PortalRole, name?: string) => void;
  logout: () => void;
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

  const value = useMemo<AdminPortalContextValue>(
    () => ({
      session: state.session,
      transactions: seedTransactions,
      logs: seedLogs,
      login,
      logout,
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
