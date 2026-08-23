import { useAdminPortal } from "../../context/AdminPortalContext";
import { useListings } from "../../context/ListingsContext";
import { Sparkline } from "../../components/Sparkline";
import { BarChart } from "../../components/BarChart";
import { DonutChart } from "../../components/DonutChart";
import { repartitionParVille } from "../../data/adminSeed";

const inscriptions = [12, 18, 15, 22, 19, 28, 24, 30, 26, 33, 29, 35];
const typeColors: Record<string, string> = {
  Chambre: "#26A9E1",
  Studio: "#16A34A",
  Appartement: "#FAAE3F",
  "Résidence étudiante": "#A78BFA",
  Colocation: "#F472B6",
};

export function Statistiques() {
  const { session } = useAdminPortal();
  const { listings } = useListings();
  const isSuper = session?.role === "Super Admin";

  const publiees = listings.filter((l) => l.status === "Publiée");
  const contactsGeneres = listings.reduce((sum, l) => sum + l.unlocksCount, 0);

  const typeCounts = new Map<string, number>();
  for (const l of publiees) {
    const type = l.type || "Autre";
    typeCounts.set(type, (typeCounts.get(type) ?? 0) + 1);
  }
  const typesLogements = Array.from(typeCounts.entries()).map(([label, value]) => ({
    label,
    value,
    color: typeColors[label] ?? "#CBD5E1",
  }));
  const annoncesParType = typesLogements.map((t) => ({ label: t.label, value: t.value }));

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Statistiques</h1>
          <p className="mt-1 text-sm text-gray-500">Analysez les performances globales de la plateforme.</p>
        </div>
        <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none">
          <option>Cette année</option>
          <option>Ce mois</option>
          <option>Cette semaine</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Stat label="Inscriptions" value={isSuper ? "3 452" : "153"} />
        <Stat label="Annonces publiées" value={publiees.length} />
        <Stat label="Contacts générés" value={contactsGeneres} />
        <Stat label="Revenus" value={isSuper ? "2 450 000 FCFA" : "350 000 FCFA"} />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-navy mb-4">Évolution des inscriptions</h2>
          <Sparkline data={inscriptions} height={110} className="w-full h-28" color="#26A9E1" />
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-navy mb-4">Annonces publiées par type</h2>
          {annoncesParType.length > 0 ? (
            <BarChart data={annoncesParType} color="#16A34A" height={130} />
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">Aucune annonce publiée pour l'instant.</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-navy mb-4">Répartition par ville</h2>
          <DonutChart data={repartitionParVille.map((v) => ({ label: v.ville, value: v.pct, color: v.color }))} />
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-navy mb-4">Types de logements</h2>
          {typesLogements.length > 0 ? (
            <DonutChart data={typesLogements} />
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">Aucune annonce publiée pour l'instant.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-display text-xl font-bold text-brand-navy mt-1">{value}</p>
    </div>
  );
}
