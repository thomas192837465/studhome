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

  const secretKey = process.env.KORAPAY_SECRET_KEY;
  if (!secretKey) {
    res.status(500).json({ error: "Configuration KoraPay manquante côté serveur" });
    return;
  }

  try {
    const koraRes = await fetch(`https://api.korapay.com/merchant/api/v1/charges/${encodeURIComponent(reference)}`, {
      headers: { Authorization: `Bearer ${secretKey}` },
    });
    const data = await koraRes.json();
    const charge = data?.data;

    // The packId is derived from OUR OWN reference ("sh-<packId>-...") as
    // echoed back inside KoraPay's verified charge record — never from
    // anything the browser sent directly, so it can't be tampered with.
    const merchantReference = charge?.reference || "";
    const packId = merchantReference.split("-")[1];
    const pack = PACKS[packId];

    if (!koraRes.ok || !data?.status || !pack) {
      res.status(200).json({ success: false, status: "not_found", raw: charge });
      return;
    }

    if (charge.status !== "success") {
      res.status(200).json({ success: false, status: charge.status || "unknown" });
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
