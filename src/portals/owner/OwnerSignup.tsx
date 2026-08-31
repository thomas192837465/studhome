import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Home, User, Mail, Lock, Eye, EyeOff, Check, ShieldCheck, PartyPopper } from "lucide-react";
import { OwnerPublicHeader } from "./OwnerPublicHeader";
import { Footer } from "../../components/Footer";
import { CameroonFlag } from "../../components/CameroonFlag";
import { WhatsAppIcon } from "../../components/WhatsAppIcon";
import { MfaChallengeForm } from "../../components/MfaChallengeForm";
import { useOwner } from "../../context/OwnerContext";
import type { TwoFactorMethod } from "../../lib/twoFactor";

type Step = 1 | 2 | 3;

export function OwnerSignup() {
  const navigate = useNavigate();
  const { mfaPending, mfaMethod, mfaIdentifier, signup, completeMfaChallenge } = useOwner();
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [method, setMethod] = useState<TwoFactorMethod>("sms");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPasswordInput] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const identifier = method === "sms" ? phone : email;

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep(2);
  };

  // Only creates the account once the SMS/email code has been verified — an
  // abandoned signup never leaves a real (2FA-less) account behind.
  const handleAccountCreation = async () => {
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
          <>
            <div className="rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-sm">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
                <Home size={24} />
              </div>
              <h2 className="font-display text-xl font-bold text-brand-navy text-center">
                Créer un compte propriétaire
              </h2>
              <p className="mt-1 text-center text-sm font-medium text-brand-blue">Étape 1 sur 2</p>

              <form onSubmit={handleStep1} className="mt-6 space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-brand-navy">Nom complet</span>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ex : Jean Paul Mbarga"
                      required
                      className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    />
                  </div>
                </label>

                <div>
                  <span className="mb-1.5 block text-sm font-medium text-brand-navy">
                    Comment souhaitez-vous créer votre compte ?
                  </span>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMethod("sms")}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-4 transition-colors ${
                        method === "sms" ? "border-brand-green bg-brand-green-light/40" : "border-gray-200"
                      }`}
                    >
                      {method === "sms" && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-green text-white">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                      <WhatsAppIcon size={22} />
                      <span className="font-semibold text-brand-navy text-sm">WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMethod("email")}
                      className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 py-4 transition-colors ${
                        method === "email" ? "border-brand-blue bg-brand-blue-light/40" : "border-gray-200"
                      }`}
                    >
                      {method === "email" && (
                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-blue text-white">
                          <Check size={12} strokeWidth={3} />
                        </span>
                      )}
                      <Mail size={22} className="text-brand-blue" />
                      <span className="font-semibold text-brand-navy text-sm">Email</span>
                    </button>
                  </div>
                </div>

                {method === "sms" ? (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-brand-navy">Numéro WhatsApp</span>
                    <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 focus-within:ring-2 focus-within:ring-brand-blue/30">
                      <CameroonFlag className="h-3.5 w-5 rounded-sm shrink-0" />
                      <span className="text-sm text-gray-500">+237</span>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                        placeholder="6XX XXX XXX"
                        required
                        className="w-full text-sm focus:outline-none"
                      />
                    </div>
                    <span className="mt-1.5 block text-xs text-gray-400">
                      Nous utiliserons ce numéro pour vous envoyer un code de vérification.
                    </span>
                  </label>
                ) : (
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-brand-navy">Adresse email</span>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="exemple@email.com"
                        required
                        className="w-full rounded-xl border border-gray-200 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                      />
                    </div>
                    <span className="mt-1.5 block text-xs text-gray-400">
                      Nous utiliserons cette adresse pour vous envoyer un code de vérification.
                    </span>
                  </label>
                )}

                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-brand-navy">Mot de passe</span>
                  <div className="relative">
                    <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      value={password}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      type={showPw ? "text" : "password"}
                      required
                      minLength={8}
                      className="w-full rounded-xl border border-gray-200 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((s) => !s)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </label>

                {method === "sms" ? (
                  <div className="flex items-start gap-2.5 rounded-xl bg-brand-green-light px-4 py-3 text-sm text-green-800">
                    <WhatsAppIcon size={18} className="mt-0.5 shrink-0" />
                    Un code de vérification vous sera envoyé sur WhatsApp pour confirmer votre numéro.
                  </div>
                ) : (
                  <div className="flex items-start gap-2.5 rounded-xl bg-brand-blue-light px-4 py-3 text-sm text-blue-800">
                    <Mail size={18} className="mt-0.5 shrink-0 text-brand-blue" />
                    Un code de vérification vous sera envoyé par email pour confirmer votre adresse.
                  </div>
                )}

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
                >
                  Continuer →
                </button>

                <p className="text-center text-sm text-gray-400">
                  {method === "sms"
                    ? "Vous pourrez ajouter votre email plus tard dans votre profil si vous le souhaitez."
                    : "Vous pourrez ajouter votre numéro WhatsApp plus tard dans votre profil si vous le souhaitez."}
                </p>

                <p className="text-center text-sm text-gray-500">
                  Déjà un compte ?{" "}
                  <Link to="/proprietaire/connexion" className="font-semibold text-brand-blue">
                    Se connecter
                  </Link>
                </p>
              </form>
            </div>

            <div className="mt-5 flex items-start gap-3 rounded-2xl bg-brand-blue-light/50 border border-brand-blue-light px-5 py-4">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-brand-blue" />
              <div>
                <p className="text-sm font-semibold text-brand-navy">Vos informations sont sécurisées</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  Nous ne partagerons jamais vos informations personnelles avec des tiers.
                </p>
              </div>
            </div>
          </>
        ) : step === 2 ? (
          <div className="rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-sm">
            <p className="mb-5 text-center text-sm text-gray-500">Étape 2 sur 2</p>
            <MfaChallengeForm method={method} identifier={identifier} onVerified={handleAccountCreation} />
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
