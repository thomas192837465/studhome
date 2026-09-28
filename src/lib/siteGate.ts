import { supabase } from "./supabase";

const STORAGE_KEY = "studhome-site-unlocked";

export function isUnlockedLocally(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markUnlockedLocally() {
  try {
    localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore — worst case the gate re-prompts next load
  }
}

export async function isSiteGateEnabled(): Promise<boolean> {
  const { data, error } = await supabase.rpc("is_site_gate_enabled");
  if (error) return false; // fail-open rather than lock everyone out on a backend hiccup
  return !!data;
}

export async function checkSitePassword(password: string): Promise<boolean> {
  const { data, error } = await supabase.rpc("check_site_password", { p_password: password });
  if (error) return false;
  return !!data;
}

export async function setSitePassword(password: string): Promise<void> {
  const { error } = await supabase.rpc("set_site_password", { p_password: password });
  if (error) throw error;
}

export async function disableSiteGate(): Promise<void> {
  const { error } = await supabase.rpc("disable_site_gate");
  if (error) throw error;
}
