import { createClient } from "@supabase/supabase-js";

// service_role client — server-only, never exposed to the browser bundle.
// Used to verify the caller's identity/role and to perform privileged auth
// admin operations (invite, delete user) that the anon key cannot do.
export function getServiceClient() {
  const url = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Configuration Supabase manquante côté serveur");
  }
  return createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
}

// Verifies the bearer token in the request and that the caller's profile
// role is superadmin. Returns the caller's profile row, or null if not
// authorized — callers should respond 401/403 when this returns null.
export async function requireSuperadmin(req, serviceClient) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token) return null;

  const { data: userData, error: userError } = await serviceClient.auth.getUser(token);
  if (userError || !userData.user) return null;

  const { data: profile } = await serviceClient
    .from("profiles")
    .select("id, role, first_name, last_name, email")
    .eq("id", userData.user.id)
    .maybeSingle();

  if (!profile || profile.role !== "superadmin") return null;
  return profile;
}
