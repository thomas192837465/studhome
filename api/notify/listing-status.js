const STATUS_META = {
  publiee: { label: "Annonce publiée", color: "#16a34a", bg: "#e7f5ec" },
  refusee: { label: "Annonce refusée", color: "#dc2626", bg: "#fef2f2" },
  modification: { label: "Modifications demandées", color: "#b45309", bg: "#fffbeb" },
};

const TEMPLATES = {
  publiee: (listingTitle) => ({
    subject: `Votre annonce "${listingTitle}" est publiée !`,
    body: `Bonne nouvelle : votre annonce <strong>${listingTitle}</strong> a été vérifiée et est maintenant visible par les étudiants sur StudHome.`,
    cta: "Voir mon annonce",
  }),
  refusee: (listingTitle, reason) => ({
    subject: `Votre annonce "${listingTitle}" n'a pas été retenue`,
    body: `Votre annonce <strong>${listingTitle}</strong> a été refusée par notre équipe de vérification.${
      reason ? `<br/><br/><strong>Motif :</strong> ${reason}` : ""
    }`,
    cta: "Voir mes annonces",
  }),
  modification: (listingTitle, reason, message) => ({
    subject: `Modifications requises pour "${listingTitle}"`,
    body: `Notre équipe de vérification demande des modifications sur votre annonce <strong>${listingTitle}</strong> avant de pouvoir la publier.${
      reason ? `<br/><br/><strong>Motif :</strong> ${reason}` : ""
    }${message ? `<br/><br/><strong>Détails :</strong><br/>${message.replace(/\n/g, "<br/>")}` : ""}`,
    cta: "Modifier mon annonce",
  }),
};

export function renderEmail({ ownerName, body, cta, ctaUrl, status }) {
  const meta = STATUS_META[status];
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>StudHome</title>
</head>
<body style="margin:0; padding:0; background-color:#f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f3f4f6; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#ffffff; border-radius:16px; overflow:hidden; border:1px solid #f0f0f0;">
          <tr>
            <td style="padding: 28px 32px 20px; border-bottom: 1px solid #f0f0f0;">
              <span style="font-size:22px; font-weight:800; letter-spacing:-0.5px;">
                <span style="color:#faae3f;">Stud</span><span style="color:#26a9e1;">Home</span>
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 28px 32px 8px;">
              <span style="display:inline-block; padding:6px 14px; border-radius:999px; background-color:${meta.bg}; color:${meta.color}; font-size:12px; font-weight:700;">
                ${meta.label}
              </span>
            </td>
          </tr>
          <tr>
            <td style="padding: 12px 32px 8px; color:#111827; font-size:15px; line-height:1.6;">
              <p style="margin:0 0 12px;">Bonjour ${ownerName || ""},</p>
              <p style="margin:0;">${body}</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px 32px;">
              <a href="${ctaUrl}" style="display:inline-block; background-color:#26a9e1; color:#ffffff; text-decoration:none; font-weight:700; font-size:14px; padding:12px 24px; border-radius:999px;">
                ${cta} →
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px; background-color:#fafafa; border-top:1px solid #f0f0f0;">
              <p style="margin:0; font-size:12px; color:#9ca3af;">
                StudHome · Plateforme de référence pour le logement étudiant en Afrique.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

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

  const { subject, body, cta } = template(listingTitle, reason, message);
  const origin = `https://${req.headers.host}`;
  const html = renderEmail({
    ownerName,
    body,
    cta,
    ctaUrl: `${origin}/proprietaire/annonces`,
    status,
  });

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
