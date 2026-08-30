import { PACKS } from "../_lib/packs.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const reference = req.query?.reference;
  if (!reference || typeof reference !== "string") {
    res.status(400).json({ error: "Référence manquante" });
    return;
  }

  const apikey = process.env.CINETPAY_API_KEY;
  const siteId = process.env.CINETPAY_SITE_ID;
  if (!apikey || !siteId) {
    res.status(500).json({ error: "Configuration CinetPay manquante côté serveur" });
    return;
  }

  // The packId is derived from OUR OWN reference ("sh-<packId>-...") which we
  // generated at initialize time and CinetPay only ever echoes back verbatim
  // as transaction_id — never from anything the browser sent directly.
  const packId = reference.split("-")[1];
  const pack = PACKS[packId];

  try {
    const cinetRes = await fetch("https://api-checkout.cinetpay.com/v2/payment/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apikey, site_id: siteId, transaction_id: reference }),
    });
    const data = await cinetRes.json();
    const charge = data?.data;

    if (!cinetRes.ok || !pack) {
      res.status(200).json({ success: false, status: "not_found", raw: charge });
      return;
    }

    if (data?.code !== "00" || charge?.status !== "ACCEPTED") {
      res.status(200).json({ success: false, status: charge?.status || data?.message || "unknown" });
      return;
    }

    if (Number(charge.amount) !== pack.price) {
      res.status(200).json({ success: false, status: "amount_mismatch" });
      return;
    }

    res.status(200).json({
      success: true,
      packId,
      credits: pack.credits,
      price: pack.price,
      packName: pack.name,
    });
  } catch {
    res.status(500).json({ error: "Erreur serveur lors de la vérification du paiement" });
  }
}
