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

  const apikey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;
  if (!apikey || !siteId) {
    res.status(500).json({ error: "Configuration CinetPay manquante côté serveur" });
    return;
  }

  const reference = `sh-${packId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const origin = `https://${req.headers.host}`;
  const [customerName, ...rest] = (name || "Étudiant StudHome").trim().split(" ");

  try {
    const cinetRes = await fetch("https://api-checkout.cinetpay.com/v2/payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        apikey,
        site_id: siteId,
        transaction_id: reference,
        amount: pack.price,
        currency: "XAF",
        description: `${pack.name} - ${pack.credits} crédits`,
        customer_name: customerName || "Étudiant",
        customer_surname: rest.join(" ") || "StudHome",
        customer_email: email,
        customer_phone_number: phone || "600000000",
        // CinetPay's own dashboard hosts choose the wording of "return_url" vs
        // "notify_url" — the transaction_id is OUR reference, generated above,
        // so we embed it in the return_url ourselves rather than relying on
        // CinetPay to echo it back verbatim (unlike KoraPay, it doesn't).
        return_url: `${origin}/credits/paiement/retour?provider=cinetpay&reference=${reference}`,
        notify_url: `${origin}/api/cinetpay/verify?reference=${reference}`,
        channels: "ALL",
      }),
    });

    const data = await cinetRes.json();
    const checkoutUrl = data?.data?.payment_url;

    if (!cinetRes.ok || data?.code !== "201" || !checkoutUrl) {
      res.status(502).json({ error: data?.message || "Échec de l'initialisation du paiement CinetPay", raw: data });
      return;
    }

    res.status(200).json({ checkoutUrl, reference });
  } catch {
    res.status(500).json({ error: "Erreur serveur lors de l'appel à CinetPay" });
  }
}
