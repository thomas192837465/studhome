import { getServiceClient } from "../_lib/adminAuth.js";

// Checks a one-time email code issued by send-code.js against the
// email_verifications table. Mirrors api/twilio/verify-code.js — returns
// only a boolean success, never revealing why a code failed.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const { email, code } = req.body || {};
  if (!email || !code) {
    res.status(400).json({ error: "Email et code requis" });
    return;
  }

  try {
    const serviceClient = getServiceClient();
    const { data } = await serviceClient
      .from("email_verifications")
      .select("id, code, expires_at")
      .eq("email", email)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const expired = data ? new Date(data.expires_at).getTime() < Date.now() : true;
    const matches = data ? data.code === String(code) : false;

    if (!data || expired || !matches) {
      res.status(200).json({ success: false });
      return;
    }

    await serviceClient.from("email_verifications").delete().eq("id", data.id);
    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur lors de la vérification du code" });
  }
}
