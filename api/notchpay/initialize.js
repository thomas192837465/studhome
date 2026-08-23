import { PACKS } from "../_lib/packs.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const { packId, name, email, phone } = req.body || {};
  const pack = PACKS[packId];
  if (!pack) {
    res.status(400).json({ error: "Pack inconnu" });
    return;
  }
  if (!email) {
    res.status(400).json({ error: "Email requis" });
    return;
  }

  const publicKey = process.env.NOTCHPAY_PUBLIC_KEY;
  if (!publicKey) {
    res.status(500).json({ error: "Configuration NotchPay manquante côté serveur" });
    return;
  }

  const reference = `sh-${packId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const origin = `https://${req.headers.host}`;
  const normalizedPhone = phone ? phone.replace(/[^\d]/g, "") : undefined;

  try {
    const notchRes = await fetch("https://api.notchpay.co/payments", {
      method: "POST",
      headers: {
        Authorization: publicKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: pack.price,
        currency: "XAF",
        customer: { name: name || "Étudiant StudHome", email, phone: normalizedPhone },
        description: `${pack.name} - ${pack.credits} crédits`,
        reference,
        // NotchPay appends its own "reference", "trxref", "notchpay_trxref" and
        // "status" params to this callback URL on redirect — using "ref" here
        // (not "reference") avoids a duplicate-key collision with theirs.
        callback: `${origin}/credits/paiement/retour?ref=${reference}`,
      }),
    });

    const data = await notchRes.json();
    const authorizationUrl = data?.authorization_url || data?.data?.authorization_url;

    if (!notchRes.ok || !authorizationUrl) {
      res.status(502).json({ error: data?.message || "Échec de l'initialisation du paiement NotchPay", raw: data });
      return;
    }

    res.status(200).json({ authorizationUrl, reference });
  } catch {
    res.status(500).json({ error: "Erreur serveur lors de l'appel à NotchPay" });
  }
}
