import { useMemo } from "react";
import { useListings } from "../../context/ListingsContext";
import { BarChart } from "../../components/BarChart";
import { DonutChart } from "../../components/DonutChart";

const typeColors: Record<string, string> = {
  Chambre: "#26A9E1",
  Studio: "#16A34A",
  Appartement: "#FAAE3F",
  "Résidence étudiante": "#A78BFA",
  Colocation: "#F472B6",
};
const cityColors = ["#26A9E1", "#16A34A", "#FAAE3F", "#A78BFA", "#F472B6", "#CBD5E1"];

export function Statistiques() {
  const { listings } = useListings();

  const publiees = listings.filter((l) => l.status === "Publiée");
  const contactsGeneres = listings.reduce((sum, l) => sum + l.unlocksCount, 0);
  const proprietaires = new Set(listings.map((l) => l.ownerId)).size;

  const typesLogements = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of publiees) counts.set(l.type || "Autre", (counts.get(l.type || "Autre") ?? 0) + 1);
    return Array.from(counts.entries()).map(([label, value]) => ({
      label,
      value,
      color: typeColors[label] ?? "#CBD5E1",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings]);

  const repartitionParVille = useMemo(() => {
    const counts = new Map<string, number>();
    for (const l of publiees) counts.set(l.city, (counts.get(l.city) ?? 0) + 1);
    const total = publiees.length;
    return Array.from(counts.entries()).map(([ville, n], i) => ({
      ville,
      pct: total ? Math.round((n / total) * 100) : 0,
      color: cityColors[i % cityColors.length],
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listings]);

  return (
    <div className="p-6 sm:p-10">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-brand-navy">Statistiques</h1>
        <p className="mt-1 text-sm text-gray-500">Analysez les performances réelles de la plateforme.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Stat label="Annonces publiées" value={publiees.length} />
        <Stat label="Propriétaires" value={proprietaires} />
        <Stat label="Contacts générés" value={contactsGeneres} />
        <Stat label="Revenus" value="—" note="Paiement pas encore branché" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-navy mb-4">Annonces publiées par type</h2>
          {typesLogements.length > 0 ? (
            <BarChart data={typesLogements} color="#16A34A" height={130} />
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">Aucune annonce publiée pour l'instant.</p>
          )}
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-navy mb-4">Répartition par ville</h2>
          {repartitionParVille.length > 0 ? (
            <DonutChart data={repartitionParVille.map((v) => ({ label: v.ville, value: v.pct, color: v.color }))} />
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">Aucune annonce publiée pour l'instant.</p>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-gray-100 p-5">
        <h2 className="font-semibold text-brand-navy mb-2">Types de logements</h2>
        {typesLogements.length > 0 ? (
          <DonutChart data={typesLogements} />
        ) : (
          <p className="text-sm text-gray-400 py-8 text-center">Aucune annonce publiée pour l'instant.</p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-display text-xl font-bold text-brand-navy mt-1">{value}</p>
      {note && <p className="text-xs text-gray-400 mt-0.5">{note}</p>}
    </div>
  );
}
