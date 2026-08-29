import { PACKS } from "../_lib/packs.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const { packId, name, email } = req.body || {};
  const pack = PACKS[packId];
  if (!pack) {
    res.status(400).json({ error: "Pack inconnu" });
    return;
  }
  if (!email) {
    res.status(400).json({ error: "Email requis" });
    return;
  }

  const secretKey = process.env.KORAPAY_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Configuration KoraPay manquante côté serveur" });
    return;
  }

  const reference = `sh-${packId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const origin = `https://${req.headers.host}`;

  try {
    const koraRes = await fetch("https://api.korapay.com/merchant/api/v1/charges/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: pack.price,
        currency: "XAF",
        reference,
        customer: { name: name || "Étudiant StudHome", email },
        // KoraPay redirects the customer back here with "?reference=<ours>"
        // appended — unlike NotchPay it echoes our own reference verbatim,
        // so no separate query param juggling is needed.
        redirect_url: `${origin}/credits/paiement/retour`,
        narration: `${pack.name} - ${pack.credits} crédits`,
        channels: ["mobile_money", "card"],
      }),
    });

    const data = await koraRes.json();
    const checkoutUrl = data?.data?.checkout_url;

    if (!koraRes.ok || !data?.status || !checkoutUrl) {
      res.status(502).json({ error: data?.message || "Échec de l'initialisation du paiement KoraPay", raw: data });
      return;
    }

    res.status(200).json({ checkoutUrl, reference });
  } catch {
    res.status(500).json({ error: "Erreur serveur lors de l'appel à KoraPay" });
  }
}
