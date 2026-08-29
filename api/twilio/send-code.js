import { getServiceClient } from "../_lib/adminAuth.js";

const CODE_TTL_MS = 5 * 60 * 1000;

// Sends a one-time SMS verification code via Twilio's plain Messaging API.
// Twilio Verify would normally handle code generation/expiry/storage for
// us, but creating a Verify Service is gated behind an account upgrade on
// trial accounts — so this generates and tracks the code itself in the
// phone_verifications table instead.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const { phone } = req.body || {};
  if (!phone) {
    res.status(400).json({ error: "Numéro de téléphone requis" });
    return;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;
  if (!accountSid || !authToken || !fromNumber) {
    res.status(500).json({ error: "Configuration Twilio manquante côté serveur" });
    return;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  try {
    const serviceClient = getServiceClient();
    // Drop any earlier unused code for this number before issuing a new one.
    await serviceClient.from("phone_verifications").delete().eq("phone", phone);
    const { error: insertError } = await serviceClient
      .from("phone_verifications")
      .insert({ phone, code, expires_at: expiresAt });
    if (insertError) throw insertError;

    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const body = new URLSearchParams({
      To: phone,
      From: fromNumber,
      Body: `Votre code de vérification StudHome : ${code}`,
    });
    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    const data = await twilioRes.json();

    if (!twilioRes.ok) {
      res.status(400).json({ error: data.message || "Impossible d'envoyer le code" });
      return;
    }

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur lors de l'envoi du code" });
  }
}
