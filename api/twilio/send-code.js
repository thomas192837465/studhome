import { getServiceClient } from "../_lib/adminAuth.js";

const CODE_TTL_MS = 5 * 60 * 1000;

// Sends a one-time WhatsApp verification code via Twilio. Twilio Verify
// would normally handle code generation/expiry/storage for us, but creating
// a Verify Service is gated behind an account upgrade on trial accounts —
// so this generates and tracks the code itself in the phone_verifications
// table instead.
//
// Two delivery modes, picked automatically:
//  - TWILIO_WHATSAPP_CONTENT_SID set: sends the approved "authentication"
//    Content Template required for business-initiated WhatsApp messages in
//    production (Meta rejects freeform text outside a 24h customer window).
//  - not set: sends a freeform Body message, which only WhatsApp Sandbox
//    numbers accept — good enough for local/dev testing before a template
//    is approved.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const { phone } = req.body || {};
  if (!phone || !phone.startsWith("+")) {
    res.status(400).json({ error: "Numéro de téléphone invalide (format international requis, ex: +237...)" });
    return;
  }

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const rawFrom = process.env.TWILIO_WHATSAPP_FROM_NUMBER;
  const contentSid = process.env.TWILIO_WHATSAPP_CONTENT_SID;
  if (!accountSid || !authToken || !rawFrom) {
    res.status(500).json({ error: "Configuration Twilio WhatsApp manquante côté serveur" });
    return;
  }
  const fromNumber = rawFrom.startsWith("whatsapp:") ? rawFrom : `whatsapp:${rawFrom}`;

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
    const params = { To: `whatsapp:${phone}`, From: fromNumber };
    if (contentSid) {
      params.ContentSid = contentSid;
      params.ContentVariables = JSON.stringify({ "1": code });
    } else {
      params.Body = `Votre code de vérification StudHome : ${code}`;
    }

    const twilioRes = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(params).toString(),
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
