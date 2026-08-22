import { useState } from "react";
import { Pencil } from "lucide-react";

const roles = [
  {
    name: "Agent de vérification",
    users: 2,
    annonces: { "Voir les annonces en attente": true, "Publier une annonce": true, "Demander modifications": true, "Refuser une annonce": true },
    utilisateurs: { "Voir les propriétaires": false, "Suspendre un propriétaire": false, "Voir les étudiants": false },
    autres: { "Voir les paiements": false, "Modifier les crédits": false, "Voir les logs d'activité": false, "Gérer les administrateurs": false, "Gérer les rôles": false, "Exporter les données": false },
  },
  {
    name: "Support Client",
    users: 1,
    annonces: { "Voir les annonces en attente": true, "Publier une annonce": false, "Demander modifications": false, "Refuser une annonce": false },
    utilisateurs: { "Voir les propriétaires": true, "Suspendre un propriétaire": false, "Voir les étudiants": true },
    autres: { "Voir les paiements": false, "Modifier les crédits": true, "Voir les logs d'activité": false, "Gérer les administrateurs": false, "Gérer les rôles": false, "Exporter les données": false },
  },
  {
    name: "Comptabilité",
    users: 1,
    annonces: { "Voir les annonces en attente": false, "Publier une annonce": false, "Demander modifications": false, "Refuser une annonce": false },
    utilisateurs: { "Voir les propriétaires": false, "Suspendre un propriétaire": false, "Voir les étudiants": false },
    autres: { "Voir les paiements": true, "Modifier les crédits": true, "Voir les logs d'activité": false, "Gérer les administrateurs": false, "Gérer les rôles": false, "Exporter les données": true },
  },
  {
    name: "Admin Principal",
    users: 1,
    annonces: { "Voir les annonces en attente": true, "Publier une annonce": true, "Demander modifications": true, "Refuser une annonce": true },
    utilisateurs: { "Voir les propriétaires": true, "Suspendre un propriétaire": true, "Voir les étudiants": true },
    autres: { "Voir les paiements": true, "Modifier les crédits": true, "Voir les logs d'activité": true, "Gérer les administrateurs": true, "Gérer les rôles": true, "Exporter les données": true },
  },
];

export function RolesPermissions() {
  const [selected, setSelected] = useState(0);
  const [tab, setTab] = useState<"permissions" | "utilisateurs">("permissions");
  const role = roles[selected];

  return (
    <div className="p-6 sm:p-10">
      <h1 className="font-display text-2xl font-bold text-brand-navy mb-1">Rôles & permissions</h1>
      <p className="text-sm text-gray-500 mb-6">Gérez les permissions de chaque rôle.</p>

      <div className="grid lg:grid-cols-[220px_1fr] gap-6">
        <div className="rounded-2xl border border-gray-100 p-2 h-fit">
          {roles.map((r, i) => (
            <button
              key={r.name}
              onClick={() => setSelected(i)}
              className={`w-full text-left rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                i === selected ? "bg-brand-blue-light text-brand-blue" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-gray-500">Rôle :</p>
              <h2 className="font-display text-lg font-bold text-brand-navy">{role.name}</h2>
            </div>
            <button className="flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-1.5 text-sm font-semibold text-brand-navy hover:bg-gray-50">
              <Pencil size={14} /> Modifier le rôle
            </button>
          </div>

          <div className="flex gap-6 border-b border-gray-100 mb-5">
            <button
              onClick={() => setTab("permissions")}
              className={`pb-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === "permissions" ? "border-brand-blue text-brand-blue" : "border-transparent text-gray-400"}`}
            >
              Permissions
            </button>
            <button
              onClick={() => setTab("utilisateurs")}
              className={`pb-2.5 text-sm font-semibold border-b-2 -mb-px ${tab === "utilisateurs" ? "border-brand-blue text-brand-blue" : "border-transparent text-gray-400"}`}
            >
              Utilisateurs ({role.users})
            </button>
          </div>

          {tab === "permissions" ? (
            <div className="grid sm:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-brand-navy text-sm mb-3">Annonces</h3>
                <PermList items={role.annonces} />
                <h3 className="font-semibold text-brand-navy text-sm mt-5 mb-3">Utilisateurs</h3>
                <PermList items={role.utilisateurs} />
              </div>
              <div>
                <h3 className="font-semibold text-brand-navy text-sm mb-3">Autres</h3>
                <PermList items={role.autres} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">{role.users} utilisateur(s) assigné(s) à ce rôle.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function PermList({ items }: { items: Record<string, boolean> }) {
  return (
    <ul className="space-y-3">
      {Object.entries(items).map(([label, on]) => (
        <li key={label} className="flex items-center justify-between text-sm text-gray-600">
          {label}
          <Toggle on={on} />
        </li>
      ))}
    </ul>
  );
}

function Toggle({ on }: { on: boolean }) {
  return (
    <span className={`inline-flex h-5 w-9 items-center rounded-full transition-colors ${on ? "bg-brand-blue" : "bg-gray-200"}`}>
      <span className={`h-4 w-4 rounded-full bg-white shadow transform transition-transform ${on ? "translate-x-[18px]" : "translate-x-0.5"}`} />
    </span>
  );
}
