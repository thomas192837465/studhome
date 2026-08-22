import { useOwner } from "../../context/OwnerContext";
import { Sparkline } from "../../components/Sparkline";
import { statusBadgeClass } from "./ownerUi";

export function OwnerStatistiques() {
  const { listings } = useOwner();
  const totalViews = listings.reduce((s, l) => s + l.views, 0);
  const totalFavs = listings.reduce((s, l) => s + l.favorites, 0);
  const totalUnlocks = listings.reduce((s, l) => s + l.unlocks, 0);
  const combined = listings[0]?.performance.map((_, i) => listings.reduce((s, l) => s + (l.performance[i] ?? 0), 0)) ?? [];

  return (
    <div className="p-6 sm:p-10">
      <h1 className="font-display text-2xl font-bold text-brand-navy mb-1">Statistiques</h1>
      <p className="text-sm text-gray-500 mb-8">Performance globale de toutes vos annonces.</p>

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
        <p className="font-semibold text-brand-navy text-sm mb-3">Vues cumulées (30 derniers jours)</p>
        <Sparkline data={combined} height={100} className="w-full h-24" />
      </div>

      <h2 className="font-semibold text-brand-navy mb-3">Détail par annonce</h2>
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
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(l.status)}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-600">{l.views}</td>
                <td className="px-5 py-3 text-gray-600">{l.favorites}</td>
                <td className="px-5 py-3 text-gray-600">{l.unlocks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
