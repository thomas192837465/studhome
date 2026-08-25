const TEMPLATES = {
  publiee: (listingTitle) => ({
    subject: `Votre annonce "${listingTitle}" est publiée !`,
    body: `Bonne nouvelle : votre annonce <strong>${listingTitle}</strong> a été vérifiée et est maintenant visible par les étudiants sur StudHome.`,
  }),
  refusee: (listingTitle, reason) => ({
    subject: `Votre annonce "${listingTitle}" n'a pas été retenue`,
    body: `Votre annonce <strong>${listingTitle}</strong> a été refusée par notre équipe de vérification.${
      reason ? `<br/><br/>Motif : ${reason}` : ""
    }`,
  }),
  modification: (listingTitle, reason, message) => ({
    subject: `Modifications requises pour "${listingTitle}"`,
    body: `Notre équipe de vérification demande des modifications sur votre annonce <strong>${listingTitle}</strong> avant de pouvoir la publier.${
      reason ? `<br/><br/>Motif : ${reason}` : ""
    }${message ? `<br/><br/>Détails : ${message}` : ""}`,
  }),
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  const { to, ownerName, listingTitle, status, reason, message } = req.body || {};
  const template = TEMPLATES[status];
  if (!to || !listingTitle || !template) {
    res.status(400).json({ error: "Champs invalides" });
    return;
  }

  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  const senderName = process.env.BREVO_SENDER_NAME || "StudHome";
  if (!apiKey || !senderEmail) {
    res.status(500).json({ error: "Configuration email manquante côté serveur" });
    return;
  }

  const { subject, body } = template(listingTitle, reason, message);
  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #1a2b45;">
      <h2 style="color: #26A9E1;">StudHome</h2>
      <p>Bonjour ${ownerName || ""},</p>
      <p>${body}</p>
      <p style="margin-top: 24px; font-size: 12px; color: #888;">StudHome · Plateforme de référence pour le logement étudiant en Afrique.</p>
    </div>
  `;

  try {
    const brevoRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to, name: ownerName || undefined }],
        subject,
        htmlContent: html,
      }),
    });

    if (!brevoRes.ok) {
      const data = await brevoRes.json().catch(() => ({}));
      res.status(502).json({ error: data.message || "Échec de l'envoi de l'email" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch {
    res.status(500).json({ error: "Erreur serveur lors de l'envoi de l'email" });
  }
}
