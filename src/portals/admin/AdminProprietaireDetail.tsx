import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Trash2 } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useListings } from "../../context/ListingsContext";
import { useAdminPortal } from "../../context/AdminPortalContext";
import { useBasePath } from "./adminUi";
import { listingStatusClass } from "../../data/listingStatus";

interface OwnerProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  createdAt: string;
}

export function AdminProprietaireDetail() {
  const { id } = useParams();
  const base = useBasePath(useLocation().pathname);
  const navigate = useNavigate();
  const { getListingsByOwner } = useListings();
  const { logAction } = useAdminPortal();
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!id) return;
    const fetchProfile = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, phone, city, created_at")
        .eq("id", id)
        .maybeSingle();
      if (data) {
        setProfile({
          id: data.id,
          name: `${data.first_name} ${data.last_name}`.trim() || data.email || "Sans nom",
          email: data.email ?? "",
          phone: data.phone,
          city: data.city,
          createdAt: data.created_at,
        });
      }
      setLoading(false);
    };
    fetchProfile();
  }, [id]);

  const listings = id ? getListingsByOwner(id) : [];

  const handleDelete = async () => {
    if (!profile) return;
    if (
      !window.confirm(
        `Supprimer définitivement le compte de ${profile.name} ? Ses ${listings.length} annonce(s) seront aussi supprimées. Cette action est irréversible.`,
      )
    )
      return;
    setDeleteError("");
    setDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Session expirée, reconnectez-vous.");

      const res = await fetch("/api/admin/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: profile.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la suppression");

      await logAction("Suppression de compte propriétaire", profile.email || profile.name, `${listings.length} annonce(s) supprimée(s)`);
      navigate(`${base}/proprietaires`, { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Échec de la suppression");
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement...</div>;

  if (!profile) {
    return (
      <div className="p-10 text-center text-gray-500">
        Propriétaire introuvable.{" "}
        <Link to={`${base}/proprietaires`} className="text-brand-blue font-semibold">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <div className="flex items-center justify-between mb-5">
        <Link to={`${base}/proprietaires`} className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy">
          <ArrowLeft size={16} /> Retour aux propriétaires
        </Link>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
        >
          <Trash2 size={13} /> {deleting ? "Suppression..." : "Supprimer ce compte"}
        </button>
      </div>
      {deleteError && <p className="mb-3 text-sm text-red-500">{deleteError}</p>}

      <div className="rounded-2xl border border-gray-100 p-6 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue text-xl font-bold">
            {profile.name.charAt(0)}
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-brand-navy">{profile.name}</h1>
            <p className="text-xs text-gray-400">
              Membre depuis le {new Date(profile.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <Mail size={14} className="text-gray-400" /> {profile.email || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={14} className="text-gray-400" /> {profile.phone || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <MapPin size={14} className="text-gray-400" /> {profile.city || "—"}
          </span>
        </div>
      </div>

      <h2 className="font-display text-lg font-bold text-brand-navy mt-8 mb-3">
        Annonces ({listings.length})
      </h2>
      {listings.length === 0 ? (
        <p className="text-sm text-gray-400">Ce propriétaire n'a publié aucune annonce.</p>
      ) : (
        <div className="rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-semibold">Titre</th>
                <th className="px-5 py-3 font-semibold">Ville</th>
                <th className="px-5 py-3 font-semibold">Prix</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3.5 font-medium text-brand-navy">{l.title}</td>
                  <td className="px-5 py-3.5 text-gray-500">{l.city}</td>
                  <td className="px-5 py-3.5 text-gray-600">
                    {l.price.toLocaleString("fr-FR")} FCFA / {l.period}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${listingStatusClass(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link to={`${base}/annonces/${l.id}`} className="text-brand-blue text-xs font-semibold">
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
