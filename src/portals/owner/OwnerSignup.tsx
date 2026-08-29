import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, PartyPopper } from "lucide-react";
import { OwnerPublicHeader } from "./OwnerPublicHeader";
import { Footer } from "../../components/Footer";
import { CameroonFlag } from "../../components/CameroonFlag";
import { MfaChallengeForm } from "../../components/MfaChallengeForm";
import { MfaEnrollForm } from "../../components/MfaEnrollForm";
import { useOwner } from "../../context/OwnerContext";
import type { TwoFactorMethod } from "../../lib/twoFactor";

type Step = 1 | 2 | 3;

export function OwnerSignup() {
  const navigate = useNavigate();
  const { mfaPending, mfaMethod, mfaIdentifier, signup, completeMfaChallenge } = useOwner();
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPasswordInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep(2);
  };

  // Only creates the account once the SMS/email code has been verified — an
  // abandoned signup never leaves a real (2FA-less) account behind.
  const handleAccountCreation = async (method: TwoFactorMethod, identifier: string) => {
    setError("");
    setSending(true);
    try {
      await signup(email, password, { fullName }, { method, identifier });
      setStep(3);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer le compte.");
      setStep(1);
    } finally {
      setSending(false);
    }
  };

  const finish = () => {
    navigate("/proprietaire/profil");
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

        {mfaPending && mfaMethod ? (
          <div className="rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-sm">
            <MfaChallengeForm method={mfaMethod} identifier={mfaIdentifier} onVerified={completeMfaChallenge} />
          </div>
        ) : step === 1 ? (
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
                    placeholder="+237 6XX XXX XXX"
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
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-navy">Mot de passe</span>
                <input
                  value={password}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  type="password"
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </label>
              <p className="text-xs text-gray-400">
                Un code de vérification (SMS ou email, au choix) vous sera envoyé avant la création du compte.
              </p>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
              >
                Continuer
              </button>
              <p className="text-center text-sm text-gray-500">
                Déjà un compte ?{" "}
                <Link to="/proprietaire/connexion" className="font-semibold text-brand-blue">
                  Se connecter
                </Link>
              </p>
            </form>
          </div>
        ) : step === 2 ? (
          <div className="rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-sm">
            <h2 className="font-display text-xl font-bold text-brand-navy text-center mb-1">
              Sécurisez votre compte
            </h2>
            <p className="mb-5 text-center text-sm text-gray-500">Étape 2 sur 2</p>
            <MfaEnrollForm email={email} initialPhone={phone} onVerified={handleAccountCreation} />
            {sending && <p className="mt-3 text-center text-sm text-gray-500">Création du compte...</p>}
            {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
          </div>
        ) : (
          <div className="rounded-3xl border border-gray-100 p-10 shadow-sm text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
              <PartyPopper size={30} />
            </div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Compte créé avec succès !</h2>
            <p className="mt-2 text-sm text-gray-500">
              Complétez votre profil pour pouvoir publier votre premier logement.
            </p>
            <button
              onClick={finish}
              className="mt-7 w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
            >
              Compléter mon profil
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
