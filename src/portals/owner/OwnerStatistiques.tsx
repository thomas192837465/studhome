import { useOwner } from "../../context/OwnerContext";
import { useListings } from "../../context/ListingsContext";
import { Sparkline } from "../../components/Sparkline";
import { listingStatusClass } from "../../data/listingStatus";

export function OwnerStatistiques() {
  const { ownerId } = useOwner();
  const { getListingsByOwner } = useListings();
  const listings = getListingsByOwner(ownerId ?? "");

  const totalViews = listings.reduce((s, l) => s + l.views, 0);
  const totalFavs = listings.reduce((s, l) => s + l.favoritesCount, 0);
  const totalUnlocks = listings.reduce((s, l) => s + l.unlocksCount, 0);

  const allDates = Array.from(new Set(listings.flatMap((l) => l.dailyStats.map((d) => d.date)))).sort();
  const combined = allDates.map((date) =>
    listings.reduce((sum, l) => sum + (l.dailyStats.find((d) => d.date === date)?.views ?? 0), 0),
  );

  return (
    <div className="p-6 sm:p-10">
      <h1 className="font-display text-2xl font-bold text-brand-navy mb-1">Statistiques</h1>
      <p className="text-sm text-gray-500 mb-8">Performance globale de toutes vos annonces, en temps réel.</p>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500">Vues totales</p>
          <p className="font-display text-2xl font-bold text-brand-navy">{totalViews}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500">Ajouts en favori</p>
          <p className="font-display text-2xl font-bold text-brand-navy">{totalFavs}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <p className="text-xs text-gray-500">Contacts débloqués</p>
          <p className="font-display text-2xl font-bold text-brand-navy">{totalUnlocks}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 p-5 mb-8">
        <p className="font-semibold text-brand-navy text-sm mb-3">Vues cumulées par jour</p>
        {combined.length > 0 ? (
          <Sparkline data={combined} height={100} className="w-full h-24" />
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">
            Pas encore de données. Les statistiques apparaissent dès qu'un étudiant consulte l'une de vos annonces.
          </p>
        )}
      </div>

      <h2 className="font-semibold text-brand-navy mb-3">Détail par annonce</h2>
      {listings.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune annonce publiée pour l'instant.</p>
      ) : (
        <div className="rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-semibold">Annonce</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 font-semibold">Vues</th>
                <th className="px-5 py-3 font-semibold">Favoris</th>
                <th className="px-5 py-3 font-semibold">Contacts</th>
              </tr>
            </thead>
            <tbody>
              {listings.map((l) => (
                <tr key={l.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3 text-brand-navy font-medium">{l.title}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${listingStatusClass(l.status)}`}>
                      {l.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-600">{l.views}</td>
                  <td className="px-5 py-3 text-gray-600">{l.favoritesCount}</td>
                  <td className="px-5 py-3 text-gray-600">{l.unlocksCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
