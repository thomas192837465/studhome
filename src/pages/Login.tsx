import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import loginBedroom from "../assets/images/login-bedroom.jpg";
import testimonialLinda from "../assets/images/testimonial-linda.jpg";
import { Logo } from "../components/Logo";
import { useApp } from "../context/AppContext";

type Tab = "connexion" | "inscription";

export function Login() {
  const [params] = useSearchParams();
  const initialTab: Tab = params.get("tab") === "inscription" ? "inscription" : "connexion";
  const [tab, setTab] = useState<Tab>(initialTab);
  const navigate = useNavigate();
  const { login } = useApp();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login();
    navigate("/home");
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

        <div className="mt-8 grid grid-cols-2 rounded-xl bg-gray-100 p-1 max-w-sm">
          <button
            onClick={() => setTab("connexion")}
            className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              tab === "connexion" ? "bg-white text-brand-navy shadow-sm" : "text-gray-500"
            }`}
          >
            Se connecter
          </button>
          <button
            onClick={() => setTab("inscription")}
            className={`rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              tab === "inscription" ? "bg-white text-brand-navy shadow-sm" : "text-gray-500"
            }`}
          >
            Créer un compte
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 max-w-sm space-y-4">
          {tab === "inscription" && (
            <>
              <Field label="Prénom" placeholder="" />
              <Field label="Nom" placeholder="" />
            </>
          )}
          <Field
            label="Email"
            type="email"
            placeholder=""
            defaultValue={tab === "connexion" ? "etudiant@studhome.cm" : undefined}
          />
          <Field
            label="Mot de passe"
            type="password"
            placeholder=""
            defaultValue={tab === "connexion" ? "test1234" : undefined}
          />
          {tab === "inscription" && <Field label="Ressaisir le mot de passe" type="password" placeholder="" />}

          {tab === "connexion" && (
            <div className="text-right">
              <button type="button" className="text-sm font-medium text-brand-blue">
                Mot de passe oublié ?
              </button>
            </div>
          )}

          <button
            type="submit"
            className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
          >
            {tab === "connexion" ? "Se connecter" : "Créer un compte"}
          </button>

          <p className="text-center text-sm text-gray-500">
            {tab === "connexion" ? (
              <>
                Pas encore de compte ?{" "}
                <button type="button" onClick={() => setTab("inscription")} className="font-semibold text-brand-blue">
                  Créer un compte
                </button>
              </>
            ) : (
              <>
                Déjà un compte ?{" "}
                <button type="button" onClick={() => setTab("connexion")} className="font-semibold text-brand-blue">
                  Se connecter
                </button>
              </>
            )}
          </p>
        </form>
      </div>

      <div className="relative hidden lg:block overflow-hidden">
        <img src={loginBedroom} alt="Chambre étudiante" className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
        <div className="absolute top-8 left-8 right-8 text-white">
          <h2 className="font-display text-2xl font-bold">Trouver votre logement partout au Cameroun</h2>
          <div className="mt-1 h-1 w-14 rounded-full bg-white/70" />
          <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/95 px-4 py-2 text-brand-navy text-sm shadow">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
              🏠
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
  placeholder,
  defaultValue,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-brand-navy">{label}</span>
      <input
        type={type}
        placeholder={placeholder}
        defaultValue={defaultValue}
        required
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
      />
    </label>
  );
}
