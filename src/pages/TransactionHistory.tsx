import { useState } from "react";
import { Clock } from "lucide-react";
import { useApp } from "../context/AppContext";
import type { Transaction } from "../data/types";

const tabs = ["Toutes", "Achats de crédits", "Utilisations", "Remboursements"] as const;

function matchesTab(tx: Transaction, tab: (typeof tabs)[number]) {
  if (tab === "Toutes") return true;
  if (tab === "Achats de crédits") return tx.type === "Achat";
  if (tab === "Utilisations") return tx.type === "Utilisation";
  return tx.type === "Remboursement";
}

export function TransactionHistory() {
  const { transactions } = useApp();
  const [tab, setTab] = useState<(typeof tabs)[number]>("Toutes");
  const [page, setPage] = useState(1);

  const filtered = transactions.filter((t) => matchesTab(t, tab));
  const perPage = 5;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <Clock className="text-brand-navy" size={26} />
        <h1 className="font-display text-2xl font-bold text-brand-navy">Historique des transactions</h1>
      </div>
      <p className="text-gray-500 mb-8">Consultez toutes vos transactions et mouvements de crédits.</p>

      <div className="flex flex-wrap gap-6 border-b border-gray-100 mb-4">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => {
              setTab(t);
              setPage(1);
            }}
            className={`pb-3 text-sm font-semibold border-b-2 -mb-px transition-colors ${
              tab === t ? "border-brand-blue text-brand-blue" : "border-transparent text-gray-500"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-5 py-3 font-semibold">Date</th>
              <th className="px-5 py-3 font-semibold">Type</th>
              <th className="px-5 py-3 font-semibold">Description</th>
              <th className="px-5 py-3 font-semibold">Crédits</th>
              <th className="px-5 py-3 font-semibold">Montant</th>
              <th className="px-5 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center text-gray-400">
                  Aucune transaction.
                </td>
              </tr>
            ) : (
              paged.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-4 text-brand-navy">{tx.date}</td>
                  <td className="px-5 py-4 text-gray-600">{tx.type}</td>
                  <td className="px-5 py-4 text-gray-600">{tx.description}</td>
                  <td className={`px-5 py-4 font-semibold ${tx.credits >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {tx.credits >= 0 ? "+" : ""}
                    {tx.credits}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{tx.amount.toLocaleString("fr-FR")} FCFA</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-brand-green-light px-2.5 py-1 text-xs font-medium text-green-700">
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              onClick={() => setPage(n)}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                n === page ? "bg-brand-blue text-white" : "border border-gray-200 text-gray-600"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
