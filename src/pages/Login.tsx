import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, GraduationCap, Building2, Mail, Lock, Eye, EyeOff, Check, ShieldCheck } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import loginBedroom from "../assets/images/login-bedroom.jpg";
import testimonialLinda from "../assets/images/testimonial-linda.jpg";
import { Logo } from "../components/Logo";
import { CameroonFlag } from "../components/CameroonFlag";
import { WhatsAppIcon } from "../components/WhatsAppIcon";
import { MfaChallengeForm } from "../components/MfaChallengeForm";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";
import type { TwoFactorMethod } from "../lib/twoFactor";

type Tab = "connexion" | "inscription";
type Step = "form" | "code";

export function Login() {
  const [params] = useSearchParams();
  const initialTab: Tab = params.get("tab") === "inscription" ? "inscription" : "connexion";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [accountType, setAccountType] = useState<"etudiant" | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [method, setMethod] = useState<TwoFactorMethod>("sms");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPasswordInput] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [signingUp, setSigningUp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, mfaPending, mfaMethod, mfaIdentifier, signup, login, completeMfaChallenge } = useApp();

  // Guarded to the "connexion" tab only: navigating away on signup happens
  // explicitly once the account is actually created (see
  // handleAccountCreation) — isAuthenticated shouldn't drive it there.
  useEffect(() => {
    if (tab === "connexion" && isAuthenticated) navigate("/home", { replace: true });
  }, [isAuthenticated, tab, navigate]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setAccountType(null);
    setStep("form");
    setError("");
  };

  const identifier = method === "sms" ? phone : email;

  const handleContinueToVerification = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStep("code");
  };

  // Only creates the account once the SMS/email code has been verified — an
  // abandoned signup never leaves a real (2FA-less) account behind.
  const handleAccountCreation = async () => {
    setError("");
    setSigningUp(true);
    try {
      await signup(email, password, { firstName, lastName }, { method, identifier });
      navigate("/profil", { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer le compte.");
      setStep("form");
    } finally {
      setSigningUp(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible.");
    } finally {
      setVerifying(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Renseignez votre email puis cliquez sur « Mot de passe oublié ? ».");
      return;
    }
    setError("");
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/definir-mot-de-passe`,
      });
      setResetSent(true);
    } catch {
      setError("Impossible d'envoyer l'email de réinitialisation.");
    }
  };

  return (
    <div className="min-h-[calc(100vh-70px)] grid lg:grid-cols-2">
      <div className="flex flex-col justify-center px-6 sm:px-14 py-14">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-brand-navy">Bienvenue sur StudHome</h1>
        <p className="mt-3 text-gray-500 max-w-sm">
          Le logement étudiant <span className="text-brand-orange font-semibold">simple</span>,{" "}
          <span className="text-brand-blue font-semibold">sûr</span> et{" "}
          <span className="text-brand-orange font-semibold">abordable</span>
          <br />
          Connectez-vous ou créez un compte pour trouver votre logement en toute confiance.
        </p>

        {mfaPending && mfaMethod ? (
          <div className="mt-8">
            <MfaChallengeForm method={mfaMethod} identifier={mfaIdentifier} onVerified={completeMfaChallenge} />
          </div>
        ) : step === "code" ? (
          <div className="mt-8 max-w-sm">
            <p className="mb-4 text-sm text-gray-500">Dernière étape avant de créer votre compte.</p>
            <MfaChallengeForm method={method} identifier={identifier} onVerified={handleAccountCreation} />
            {signingUp && <p className="mt-3 text-center text-sm text-gray-500">Création du compte...</p>}
            {error && <p className="mt-3 text-center text-sm text-red-500">{error}</p>}
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 rounded-xl bg-gray-100 p-1 max-w-sm">
              <button
                onClick={() => switchTab("connexion")}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                  tab === "connexion" ? "bg-white text-brand-navy shadow-sm" : "text-gray-500"
                }`}
              >
                Se connecter
              </button>
              <button
                onClick={() => switchTab("inscription")}
                className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${
                  tab === "inscription" ? "bg-white text-brand-navy shadow-sm" : "text-gray-500"
                }`}
              >
                Créer un compte
              </button>
            </div>

            {tab === "connexion" && (
              <form onSubmit={handleLogin} className="mt-6 max-w-sm space-y-4">
                <Field label="Email" type="email" value={email} onChange={setEmail} />
                <Field label="Mot de passe" type="password" value={password} onChange={setPasswordInput} />
                <button type="button" onClick={handleForgotPassword} className="text-sm font-medium text-brand-blue -mt-2">
                  Mot de passe oublié ?
                </button>

                {resetSent && (
                  <p className="text-sm text-brand-green">
                    Email de réinitialisation envoyé, vérifiez votre boîte de réception.
                  </p>
                )}
                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={verifying}
                  className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
                >
                  {verifying ? "Connexion..." : "Se connecter"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Pas encore de compte ?{" "}
                  <button type="button" onClick={() => switchTab("inscription")} className="font-semibold text-brand-blue">
                    Créer un compte
                  </button>
                </p>
              </form>
            )}

            {tab === "inscription" && accountType === null && (
              <div className="mt-6 max-w-sm space-y-3">
                <button
                  type="button"
                  onClick={() => setAccountType("etudiant")}
                  className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left hover:border-brand-blue hover:bg-brand-blue-light transition-colors"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-blue-light text-brand-blue">
                    <GraduationCap size={22} />
                  </span>
                  <span>
                    <span className="block font-semibold text-brand-navy">Créer un compte étudiant</span>
                    <span className="block text-sm text-gray-500">Recherchez et contactez des propriétaires.</span>
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/proprietaire/inscription")}
                  className="flex w-full items-center gap-4 rounded-xl border border-gray-200 p-4 text-left hover:border-brand-orange hover:bg-brand-orange-light transition-colors"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-orange-light text-brand-orange">
                    <Building2 size={22} />
                  </span>
                  <span>
                    <span className="block font-semibold text-brand-navy">Créer un compte propriétaire</span>
                    <span className="block text-sm text-gray-500">Publiez vos logements gratuitement.</span>
                  </span>
                </button>
                <p className="text-center text-sm text-gray-500 pt-2">
                  Déjà un compte ?{" "}
                  <button type="button" onClick={() => switchTab("connexion")} className="font-semibold text-brand-blue">
                    Se connecter
                  </button>
                </p>
              </div>
            )}

            {tab === "inscription" && accountType === "etudiant" && (
              <>
                <form onSubmit={handleContinueToVerification} className="mt-6 max-w-sm space-y-4">
                  <button
                    type="button"
                    onClick={() => setAccountType(null)}
                    className="text-sm font-medium text-gray-400"
                  >
                    ← Retour
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Prénom" value={firstName} onChange={setFirstName} />
                    <Field label="Nom" value={lastName} onChange={setLastName} />
                  </div>

                  <div>
                    <span className="mb-1.5 block text-sm font-semibold text-brand-navy">
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
                      <span className="mb-1.5 block text-sm font-semibold text-brand-navy">Numéro WhatsApp</span>
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
                      <span className="mb-1.5 block text-sm font-semibold text-brand-navy">Adresse email</span>
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
                    <span className="mb-1.5 block text-sm font-semibold text-brand-navy">Mot de passe</span>
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
                    className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
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
                    <button type="button" onClick={() => switchTab("connexion")} className="font-semibold text-brand-blue">
                      Se connecter
                    </button>
                  </p>
                </form>

                <div className="mt-5 max-w-sm flex items-start gap-3 rounded-2xl bg-brand-blue-light/50 border border-brand-blue-light px-5 py-4">
                  <ShieldCheck size={20} className="mt-0.5 shrink-0 text-brand-blue" />
                  <div>
                    <p className="text-sm font-semibold text-brand-navy">Vos informations sont sécurisées</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Nous ne partagerons jamais vos informations personnelles avec des tiers.
                    </p>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <div className="relative hidden lg:block overflow-hidden">
        <img src={loginBedroom} alt="Chambre étudiante" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
        <div className="absolute top-8 left-8 right-8 text-white">
          <h2 className="font-display text-2xl font-bold">Trouver votre logement partout au Cameroun</h2>
          <div className="mt-1 h-1 w-14 rounded-full bg-white/70" />
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-brand-navy text-sm shadow">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
              <FontAwesomeIcon icon={faHouse} className="h-3 w-3" />
            </span>
            <span>
              <span className="font-bold text-brand-blue">+ 10 000</span> logements disponibles
            </span>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex items-center gap-4">
          <div className="flex-1 rounded-2xl bg-white p-4 shadow-lg">
            <div className="flex items-center gap-2 mb-1.5">
              <img src={testimonialLinda} alt="Linda" className="h-8 w-8 rounded-full object-cover" />
              <div>
                <p className="text-sm font-semibold text-brand-navy leading-tight">Linda</p>
                <p className="text-[11px] text-gray-500">Université de Yaoundé I</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">
              "Ce que j'ai préféré avec StudHome c'est le fait d'avoir des photos de plusieurs logements..."
            </p>
          </div>
          <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white shadow-lg">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  type = "text",
  value,
  onChange,
  minLength,
  placeholder,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  minLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-brand-navy">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        placeholder={placeholder}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
      />
    </label>
  );
}
