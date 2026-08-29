import { getServiceClient } from "../_lib/adminAuth.js";

const CODE_TTL_MS = 5 * 60 * 1000;

// Sends a one-time verification code by email via Brevo — the same
// transactional email provider already used for listing-status
// notifications (api/notify/listing-status.js). Mirrors
// api/twilio/send-code.js so email and SMS work as interchangeable 2FA
// channels from the client's point of view.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const { email } = req.body || {};
  if (!email) {
    res.status(400).json({ error: "Email requis" });
    return;
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "StudHome";
  if (!apiKey || !senderEmail) {
    res.status(500).json({ error: "Configuration email manquante côté serveur" });
    return;
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + CODE_TTL_MS).toISOString();

  try {
    const serviceClient = getServiceClient();
    await serviceClient.from("email_verifications").delete().eq("email", email);
    const { error: insertError } = await serviceClient
      .from("email_verifications")
      .insert({ email, code, expires_at: expiresAt });
    if (insertError) throw insertError;

    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email }],
        subject: "Votre code de vérification StudHome",
        htmlContent: `<p>Votre code de vérification StudHome est :</p><p style="font-size:24px; font-weight:bold; letter-spacing:4px;">${code}</p><p>Ce code expire dans 5 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
      }),
    });

    if (!brevoRes.ok) {
      const data = await brevoRes.json().catch(() => ({}));
      res.status(400).json({ error: data.message || "Impossible d'envoyer le code" });
      return;
    }

    res.status(200).json({ success: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur lors de l'envoi du code" });
  }
}
