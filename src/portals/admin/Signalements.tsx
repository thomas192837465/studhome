import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTrash, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useSignalements } from "../../context/SignalementsContext";
import { signalementStatusClass } from "./adminUi";

const statuses = ["Tous les statuts", "Nouveau", "En cours", "Résolu"] as const;

export function Signalements() {
  const { signalements, setSignalementStatus, deleteSignalement } = useSignalements();
  const [filter, setFilter] = useState<(typeof statuses)[number]>("Tous les statuts");

  const filtered = signalements.filter((s) => filter === "Tous les statuts" || s.status === filter);

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

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          Aucun signalement pour l'instant.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((s) => (
            <div key={s.id} className="rounded-2xl border border-gray-100 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-brand-navy text-sm">
                    {s.listingTitle} <span className="font-normal text-gray-400">— signalé par {s.reportedBy}</span>
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-sm text-gray-600">{s.reason}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${signalementStatusClass(s.status)}`}>
                      {s.status}
                    </span>
                  </div>
                  {s.details && <p className="mt-2 text-sm text-gray-600">{s.details}</p>}
                  <p className="mt-1.5 text-xs text-gray-400">
                    {new Date(s.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {s.status === "Nouveau" && (
                    <button
                      onClick={() => setSignalementStatus(s.id, "En cours")}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-blue-light px-3 py-1.5 text-xs font-semibold text-brand-blue hover:bg-brand-blue/20"
                    >
                      <FontAwesomeIcon icon={faSpinner} className="h-3 w-3" /> Prendre en charge
                    </button>
                  )}
                  {s.status !== "Résolu" && (
                    <button
                      onClick={() => setSignalementStatus(s.id, "Résolu")}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                    >
                      <FontAwesomeIcon icon={faCheck} className="h-3 w-3" /> Marquer résolu
                    </button>
                  )}
                  <button
                    onClick={() => deleteSignalement(s.id)}
                    className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                  >
                    <FontAwesomeIcon icon={faTrash} className="h-3 w-3" /> Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
