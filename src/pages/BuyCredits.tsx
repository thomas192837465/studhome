import { useNavigate } from "react-router-dom";
import { CreditCard, Lock, DollarSign, ShieldCheck } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { creditPacks } from "../data/creditPacks";

export function BuyCredits() {
  const navigate = useNavigate();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <CreditCard className="text-brand-navy" size={26} />
        <h1 className="font-display text-2xl font-bold text-brand-navy">Achat de crédits</h1>
      </div>
      <p className="text-gray-500 mb-8">Achetez des crédits pour contacter les propriétaires et réserver vos logements.</p>

      <h2 className="font-semibold text-brand-navy mb-4">Choisissez votre pack</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {creditPacks.map((pack) => (
          <div
            key={pack.id}
            className={`relative rounded-2xl border p-6 text-center flex flex-col ${
              pack.popular ? "border-brand-green bg-brand-green-light" : "border-gray-100"
            }`}
          >
            {pack.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brand-green px-3 py-1 text-xs font-semibold text-white">
                Populaire
              </span>
            )}
            <h3 className="font-display font-bold text-brand-navy">{pack.name}</h3>
            <p className="text-sm text-gray-500">{pack.credits} crédits</p>
            <p className="mt-4 font-display text-3xl font-bold text-brand-navy">
              {pack.price.toLocaleString("fr-FR")} <span className="text-base font-semibold">FCFA</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">Valable {pack.validityDays} jours</p>

            <ul className="mt-5 space-y-2 text-sm text-left flex-1">
              <li className="flex items-center gap-2 text-green-700">
                <FontAwesomeIcon icon={faCheck} className="h-3 w-3" /> {pack.tagline}
              </li>
              <li className="flex items-center gap-2 text-green-700">
                <FontAwesomeIcon icon={faCheck} className="h-3 w-3" /> {pack.contacts} contacts propriétaires
              </li>
            </ul>

            <button
              onClick={() => navigate(`/credits/paiement?pack=${pack.id}`)}
              className={`mt-6 rounded-xl py-2.5 font-semibold transition-colors ${
                pack.popular
                  ? "bg-brand-green text-white hover:bg-green-700"
                  : "border border-gray-300 text-brand-navy hover:bg-gray-50"
              }`}
            >
              Acheter
            </button>
          </div>
        ))}
      </div>

      <div className="mt-10 flex flex-wrap justify-center gap-8 text-sm text-brand-blue">
        <span className="flex items-center gap-2">
          <Lock size={16} /> Paiement 100% sécurisé
        </span>
        <span className="flex items-center gap-2">
          <DollarSign size={16} /> Crédits utilisables immédiatement
        </span>
        <span className="flex items-center gap-2">
          <ShieldCheck size={16} /> Remboursement garanti
        </span>
      </div>
    </div>
  );
}
