import { Link } from "react-router-dom";
import { Plus, ChevronRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHandPaper } from "@fortawesome/free-solid-svg-icons";
import { useOwner } from "../../context/OwnerContext";
import { useListings } from "../../context/ListingsContext";
import { listingStatusClass } from "../../data/listingStatus";

export function OwnerDashboard() {
  const { ownerId, ownerUser } = useOwner();
  const { getListingsByOwner } = useListings();
  const listings = getListingsByOwner(ownerId ?? "");
  const firstName = ownerUser.fullName.split(" ")[0];

  const enAttente = listings.filter((l) => l.status === "En attente").length;
  const publiees = listings.filter((l) => l.status === "Publiée").length;
  const contactsRecus = listings.reduce((sum, l) => sum + l.unlocksCount, 0);

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy flex items-center gap-2">
            Bonjour {firstName} <FontAwesomeIcon icon={faHandPaper} className="h-5 w-5 text-brand-orange" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">Voici un aperçu de vos performances.</p>
        </div>
        <Link
          to="/proprietaire/publier"
          className="flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
        >
          <Plus size={16} /> Ajouter un logement
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        <StatCard value={listings.length} label="Total" title="Mes annonces" />
        <StatCard value={enAttente} label="" title="En attente" />
        <StatCard value={publiees} label="" title="Publiées" />
        <StatCard value={contactsRecus} label="Ce mois" title="Contacts reçus" />
        <StatCard
          value={listings.length ? `${Math.round((publiees / listings.length) * 100)}%` : "—"}
          label={listings.length ? "Sur vos annonces" : "Aucune annonce"}
          title="Taux de publication"
          highlight
        />
      </div>

      <h2 className="font-display text-lg font-bold text-brand-navy mb-4">Mes annonces</h2>
      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500">Vous n'avez pas encore publié de logement.</p>
          <Link to="/proprietaire/publier" className="mt-3 inline-block text-sm font-semibold text-brand-blue">
            Publier mon premier logement →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {listings.map((l) => (
            <Link
              key={l.id}
              to={`/proprietaire/annonces/${l.id}`}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 p-3 hover:shadow-sm transition-shadow"
            >
              {l.image ? (
                <img src={l.image} alt={l.title} className="h-14 w-14 rounded-xl object-cover shrink-0" />
              ) : (
                <span className="h-14 w-14 rounded-xl bg-gray-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-navy text-sm truncate">{l.title}</p>
                <p className="text-sm text-gray-500">{l.price.toLocaleString("fr-FR")} FCFA / {l.period}</p>
                <p className="text-xs text-gray-400">
                  Soumise le {new Date(l.submittedDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${listingStatusClass(l.status)}`}>
                {l.status}
              </span>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}

      {listings.length > 0 && (
        <div className="mt-6 text-center">
          <Link to="/proprietaire/annonces" className="text-sm font-semibold text-brand-blue">
            Voir toutes mes annonces
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({
  value,
  label,
  title,
  highlight,
}: {
  value: string | number;
  label: string;
  title: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4 text-center">
      <p className={`font-display text-2xl font-bold ${highlight ? "text-brand-green" : "text-brand-navy"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
      {label && <p className="text-[11px] text-gray-400">{label}</p>}
    </div>
  );
}
