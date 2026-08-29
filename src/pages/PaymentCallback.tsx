import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, XCircle } from "lucide-react";
import { useApp } from "../context/AppContext";

export function PaymentCallback() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { buyPack, authLoading, isAuthenticated } = useApp();
  const [failed, setFailed] = useState(false);
  const [errorDetail, setErrorDetail] = useState("");
  const ran = useRef(false);

  useEffect(() => {
    // KoraPay's checkout is a full-page redirect, so this component always
    // mounts on a fresh page load — the Supabase session hasn't finished
    // restoring yet at that instant. Calling buyPack() before authLoading
    // settles would silently no-op (it bails out when authUserId is still
    // null) and the credits would be lost even though the charge succeeded.
    if (authLoading) return;
    if (ran.current) return;
    ran.current = true;

    if (!isAuthenticated) {
      setFailed(true);
      setErrorDetail("Votre session a expiré. Reconnectez-vous puis contactez le support avec votre référence de paiement.");
      return;
    }

    // KoraPay redirects back here with "?reference=<ours>" appended verbatim
    // (the reference we generated during initialize), so no extra param
    // juggling is needed to disambiguate it from a provider-side id.
    const reference = params.get("reference");
    if (!reference) {
      setFailed(true);
      setErrorDetail("Référence de paiement manquante.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`/api/korapay/verify?reference=${encodeURIComponent(reference)}`);
        const data = await res.json();
        if (data.success) {
          await buyPack(data.credits, data.price, data.packName);
          navigate(`/credits/succes?pack=${data.packId}`, { replace: true });
        } else {
          setFailed(true);
          setErrorDetail(data.status === "amount_mismatch" ? "Montant du paiement incorrect." : `Paiement non confirmé (${data.status || data.error || "inconnu"}).`);
        }
      } catch {
        setFailed(true);
        setErrorDetail("Impossible de vérifier le paiement pour le moment.");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, isAuthenticated]);

  if (failed) {
    return (
      <div className="mx-auto max-w-lg px-4 sm:px-6 py-16 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <XCircle className="text-red-500" size={44} />
        </div>
        <h1 className="font-display text-2xl font-bold text-brand-navy">Paiement non confirmé</h1>
        <p className="mt-2 text-gray-500">{errorDetail}</p>
        <Link
          to="/credits/achat"
          className="mt-8 inline-block rounded-xl bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
        >
          Réessayer
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 sm:px-6 py-24 text-center">
      <Loader2 className="mx-auto animate-spin text-brand-blue" size={40} />
      <p className="mt-4 text-gray-500">Vérification du paiement en cours...</p>
    </div>
  );
}
