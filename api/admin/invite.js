import { getServiceClient, requireSuperadmin } from "../_lib/adminAuth.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée" });
    return;
  }

  let serviceClient;
  try {
    serviceClient = getServiceClient();
  } catch {
    res.status(500).json({ error: "Configuration serveur manquante" });
    return;
  }

  const caller = await requireSuperadmin(req, serviceClient);
  if (!caller) {
    res.status(403).json({ error: "Accès réservé au super administrateur" });
    return;
  }

  const { email, fullName, role } = req.body || {};
  if (!email || !fullName || !["admin", "superadmin"].includes(role)) {
    res.status(400).json({ error: "Champs invalides" });
    return;
  }

  const [firstName, ...rest] = String(fullName).trim().split(/\s+/);
  const origin = `https://${req.headers.host}`;

  const { data, error } = await serviceClient.auth.admin.inviteUserByEmail(email, {
    data: {
      first_name: firstName || "",
      last_name: rest.join(" "),
      role,
    },
    redirectTo: `${origin}/admin/definir-mot-de-passe`,
  });

  if (error) {
    res.status(400).json({ error: error.message || "Échec de l'invitation" });
    return;
  }

  res.status(200).json({ id: data.user?.id });
}
