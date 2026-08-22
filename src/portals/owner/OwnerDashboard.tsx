import { Link } from "react-router-dom";
import { Plus, ChevronRight } from "lucide-react";
import { useOwner } from "../../context/OwnerContext";
import { statusBadgeClass } from "./ownerUi";

export function OwnerDashboard() {
  const { ownerUser, listings } = useOwner();
  const firstName = ownerUser.fullName.split(" ")[0];

  const enAttente = listings.filter((l) => l.status === "En attente de vérification").length;
  const publiees = listings.filter((l) => l.status === "Publiée").length;
  const contactsRecus = listings.reduce((sum, l) => sum + l.unlocks, 0);

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Bonjour {firstName} 👋</h1>
          <p className="mt-1 text-sm text-gray-500">Voici un aperçu de vos performances.</p>
        </div>
        <Link
          to="/proprietaire/publier"
          className="flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
        >
          <Plus size={16} /> Ajouter un logement
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-10">
        <StatCard value={listings.length} label="Total" title="Mes annonces" />
        <StatCard value={enAttente} label="" title="En attente" />
        <StatCard value={publiees} label="" title="Publiées" />
        <StatCard value={contactsRecus} label="Ce mois" title="Contacts reçus" />
        <StatCard value="95%" label="Excellent" title="Taux de réponse" highlight />
      </div>

      <h2 className="font-display text-lg font-bold text-brand-navy mb-4">Mes annonces</h2>
      <div className="space-y-3">
        {listings.map((l) => (
          <Link
            key={l.id}
            to={`/proprietaire/annonces/${l.id}`}
            className="flex items-center gap-4 rounded-2xl border border-gray-100 p-3 hover:shadow-sm transition-shadow"
          >
            <img src={l.image} alt={l.title} className="h-14 w-14 rounded-xl object-cover shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-brand-navy text-sm truncate">{l.title}</p>
              <p className="text-sm text-gray-500">{l.price.toLocaleString("fr-FR")} FCFA / mois</p>
              <p className="text-xs text-gray-400">Soumise le {l.submittedDate}</p>
            </div>
            <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(l.status)}`}>
              {l.status}
            </span>
            <ChevronRight size={16} className="text-gray-300 shrink-0" />
          </Link>
        ))}
      </div>

      <div className="mt-6 text-center">
        <Link to="/proprietaire/annonces" className="text-sm font-semibold text-brand-blue">
          Voir toutes mes annonces
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  value,
  label,
  title,
  highlight,
}: {
  value: string | number;
  label: string;
  title: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4 text-center">
      <p className={`font-display text-2xl font-bold ${highlight ? "text-brand-green" : "text-brand-navy"}`}>
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{title}</p>
      {label && <p className="text-[11px] text-gray-400">{label}</p>}
    </div>
  );
}
