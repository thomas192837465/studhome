import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Heart, Trash2 } from "lucide-react";
import { useListings } from "../context/ListingsContext";
import { ListingCard } from "../components/ListingCard";
import { useApp } from "../context/AppContext";

export function Favoris() {
  const { isAuthenticated, authLoading, favorites, toggleFavorite } = useApp();
  const { listings, adjustFavorite } = useListings();
  const [page, setPage] = useState(1);

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  const favListings = listings.filter((l) => favorites.includes(l.id));
  const perPage = 8;
  const pageCount = Math.max(1, Math.ceil(favListings.length / perPage));
  const paged = favListings.slice((page - 1) * perPage, page * perPage);

  const clearAll = () => {
    favListings.forEach((l) => {
      toggleFavorite(l.id);
      adjustFavorite(l.id, -1);
    });
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy flex items-center gap-2">
            Mes favoris <Heart className="text-brand-blue" />
          </h1>
          <p className="mt-1 text-sm text-gray-500">Retrouvez ici tous les logements que vous avez ajouté en favoris.</p>
        </div>
        {favListings.length > 0 && (
          <button
            onClick={clearAll}
            className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <Trash2 size={15} /> Tout supprimer
          </button>
        )}
      </div>

      {favListings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center">
          <Heart className="mx-auto text-gray-300" size={40} />
          <p className="mt-3 text-gray-500">Vous n'avez pas encore de favoris.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {paged.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}

      {pageCount > 1 && (
        <div className="mt-10 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                n === page ? "bg-brand-blue text-white" : "border border-gray-200 text-gray-600"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
