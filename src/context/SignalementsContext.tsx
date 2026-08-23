import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { rowToSignalement, type SignalementRow } from "../lib/signalementsMapper";
import type { Signalement, SignalementStatus } from "../data/signalementTypes";

interface SignalementsContextValue {
  signalements: Signalement[];
  loading: boolean;
  submitSignalement: (
    listingId: string,
    listingTitle: string,
    reportedBy: string,
    reason: string,
    details: string,
  ) => Promise<void>;
  setSignalementStatus: (id: string, status: SignalementStatus) => Promise<void>;
  resolveSignalement: (id: string) => Promise<void>;
  deleteSignalement: (id: string) => Promise<void>;
}

const SignalementsContext = createContext<SignalementsContextValue | null>(null);

export function SignalementsProvider({ children }: { children: ReactNode }) {
  const [signalements, setSignalements] = useState<Signalement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSignalements = async () => {
    const { data, error } = await supabase
      .from("signalements")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setSignalements((data as SignalementRow[]).map(rowToSignalement));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchSignalements();

    const channel = supabase
      .channel("signalements-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "signalements" }, () => {
        fetchSignalements();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitSignalement = async (
    listingId: string,
    listingTitle: string,
    reportedBy: string,
    reason: string,
    details: string,
  ) => {
    const { error } = await supabase.from("signalements").insert({
      listing_id: listingId,
      listing_title: listingTitle,
      reported_by: reportedBy,
      reason,
      details,
      status: "Nouveau",
    });
    if (error) throw error;
    await fetchSignalements();
  };

  const setSignalementStatus = async (id: string, status: SignalementStatus) => {
    await supabase.from("signalements").update({ status }).eq("id", id);
    await fetchSignalements();
  };

  const resolveSignalement = (id: string) => setSignalementStatus(id, "Résolu");

  const deleteSignalement = async (id: string) => {
    await supabase.from("signalements").delete().eq("id", id);
    await fetchSignalements();
  };

  const value = useMemo<SignalementsContextValue>(
    () => ({
      signalements,
      loading,
      submitSignalement,
      setSignalementStatus,
      resolveSignalement,
      deleteSignalement,
    }),
    [signalements, loading],
  );

  return <SignalementsContext.Provider value={value}>{children}</SignalementsContext.Provider>;
}

export function useSignalements() {
  const ctx = useContext(SignalementsContext);
  if (!ctx) throw new Error("useSignalements must be used within SignalementsProvider");
  return ctx;
}
