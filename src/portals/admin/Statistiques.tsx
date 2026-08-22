import { useAdminPortal } from "../../context/AdminPortalContext";
import { Sparkline } from "../../components/Sparkline";
import { BarChart } from "../../components/BarChart";
import { DonutChart } from "../../components/DonutChart";
import { repartitionParVille } from "../../data/adminSeed";

const inscriptions = [12, 18, 15, 22, 19, 28, 24, 30, 26, 33, 29, 35];
const annoncesPubliees = [
  { label: "Chambres", value: 45 },
  { label: "Studios", value: 25 },
  { label: "Apparts.", value: 18 },
  { label: "Colocs", value: 12 },
];
const typesLogements = [
  { label: "Chambres", value: 45, color: "#26A9E1" },
  { label: "Studios", value: 25, color: "#16A34A" },
  { label: "Appartements", value: 18, color: "#FAAE3F" },
  { label: "Colocations", value: 12, color: "#A78BFA" },
];

export function Statistiques() {
  const { session } = useAdminPortal();
  const isSuper = session?.role === "Super Admin";

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
        <Stat label="Annonces publiées" value={isSuper ? "542" : "28"} />
        <Stat label="Contacts générés" value={isSuper ? "2 865" : "352"} />
        <Stat label="Revenus" value={isSuper ? "2 450 000 FCFA" : "350 000 FCFA"} />
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-navy mb-4">Évolution des inscriptions</h2>
          <Sparkline data={inscriptions} height={110} className="w-full h-28" color="#26A9E1" />
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-navy mb-4">Annonces publiées</h2>
          <BarChart data={annoncesPubliees} color="#16A34A" height={130} />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mt-6">
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-navy mb-4">Répartition par ville</h2>
          <DonutChart data={repartitionParVille.map((v) => ({ label: v.ville, value: v.pct, color: v.color }))} />
        </div>
        <div className="rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-brand-navy mb-4">Types de logements</h2>
          <DonutChart data={typesLogements} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-display text-xl font-bold text-brand-navy mt-1">{value}</p>
    </div>
  );
}
