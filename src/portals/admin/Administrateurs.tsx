import { useState } from "react";
import { Plus, Pencil, RotateCcw, Trash2, X } from "lucide-react";
import { useAdminPortal } from "../../context/AdminPortalContext";

export function Administrateurs() {
  const { administrators } = useAdminPortal();
  const [showAdd, setShowAdd] = useState(false);

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Administrateurs</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les accès et permissions de votre équipe.</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
        >
          <Plus size={16} /> Ajouter un administrateur
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-5 py-3 font-semibold">Nom</th>
              <th className="px-5 py-3 font-semibold">Rôle</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
              <th className="px-5 py-3 font-semibold">Dernière connexion</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {administrators.map((a) => (
              <tr key={a.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue text-xs font-bold">
                      {a.name.charAt(0)}
                    </span>
                    <span className="font-medium text-brand-navy">{a.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-gray-600">{a.role}</td>
                <td className="px-5 py-3.5">
                  <span className="rounded-full bg-brand-green-light px-2.5 py-0.5 text-xs font-medium text-green-700">
                    {a.status}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-gray-500">{a.lastLogin}</td>
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2 text-gray-400">
                    <button className="hover:text-brand-blue">
                      <Pencil size={15} />
                    </button>
                    <button className="hover:text-brand-blue">
                      <RotateCcw size={15} />
                    </button>
                    <button className="hover:text-red-500">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl">
            <button
              onClick={() => setShowAdd(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={16} />
            </button>
            <h3 className="font-display text-lg font-bold text-brand-navy mb-4">Ajouter un administrateur</h3>
            <div className="space-y-3">
              <input placeholder="Nom complet" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none" />
              <input placeholder="Email" className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none" />
              <select className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none">
                <option>Agent de vérification</option>
                <option>Support Client</option>
                <option>Comptabilité</option>
                <option>Admin Principal</option>
              </select>
            </div>
            <button
              onClick={() => setShowAdd(false)}
              className="mt-5 w-full rounded-xl bg-brand-blue py-2.5 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
            >
              Envoyer l'invitation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
