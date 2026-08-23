import { useState } from "react";
import { useAdminPortal } from "../../context/AdminPortalContext";
import { signalementStatusClass } from "./adminUi";

const statuses = ["Tous les statuts", "Nouveau", "En cours", "Résolu"] as const;

export function Signalements() {
  const { signalements, resolveSignalement } = useAdminPortal();
  const [filter, setFilter] = useState<(typeof statuses)[number]>("Tous les statuts");

  const filtered = signalements.filter((s) => filter === "Tous les statuts" || s.statut === filter);

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Signalements</h1>
          <p className="mt-1 text-sm text-gray-500">Consultez et traitez les signalements envoyés par les étudiants.</p>
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

      <div className="rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-5 py-3 font-semibold">#</th>
              <th className="px-5 py-3 font-semibold">Logement</th>
              <th className="px-5 py-3 font-semibold">Signalé par</th>
              <th className="px-5 py-3 font-semibold">Raison</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                  Aucun signalement pour l'instant.
                </td>
              </tr>
            )}
            {filtered.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3.5 text-gray-500">#{s.id}</td>
                <td className="px-5 py-3.5 text-brand-navy font-medium">{s.logement}</td>
                <td className="px-5 py-3.5 text-gray-600">{s.signalePar}</td>
                <td className="px-5 py-3.5 text-gray-600">{s.raison}</td>
                <td className="px-5 py-3.5 text-gray-500">{s.date}</td>
                <td className="px-5 py-3.5">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${signalementStatusClass(s.statut)}`}>
                    {s.statut}
                  </span>
                </td>
                <td className="px-5 py-3.5">
                  {s.statut !== "Résolu" ? (
                    <button
                      onClick={() => resolveSignalement(s.id)}
                      className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-blue-light"
                    >
                      Marquer résolu
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
