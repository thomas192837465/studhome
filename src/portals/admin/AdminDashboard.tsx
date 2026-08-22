import { Link } from "react-router-dom";
import { ClipboardList, AlertTriangle, Download } from "lucide-react";
import { useAdminPortal } from "../../context/AdminPortalContext";
import { activitesRecentes, repartitionParVille } from "../../data/adminSeed";
import { DonutChart } from "../../components/DonutChart";

export function AdminDashboard() {
  const { session, listings, signalements } = useAdminPortal();
  const isSuper = session?.role === "Super Admin";
  const base = isSuper ? "/superadmin" : "/admin";

  const enAttente = listings.filter((l) => l.status === "En attente").length;
  const publiees = listings.filter((l) => l.status === "Publiée").length;
  const aTraiter = signalements.filter((s) => s.statut !== "Résolu").length;

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Bonjour {session?.name} 👋</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isSuper ? "Voici un résumé complet de l'activité sur StudHome." : "Voici ce qui se passe aujourd'hui sur StudHome."}
          </p>
        </div>
        {isSuper && (
          <button className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-brand-navy hover:bg-gray-50">
            <Download size={15} /> Exporter
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
        <StatCard label="Annonces en attente" value={enAttente || 12} sub="À vérifier" tone="orange" />
        <StatCard label="Annonces publiées" value={isSuper ? 542 : publiees || 8} sub="+18%" tone="green" />
        <StatCard
          label="Paiements aujourd'hui"
          value={isSuper ? "125 000 FCFA" : "8"}
          sub={isSuper ? "+33%" : "+25% vs hier"}
          tone="blue"
        />
        <StatCard label="Signalements" value={aTraiter || 6} sub="À traiter" tone="red" />
      </div>

      {isSuper && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="Propriétaires actifs" value="1 248" sub="+21%" tone="plain" />
          <StatCard label="Étudiants actifs" value="3 452" sub="+31%" tone="plain" />
          <StatCard label="Contacts générés" value="2 865" sub="+29%" tone="plain" />
          <StatCard label="Revenus (ce mois)" value="2 450 000 FCFA" sub="+27%" tone="plain" />
        </div>
      )}

      {!isSuper && (
        <>
          <h2 className="font-semibold text-brand-navy mb-3">Actions prioritaires</h2>
          <div className="grid sm:grid-cols-2 gap-4 mb-8">
            <div className="rounded-2xl bg-brand-blue-light p-5 flex items-start gap-3">
              <ClipboardList className="text-brand-blue shrink-0" size={20} />
              <div>
                <p className="font-semibold text-brand-navy text-sm">Vérifier les annonces en attente</p>
                <p className="text-xs text-gray-500 mt-0.5">{enAttente} annonces sont en attente de vérification.</p>
                <Link
                  to={`${base}/annonces`}
                  className="mt-3 inline-block rounded-full bg-brand-blue px-4 py-1.5 text-xs font-semibold text-white"
                >
                  Vérifier maintenant
                </Link>
              </div>
            </div>
            <div className="rounded-2xl bg-red-50 p-5 flex items-start gap-3">
              <AlertTriangle className="text-red-500 shrink-0" size={20} />
              <div>
                <p className="font-semibold text-brand-navy text-sm">Signalements à traiter</p>
                <p className="text-xs text-gray-500 mt-0.5">{aTraiter} signalements nécessitant votre attention.</p>
                <Link
                  to={`${base}/signalements`}
                  className="mt-3 inline-block rounded-full bg-red-500 px-4 py-1.5 text-xs font-semibold text-white"
                >
                  Voir les signalements
                </Link>
              </div>
            </div>
          </div>

          <h2 className="font-semibold text-brand-navy mb-3">Vue rapide</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Logements actifs" value="520" sub="+18%" tone="plain" small />
            <StatCard label="Étudiants actifs" value="1 256" sub="+22%" tone="plain" small />
            <StatCard label="Contacts générés" value="352" sub="+15%" tone="plain" small />
            <StatCard label="Revenu (mois)" value="350 000 FCFA" sub="+30%" tone="plain" small />
          </div>
        </>
      )}

      {isSuper && (
        <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 mt-2">
          <div className="rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-brand-navy mb-4">Activités récentes</h2>
            <ul className="space-y-3">
              {activitesRecentes.map((a) => (
                <li key={a.text} className="flex justify-between gap-4 text-sm border-b border-gray-50 last:border-0 pb-3 last:pb-0">
                  <span className="text-gray-600">{a.text}</span>
                  <span className="text-xs text-gray-400 shrink-0">{a.date}</span>
                </li>
              ))}
            </ul>
            <Link to={`${base}/logs`} className="mt-3 inline-block text-xs font-semibold text-brand-blue">
              Voir plus de logs
            </Link>
          </div>
          <div className="rounded-2xl border border-gray-100 p-5">
            <h2 className="font-semibold text-brand-navy mb-4">Répartition par ville</h2>
            <DonutChart data={repartitionParVille.map((v) => ({ label: v.ville, value: v.pct, color: v.color }))} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  tone,
  small,
}: {
  label: string;
  value: string | number;
  sub: string;
  tone: "orange" | "green" | "blue" | "red" | "plain";
  small?: boolean;
}) {
  const toneClass: Record<string, string> = {
    orange: "text-orange-500",
    green: "text-brand-green",
    blue: "text-brand-blue",
    red: "text-red-500",
    plain: "text-brand-green",
  };
  return (
    <div className={`rounded-2xl border border-gray-100 ${small ? "p-4" : "p-5"}`}>
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`font-display font-bold text-brand-navy ${small ? "text-lg" : "text-2xl"} mt-1`}>{value}</p>
      <p className={`text-xs mt-0.5 font-medium ${toneClass[tone]}`}>{sub}</p>
    </div>
  );
}
