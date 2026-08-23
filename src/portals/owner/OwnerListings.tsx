import { Link } from "react-router-dom";
import { ChevronRight, Plus } from "lucide-react";
import { useOwner } from "../../context/OwnerContext";
import { useListings } from "../../context/ListingsContext";
import { listingStatusClass } from "../../data/listingStatus";

export function OwnerListings() {
  const { ownerUser } = useOwner();
  const { getListingsByOwner } = useListings();
  const listings = getListingsByOwner(ownerUser.phone);

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Mes annonces</h1>
          <p className="mt-1 text-sm text-gray-500">{listings.length} logement(s) publié(s) ou en cours de vérification.</p>
        </div>
        <Link
          to="/proprietaire/publier"
          className="flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
        >
          <Plus size={16} /> Ajouter un logement
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center">
          <p className="text-gray-500">Aucune annonce pour l'instant.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {listings.map((l) => (
            <Link
              key={l.id}
              to={`/proprietaire/annonces/${l.id}`}
              className="flex items-center gap-4 rounded-2xl border border-gray-100 p-3 hover:shadow-sm transition-shadow"
            >
              {l.image ? (
                <img src={l.image} alt={l.title} className="h-16 w-16 rounded-xl object-cover shrink-0" />
              ) : (
                <span className="h-16 w-16 rounded-xl bg-gray-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-brand-navy text-sm truncate">{l.title}</p>
                <p className="text-sm text-gray-500">{l.price.toLocaleString("fr-FR")} FCFA / mois</p>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${listingStatusClass(l.status)}`}>
                  {l.status}
                </span>
              </div>
              <ChevronRight size={16} className="text-gray-300 shrink-0" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
