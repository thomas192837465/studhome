import { useState } from "react";
import { useSearchParams, Navigate, Link } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import { creditPacks, paymentMethods } from "../data/creditPacks";
import { useApp } from "../context/AppContext";

const PROVIDERS = [
  { id: "korapay", label: "KoraPay" },
  { id: "cinetpay", label: "CinetPay" },
] as const;
type Provider = (typeof PROVIDERS)[number]["id"];

export function Payment() {
  const [params] = useSearchParams();
  const { user } = useApp();
  const [method, setMethod] = useState<string>("mtn");
  const [provider, setProvider] = useState<Provider>("korapay");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  const pack = creditPacks.find((p) => p.id === params.get("pack"));
  if (!pack) return <Navigate to="/credits/achat" replace />;

  const handlePay = async () => {
    setProcessing(true);
    setError("");
    try {
      const res = await fetch(`/api/${provider}/initialize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId: pack.id,
          name: `${user.firstName} ${user.lastName}`.trim() || "Étudiant StudHome",
          email: user.email,
          phone: user.phone,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.checkoutUrl) {
        setError(data.error || "Impossible d'initialiser le paiement pour le moment.");
        setProcessing(false);
        return;
      }
      window.location.href = data.checkoutUrl;
    } catch {
      setError("Impossible de contacter le service de paiement.");
      setProcessing(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 sm:px-6 py-10">
      <Link to="/credits/achat" className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy mb-6">
        <ArrowLeft size={16} /> Retour
      </Link>

      <div className="rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <h1 className="font-display text-xl font-bold text-brand-navy mb-6">Paiement</h1>

        <h2 className="text-sm font-semibold text-gray-500 mb-2">Récapitulatif</h2>
        <div className="rounded-xl bg-gray-50 divide-y divide-gray-200 mb-6 text-sm">
          <div className="flex justify-between px-4 py-3">
            <span className="text-gray-500">Pack choisi</span>
            <span className="font-medium text-brand-navy">{pack.credits} crédits</span>
          </div>
          <div className="flex justify-between px-4 py-3">
            <span className="text-gray-500">Montant</span>
            <span className="font-medium text-brand-navy">{pack.price.toLocaleString("fr-FR")} FCFA</span>
          </div>
        </div>

        <h2 className="text-sm font-semibold text-gray-500 mb-2">Choisissez votre prestataire de paiement</h2>
        <div className="grid grid-cols-2 gap-3 mb-5">
          {PROVIDERS.map((p) => (
            <label
              key={p.id}
              className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 cursor-pointer transition-colors ${
                provider === p.id ? "border-brand-blue bg-brand-blue-light" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="provider"
                checked={provider === p.id}
                onChange={() => setProvider(p.id)}
                className="accent-brand-blue h-4 w-4"
              />
              <span className="font-semibold text-brand-navy text-sm">{p.label}</span>
            </label>
          ))}
        </div>

        <h2 className="text-sm font-semibold text-gray-500 mb-1">Choisissez votre méthode de paiement</h2>
        <p className="text-xs text-gray-400 mb-3">
          Vous confirmerez le paiement sur la page sécurisée {PROVIDERS.find((p) => p.id === provider)?.label}.
        </p>
        <div className="space-y-3 mb-6">
          {paymentMethods.map((m) => (
            <label
              key={m.id}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 cursor-pointer transition-colors ${
                method === m.id ? "border-brand-blue bg-brand-blue-light" : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name="method"
                checked={method === m.id}
                onChange={() => setMethod(m.id)}
                className="accent-brand-blue h-4 w-4"
              />
              <PaymentIcon id={m.id} />
              <span className="font-medium text-brand-navy text-sm">{m.label}</span>
            </label>
          ))}
        </div>

        {error && <p className="mb-3 text-sm text-red-500 text-center">{error}</p>}

        <button
          onClick={handlePay}
          disabled={processing}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-blue py-3.5 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
        >
          <Lock size={15} /> {processing ? "Redirection en cours..." : "Paiement 100% sécurisé"}
        </button>
      </div>
    </div>
  );
}

function PaymentIcon({ id }: { id: string }) {
  const colors: Record<string, string> = {
    mtn: "bg-yellow-400 text-black",
    orange: "bg-orange-500 text-white",
    visa: "bg-blue-800 text-white",
  };
  const label: Record<string, string> = { mtn: "MTN", orange: "OM", visa: "VISA" };
  return (
    <span className={`flex h-8 w-12 shrink-0 items-center justify-center rounded-md text-[10px] font-bold ${colors[id]}`}>
      {label[id]}
    </span>
  );
}
