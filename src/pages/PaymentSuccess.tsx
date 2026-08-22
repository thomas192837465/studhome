import { useSearchParams, Link, Navigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { creditPacks } from "../data/creditPacks";
import { useApp } from "../context/AppContext";

export function PaymentSuccess() {
  const [params] = useSearchParams();
  const { credits } = useApp();
  const pack = creditPacks.find((p) => p.id === params.get("pack"));

  if (!pack) return <Navigate to="/credits/achat" replace />;

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-brand-green-light">
        <CheckCircle2 className="text-brand-green" size={44} />
      </div>
      <h1 className="font-display text-2xl font-bold text-brand-navy">Paiement réussi !</h1>
      <p className="mt-2 text-gray-500">Vous avez acheté {pack.credits} crédits avec succès.</p>

      <div className="mt-8 rounded-2xl border border-gray-100 p-6">
        <p className="text-sm text-gray-500">Nouveau solde</p>
        <p className="mt-1 font-display text-3xl font-bold text-brand-orange">{credits} crédits</p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <Link
          to="/logements"
          className="rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
        >
          Retour à l'annonce
        </Link>
        <Link to="/credits/historique" className="text-sm font-semibold text-brand-blue">
          Voir mes crédits
        </Link>
      </div>
    </div>
  );
}
