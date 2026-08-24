import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, MessageSquare, PartyPopper } from "lucide-react";
import { OwnerPublicHeader } from "./OwnerPublicHeader";
import { Footer } from "../../components/Footer";
import { CameroonFlag } from "../../components/CameroonFlag";
import { useOwner } from "../../context/OwnerContext";

type Step = 1 | 2 | 3;

export function OwnerSignup() {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useOwner();
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+237 699 999 999");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(28);

  useEffect(() => {
    if (step !== 2) return;
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await sendOtp(email, { fullName, phone });
      setStep(2);
      setSeconds(28);
    } catch {
      setError("Impossible d'envoyer le code. Vérifiez votre adresse email.");
    } finally {
      setSending(false);
    }
  };

  const handleStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
    try {
      await verifyOtp(email, code.trim());
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code incorrect ou expiré.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await sendOtp(email, { fullName, phone });
      setSeconds(28);
    } catch {
      setError("Impossible de renvoyer le code pour le moment.");
    }
  };

  const finish = () => {
    navigate("/proprietaire/publier");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <OwnerPublicHeader />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 sm:px-6 py-14">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-1.5 w-14 rounded-full ${s <= step ? "bg-brand-blue" : "bg-gray-200"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
              <Lock size={24} />
            </div>
            <h2 className="font-display text-xl font-bold text-brand-navy text-center">
              Créer un compte propriétaire
            </h2>
            <p className="mt-1 text-center text-sm text-gray-400">Étape 1 sur 2</p>

            <form onSubmit={handleStep1} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-navy">Nom complet</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex : Jean Paul Mbarga"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-navy">Téléphone WhatsApp</span>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 focus-within:ring-2 focus-within:ring-brand-blue/30">
                  <CameroonFlag className="h-3.5 w-5 rounded-sm shrink-0" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    required
                    className="w-full text-sm focus:outline-none"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-navy">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  type="email"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </label>
              <p className="text-xs text-gray-400">
                Nous vous enverrons un code de vérification par email — aucun mot de passe requis.
              </p>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
              >
                {sending ? "Envoi en cours..." : "Continuer"}
              </button>
              <p className="text-center text-sm text-gray-500">
                Déjà un compte ?{" "}
                <Link to="/proprietaire/connexion" className="font-semibold text-brand-blue">
                  Se connecter
                </Link>
              </p>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-sm text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
              <MessageSquare size={24} />
            </div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Vérification de votre email</h2>
            <p className="mt-2 text-sm text-gray-500">
              Entrez le code envoyé à
              <br />
              <span className="font-semibold text-brand-navy">{email}</span>
            </p>

            <form onSubmit={handleStep2}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                autoFocus
                placeholder="Code de vérification"
                className="mt-6 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
              <p className="mt-4 text-xs text-gray-400">
                {seconds > 0 ? (
                  `Renvoyer le code dans ${seconds}s`
                ) : (
                  <button type="button" onClick={handleResend} className="font-semibold text-brand-blue">
                    Renvoyer le code
                  </button>
                )}
              </p>
              <button
                type="submit"
                disabled={verifying || !code}
                className="mt-6 w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
              >
                {verifying ? "Vérification..." : "Vérifier et continuer"}
              </button>
              <button type="button" onClick={() => setStep(1)} className="mt-3 w-full text-center text-sm text-gray-400">
                Changer d'adresse email
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-3xl border border-gray-100 p-10 shadow-sm text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
              <PartyPopper size={30} />
            </div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Compte créé avec succès !</h2>
            <p className="mt-2 text-sm text-gray-500">
              Vous pouvez maintenant publier votre premier logement et recevoir des demandes d'étudiants.
            </p>
            <button
              onClick={finish}
              className="mt-7 w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
            >
              Publier mon logement
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
