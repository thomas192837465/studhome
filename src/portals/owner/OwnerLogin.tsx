import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { KeyRound, MessageSquare, Users, BarChart3, ShieldCheck } from "lucide-react";
import { OwnerPublicHeader } from "./OwnerPublicHeader";
import { Footer } from "../../components/Footer";
import { useOwner } from "../../context/OwnerContext";

type Step = "email" | "code";

export function OwnerLogin() {
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useOwner();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (step !== "code" || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await sendOtp(email);
      setStep("code");
      setSeconds(30);
    } catch {
      setError("Impossible d'envoyer le code. Vérifiez votre adresse email.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
    try {
      await verifyOtp(email, code.trim());
      navigate("/proprietaire/tableau-de-bord");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code incorrect ou expiré.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await sendOtp(email);
      setSeconds(30);
    } catch {
      setError("Impossible de renvoyer le code pour le moment.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <OwnerPublicHeader />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-14">
        <div className="grid sm:grid-cols-2 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-brand-blue-light p-10 flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm mb-6">
              {step === "email" ? <KeyRound size={32} /> : <MessageSquare size={32} />}
            </div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Bon retour !</h2>
            <p className="mt-2 text-sm text-gray-500">Connectez-vous pour publier votre logement.</p>
          </div>

          {step === "email" ? (
            <form onSubmit={handleSendCode} className="p-8 sm:p-10 space-y-5">
              <h3 className="font-display text-lg font-bold text-brand-navy">Connexion</h3>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-navy">Email</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                {sending ? "Envoi en cours..." : "Recevoir le code par email"}
              </button>
              <p className="text-center text-sm text-gray-500">
                Pas encore de compte ?{" "}
                <Link to="/proprietaire/inscription" className="font-semibold text-brand-blue">
                  Créer un compte propriétaire
                </Link>
              </p>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="p-8 sm:p-10 space-y-5">
              <h3 className="font-display text-lg font-bold text-brand-navy">Vérification</h3>
              <p className="text-sm text-gray-500">
                Code envoyé à <span className="font-semibold text-brand-navy">{email}</span>
              </p>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
                inputMode="numeric"
                autoFocus
                placeholder="Code de vérification"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              <p className="text-center text-xs text-gray-400">
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
                className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
              >
                {verifying ? "Vérification..." : "Vérifier et continuer"}
              </button>
              <button type="button" onClick={() => setStep("email")} className="w-full text-center text-sm text-gray-400">
                Changer d'adresse email
              </button>
            </form>
          )}
        </div>

        <div className="mt-10">
          <h3 className="font-display text-lg font-bold text-brand-navy mb-5 text-center">
            Pourquoi créer un compte sur StudHome ?
          </h3>
          <div className="grid sm:grid-cols-3 gap-6">
            <Feature
              icon={Users}
              title="Suivez vos contacts"
              text="Recevez et gérez toutes les demandes des étudiants intéressés."
            />
            <Feature
              icon={BarChart3}
              title="Statistiques détaillées"
              text="Analysez les vues, favoris et contacts pour chaque annonce."
            />
            <Feature
              icon={ShieldCheck}
              title="Service de confiance"
              text="Vos annonces sont vérifiées pour garantir aux étudiants des informations fiables."
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Feature({ icon: Icon, title, text }: { icon: typeof Users; title: string; text: string }) {
  return (
    <div>
      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue mb-3">
        <Icon size={20} />
      </span>
      <p className="font-semibold text-brand-navy text-sm">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{text}</p>
    </div>
  );
}
