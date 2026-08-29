// Sends a one-time SMS verification code via Twilio Verify. Used both for
// enrolling a phone number (MfaEnrollForm) and for the login-time 2FA
// challenge (MfaChallengeForm) — kept as a thin, stateless wrapper around
// Twilio's own Verify API, which handles code generation, expiry and
// rate-limiting for us.
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
  const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!accountSid || !authToken || !verifyServiceSid) {
    res.status(500).json({ error: "Configuration Twilio manquante côté serveur" });
    return;
  }

  try {
    const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
    const body = new URLSearchParams({ To: phone, Channel: "sms" });
    const twilioRes = await fetch(`https://verify.twilio.com/v2/Services/${verifyServiceSid}/Verifications`, {
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

    res.status(200).json({ success: true, status: data.status });
  } catch {
    res.status(500).json({ error: "Erreur serveur lors de l'envoi du code" });
  }
}
