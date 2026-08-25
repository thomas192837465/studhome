import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { useAdminPortal } from "../../context/AdminPortalContext";

export function LogsActivite() {
  const { logs } = useAdminPortal();
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [adminFilter, setAdminFilter] = useState("");
  const [actionFilter, setActionFilter] = useState("");

  const adminNames = useMemo(() => Array.from(new Set(logs.map((l) => l.admin))).sort(), [logs]);
  const actionTypes = useMemo(() => Array.from(new Set(logs.map((l) => l.action))).sort(), [logs]);

  const filtered = logs.filter((l) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !l.admin.toLowerCase().includes(q) &&
        !l.action.toLowerCase().includes(q) &&
        !l.cible.toLowerCase().includes(q)
      ) {
        return false;
      }
    }
    if (date && !l.time.startsWith(date)) return false;
    if (adminFilter && l.admin !== adminFilter) return false;
    if (actionFilter && l.action !== actionFilter) return false;
    return true;
  });

  return (
    <div className="p-6 sm:p-10">
      <h1 className="font-display text-2xl font-bold text-brand-navy mb-1">Logs d'activité (Audit trails)</h1>
      <p className="text-sm text-gray-500 mb-6">Consultez toutes les actions effectuées sur la plateforme.</p>

      <div className="flex flex-wrap gap-3 mb-5">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none"
        />
        <select
          value={adminFilter}
          onChange={(e) => setAdminFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">Tous les administrateurs</option>
          {adminNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none"
        >
          <option value="">Tous les types d'action</option>
          {actionTypes.map((action) => (
            <option key={action} value={action}>
              {action}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 flex-1 min-w-[160px]">
          <Search size={15} className="text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="text-sm focus:outline-none w-full"
          />
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-5 py-3 font-semibold">Heure</th>
              <th className="px-5 py-3 font-semibold">Administrateur</th>
              <th className="px-5 py-3 font-semibold">Action</th>
              <th className="px-5 py-3 font-semibold">Cible</th>
              <th className="px-5 py-3 font-semibold">Détails</th>
              <th className="px-5 py-3 font-semibold">IP</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                  Aucun log ne correspond à ces filtres.
                </td>
              </tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3.5 text-gray-500">{new Date(l.time).toLocaleString("fr-FR")}</td>
                <td className="px-5 py-3.5 text-brand-navy font-medium">{l.admin}</td>
                <td className="px-5 py-3.5 text-gray-600">{l.action}</td>
                <td className="px-5 py-3.5 text-gray-600">{l.cible}</td>
                <td className="px-5 py-3.5 text-gray-500">{l.details}</td>
                <td className="px-5 py-3.5 text-gray-400 text-xs">{l.ip}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
