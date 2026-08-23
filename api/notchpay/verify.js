import { PACKS } from "../_lib/packs.js";

const SUCCESS_STATUSES = ["complete", "completed", "successful", "success", "paid"];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  // NotchPay's own transaction id (e.g. "trx.test_xxx"), found in the
  // "reference" param it appends to our callback redirect.
  const notchpayId = req.query?.reference;
  if (!notchpayId || typeof notchpayId !== "string") {
    res.status(400).json({ error: "Référence manquante" });
    return;
  }

  // Prefer the secret key (server-only, intended for this kind of lookup);
  // fall back to the public key, which NotchPay also accepts for retrieval.
  const authKey = process.env.NOTCHPAY_SECRET_KEY || process.env.NOTCHPAY_PUBLIC_KEY;
  if (!authKey) {
    res.status(500).json({ error: "Configuration NotchPay manquante côté serveur" });
    return;
  }

  try {
    const notchRes = await fetch(`https://api.notchpay.co/payments/${encodeURIComponent(notchpayId)}`, {
      headers: { Authorization: authKey },
    });
    const data = await notchRes.json();
    const payment = data?.transaction || data?.data || data;

    // The packId is derived from OUR OWN reference ("sh-<packId>-...") as
    // echoed back inside NotchPay's verified transaction record — never from
    // anything the browser sent directly, so it can't be tampered with.
    const merchantReference = payment?.merchant_reference || "";
    const packId = merchantReference.split("-")[1];
    const pack = PACKS[packId];

    if (!notchRes.ok || !pack) {
      res.status(200).json({ success: false, status: "not_found", raw: payment });
      return;
    }

    const status = payment?.status;
    const amount = payment?.amount;

    if (!SUCCESS_STATUSES.includes(status)) {
      res.status(200).json({ success: false, status: status || "unknown" });
      return;
    }

    if (Number(amount) !== pack.price) {
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
