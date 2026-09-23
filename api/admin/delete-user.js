import { getServiceClient, requireAdmin } from "../_lib/adminAuth.js";

// Deletes a student or owner account. Any admin can do this (unlike
// revoke.js, which removes another admin's access and stays
// superadmin-only) — it's a normal moderation action, not a
// hierarchy change.
//
// listings.owner_id is a plain text column, not a foreign key (see
// schema.sql), so deleting the auth user alone would leave their listings
// behind — this explicitly deletes them first. Deleting each listing
// cascades (via real FKs) to its reviews, signalements, favorites and
// featured_listings rows. It does NOT delete the listing's uploaded
// photos/videos from Storage — a known gap, not something this endpoint
// attempts.
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

  const caller = await requireAdmin(req, serviceClient);
  if (!caller) {
    res.status(403).json({ error: "Accès réservé aux administrateurs" });
    return;
  }

  const { userId } = req.body || {};
  if (!userId) {
    res.status(400).json({ error: "userId requis" });
    return;
  }
  if (userId === caller.id) {
    res.status(400).json({ error: "Vous ne pouvez pas supprimer votre propre compte" });
    return;
  }

  const { data: targetProfile } = await serviceClient
    .from("profiles")
    .select("id, role")
    .eq("id", userId)
    .maybeSingle();
  if (!targetProfile) {
    res.status(404).json({ error: "Compte introuvable" });
    return;
  }
  if (targetProfile.role !== "etudiant" && targetProfile.role !== "proprietaire") {
    res.status(400).json({ error: "Cette action ne peut supprimer qu'un compte étudiant ou propriétaire" });
    return;
  }

  if (targetProfile.role === "proprietaire") {
    const { error: listingsError } = await serviceClient.from("listings").delete().eq("owner_id", userId);
    if (listingsError) {
      res.status(400).json({ error: listingsError.message || "Échec de la suppression des annonces du propriétaire" });
      return;
    }
  }

  const { error } = await serviceClient.auth.admin.deleteUser(userId);
  if (error) {
    res.status(400).json({ error: error.message || "Échec de la suppression du compte" });
    return;
  }

  res.status(200).json({ ok: true });
}
