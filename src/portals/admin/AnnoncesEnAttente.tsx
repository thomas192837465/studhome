import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { useAdminPortal } from "../../context/AdminPortalContext";
import { listingStatusClass, useBasePath } from "./adminUi";
import type { AdminListingStatus } from "../../data/adminTypes";

const statuses: (AdminListingStatus | "Tous les statuts")[] = [
  "Tous les statuts",
  "En attente",
  "Publiée",
  "Modifications demandées",
  "Refusée",
];

export function AnnoncesEnAttente() {
  const { listings } = useAdminPortal();
  const base = useBasePath(useLocation().pathname);
  const [filter, setFilter] = useState<(typeof statuses)[number]>("Tous les statuts");
  const [search, setSearch] = useState("");

  const filtered = listings.filter((l) => {
    if (filter !== "Tous les statuts" && l.status !== filter) return false;
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.owner.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Annonces en attente de vérification</h1>
          <p className="mt-1 text-sm text-gray-500">Vérifiez les informations et prenez une décision pour chaque annonce.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2">
            <Search size={15} className="text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher..."
              className="text-sm focus:outline-none w-32"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none"
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-5 py-3 font-semibold">#</th>
              <th className="px-5 py-3 font-semibold">Logement</th>
              <th className="px-5 py-3 font-semibold">Ville</th>
              <th className="px-5 py-3 font-semibold">Propriétaire</th>
              <th className="px-5 py-3 font-semibold">Date de soumission</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3.5 text-gray-500">#{l.id}</td>
                <td className="px-5 py-3.5 text-brand-navy font-medium">{l.title}</td>
                <td className="px-5 py-3.5 text-gray-600">
                  {l.ville}, {l.quartier}
                </td>
                <td className="px-5 py-3.5 text-gray-600">{l.owner}</td>
                <td className="px-5 py-3.5 text-gray-500">{l.submitted}</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${listingStatusClass(l.status)}`}>
                    {l.status}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  <Link
                    to={`${base}/annonces/${l.id}`}
                    className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-blue-light"
                  >
                    Voir
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                  Aucune annonce ne correspond.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
