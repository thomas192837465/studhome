import { getServiceClient } from "../_lib/adminAuth.js";

// Checks a one-time SMS code issued by send-code.js against the
// phone_verifications table. Returns only a boolean success — never reveals
// whether the reason for failure was a wrong code, an expired one, or no
// code at all, since that distinction isn't useful to a client trying to
// brute-force a code.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const { phone, code } = req.body || {};
  if (!phone || !code) {
    res.status(400).json({ error: "Numéro et code requis" });
    return;
  }

  try {
    const serviceClient = getServiceClient();
    const { data } = await serviceClient
      .from("phone_verifications")
      .select("id, code, expires_at")
      .eq("phone", phone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const expired = data ? new Date(data.expires_at).getTime() < Date.now() : true;
    const matches = data ? data.code === String(code) : false;

    if (!data || expired || !matches) {
      res.status(200).json({ success: false });
      return;
    }

    // Consume it — a code can only be used once.
    await serviceClient.from("phone_verifications").delete().eq("id", data.id);
    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur lors de la vérification du code" });
  }
}
