import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight, GraduationCap, Building2 } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import loginBedroom from "../assets/images/login-bedroom.jpg";
import testimonialLinda from "../assets/images/testimonial-linda.jpg";
import { Logo } from "../components/Logo";
import { MfaChallengeForm } from "../components/MfaChallengeForm";
import { MfaEnrollForm } from "../components/MfaEnrollForm";
import { useApp } from "../context/AppContext";
import { supabase } from "../lib/supabase";

type Tab = "connexion" | "inscription";
type Step = "form" | "phone";

export function Login() {
  const [params] = useSearchParams();
  const initialTab: Tab = params.get("tab") === "inscription" ? "inscription" : "connexion";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [accountType, setAccountType] = useState<"etudiant" | null>(null);
  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPasswordInput] = useState("");
  const [signingUp, setSigningUp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, mfaPending, signup, login } = useApp();

  // Guarded to the "connexion" tab only: signing up flips isAuthenticated
  // true right away (a brand-new account has no MFA factor yet), but the
  // signup flow still has a mandatory phone-2FA step to complete first.
  useEffect(() => {
    if (tab === "connexion" && isAuthenticated) navigate("/home", { replace: true });
  }, [isAuthenticated, tab, navigate]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setAccountType(null);
    setStep("form");
    setError("");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSigningUp(true);
    try {
      await signup(email, password, { firstName, lastName });
      setStep("phone");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de créer le compte.");
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

        {mfaPending ? (
          <div className="mt-8">
            <MfaChallengeForm onVerified={() => {}} />
          </div>
        ) : step === "phone" ? (
          <div className="mt-8 max-w-sm">
            <p className="mb-4 text-sm text-gray-500">
              Dernière étape : sécurisez votre compte avec un code envoyé par SMS.
            </p>
            <MfaEnrollForm onEnrolled={() => navigate("/profil", { replace: true })} />
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
              <form onSubmit={handleSignup} className="mt-6 max-w-sm space-y-4">
                <button
                  type="button"
                  onClick={() => setAccountType(null)}
                  className="text-sm font-medium text-gray-400"
                >
                  ← Retour
                </button>
                <Field label="Prénom" value={firstName} onChange={setFirstName} />
                <Field label="Nom" value={lastName} onChange={setLastName} />
                <Field label="Email" type="email" value={email} onChange={setEmail} />
                <Field label="Mot de passe" type="password" value={password} onChange={setPasswordInput} minLength={8} />
                <p className="text-xs text-gray-400">
                  Après création du compte, vous sécuriserez votre connexion avec un code envoyé par SMS.
                </p>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                  type="submit"
                  disabled={signingUp}
                  className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
                >
                  {signingUp ? "Création du compte..." : "Créer mon compte"}
                </button>

                <p className="text-center text-sm text-gray-500">
                  Déjà un compte ?{" "}
                  <button type="button" onClick={() => switchTab("connexion")} className="font-semibold text-brand-blue">
                    Se connecter
                  </button>
                </p>
              </form>
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
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  minLength?: number;
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
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
      />
    </label>
  );
}
