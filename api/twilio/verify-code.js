// Checks a one-time SMS code against Twilio Verify. Returns only a boolean
// success — never reveals whether the reason for failure was a wrong code,
// an expired one, or too many attempts, since that distinction isn't useful
// to a client trying to brute-force a code.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const { phone, code } = req.body || {};
  if (!phone || !code) {
    res.status(400).json({ error: "Numéro et code requis" });
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
    const body = new URLSearchParams({ To: phone, Code: code });
    const twilioRes = await fetch(`https://verify.twilio.com/v2/Services/${verifyServiceSid}/VerificationCheck`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    const data = await twilioRes.json();

    if (!twilioRes.ok) {
      res.status(200).json({ success: false });
      return;
    }

    res.status(200).json({ success: data.status === "approved" });
  } catch {
    res.status(500).json({ error: "Erreur serveur lors de la vérification du code" });
  }
}
