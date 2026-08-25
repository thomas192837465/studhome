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

  const { userId } = req.body || {};
  if (!userId) {
    res.status(400).json({ error: "userId requis" });
    return;
  }
  if (userId === caller.id) {
    res.status(400).json({ error: "Vous ne pouvez pas révoquer votre propre compte" });
    return;
  }

  const { error } = await serviceClient.auth.admin.deleteUser(userId);
  if (error) {
    res.status(400).json({ error: error.message || "Échec de la révocation" });
    return;
  }

  res.status(200).json({ ok: true });
}
