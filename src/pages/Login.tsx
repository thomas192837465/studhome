import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse } from "@fortawesome/free-solid-svg-icons";
import loginBedroom from "../assets/images/login-bedroom.jpg";
import testimonialLinda from "../assets/images/testimonial-linda.jpg";
import { Logo } from "../components/Logo";
import { useApp } from "../context/AppContext";

type Tab = "connexion" | "inscription";
type Step = "form" | "code";

export function Login() {
  const [params] = useSearchParams();
  const initialTab: Tab = params.get("tab") === "inscription" ? "inscription" : "connexion";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [seconds, setSeconds] = useState(30);
  const navigate = useNavigate();
  const { sendOtp, verifyOtp } = useApp();

  useEffect(() => {
    if (step !== "code" || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const switchTab = (t: Tab) => {
    setTab(t);
    setStep("form");
    setError("");
    setCode("");
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await sendOtp(email, tab === "inscription" ? { firstName, lastName } : undefined);
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
      navigate("/home");
    } catch {
      setError("Code incorrect ou expiré. Réessayez ou renvoyez un nouveau code.");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError("");
    try {
      await sendOtp(email, tab === "inscription" ? { firstName, lastName } : undefined);
      setSeconds(30);
    } catch {
      setError("Impossible de renvoyer le code pour le moment.");
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

        {step === "form" && (
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
        )}

        {step === "form" ? (
          <form onSubmit={handleSendCode} className="mt-6 max-w-sm space-y-4">
            {tab === "inscription" && (
              <>
                <Field label="Prénom" value={firstName} onChange={setFirstName} />
                <Field label="Nom" value={lastName} onChange={setLastName} />
              </>
            )}
            <Field label="Email" type="email" value={email} onChange={setEmail} />
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
              {tab === "connexion" ? (
                <>
                  Pas encore de compte ?{" "}
                  <button type="button" onClick={() => switchTab("inscription")} className="font-semibold text-brand-blue">
                    Créer un compte
                  </button>
                </>
              ) : (
                <>
                  Déjà un compte ?{" "}
                  <button type="button" onClick={() => switchTab("connexion")} className="font-semibold text-brand-blue">
                    Se connecter
                  </button>
                </>
              )}
            </p>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="mt-6 max-w-sm">
            <p className="text-sm text-gray-500">
              Entrez le code envoyé à <span className="font-semibold text-brand-navy">{email}</span>
            </p>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
              inputMode="numeric"
              autoFocus
              placeholder="Code de vérification"
              className="mt-5 w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />

            {error && <p className="mt-3 text-sm text-red-500 text-center">{error}</p>}

            <p className="mt-4 text-center text-xs text-gray-400">
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
            <button
              type="button"
              onClick={() => setStep("form")}
              className="mt-3 w-full text-center text-sm text-gray-400"
            >
              Changer d'adresse email
            </button>
          </form>
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
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-brand-navy">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
      />
    </label>
  );
}
