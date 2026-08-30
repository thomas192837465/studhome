import { useAdminPortal } from "../../context/AdminPortalContext";

export function Paiements() {
  const { transactions } = useAdminPortal();
  const total = transactions.reduce((s, t) => s + t.montant, 0);
  const totalCredits = transactions.reduce((s, t) => s + Number(t.pack.replace(/\D/g, "")), 0);
  const panierMoyen = transactions.length ? Math.round(total / transactions.length) : 0;

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Paiements</h1>
          <p className="mt-1 text-sm text-gray-500">Suivez les transactions et revenus de la plateforme.</p>
        </div>
        <select className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none">
          <option>Tous les modes</option>
          <option>KoraPay</option>
          <option>CinetPay</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Stat label="Revenus totaux" value={`${total.toLocaleString("fr-FR")} FCFA`} />
        <Stat label="Transactions" value={transactions.length} />
        <Stat label="Crédits vendus" value={totalCredits} />
        <Stat label="Panier moyen" value={`${panierMoyen.toLocaleString("fr-FR")} FCFA`} />
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[720px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-5 py-3 font-semibold">#</th>
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Utilisateur</th>
              <th className="px-5 py-3 font-semibold">Pack</th>
              <th className="px-5 py-3 font-semibold">Mode de paiement</th>
              <th className="px-5 py-3 font-semibold">Montant</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center text-gray-400">
                  Aucune transaction pour l'instant.
                </td>
              </tr>
            )}
            {transactions.map((t) => (
              <tr key={t.id} className="border-b border-gray-50 last:border-0">
                <td className="px-5 py-3.5 text-gray-500">{t.id}</td>
                <td className="px-5 py-3.5 text-gray-500">{t.date}</td>
                <td className="px-5 py-3.5 text-brand-navy font-medium">{t.utilisateur}</td>
                <td className="px-5 py-3.5 text-gray-600">{t.pack}</td>
                <td className="px-5 py-3.5 text-gray-600">{t.mode}</td>
                <td className="px-5 py-3.5 text-gray-600">{t.montant.toLocaleString("fr-FR")} FCFA</td>
                <td className="px-5 py-3.5">
                  <span className="rounded-full bg-brand-green-light px-2.5 py-0.5 text-xs font-medium text-green-700">
                    {t.statut}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-center">
        <button className="text-sm font-semibold text-brand-blue">Voir toutes les transactions</button>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-display text-xl font-bold text-brand-navy mt-1">{value}</p>
      {sub && <p className="text-xs text-brand-green font-medium mt-0.5">{sub}</p>}
    </div>
  );
}
