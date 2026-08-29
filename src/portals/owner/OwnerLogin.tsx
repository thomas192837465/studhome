import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { KeyRound, Users, BarChart3, ShieldCheck } from "lucide-react";
import { OwnerPublicHeader } from "./OwnerPublicHeader";
import { Footer } from "../../components/Footer";
import { MfaChallengeForm } from "../../components/MfaChallengeForm";
import { useOwner } from "../../context/OwnerContext";
import { supabase } from "../../lib/supabase";

export function OwnerLogin() {
  const navigate = useNavigate();
  const { isOwnerAuthenticated, mfaPending, mfaPhone, login, completeMfaChallenge } = useOwner();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (isOwnerAuthenticated) navigate("/proprietaire/tableau-de-bord", { replace: true });
  }, [isOwnerAuthenticated, navigate]);

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
    <div className="min-h-screen flex flex-col bg-white">
      <OwnerPublicHeader />
      <main className="flex-1 mx-auto max-w-4xl w-full px-4 sm:px-6 py-14">
        <div className="grid sm:grid-cols-2 rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="bg-brand-blue-light p-10 flex flex-col items-center justify-center text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-brand-blue shadow-sm mb-6">
              <KeyRound size={32} />
            </div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Bon retour !</h2>
            <p className="mt-2 text-sm text-gray-500">Connectez-vous pour publier votre logement.</p>
          </div>

          {mfaPending ? (
            <div className="p-8 sm:p-10 flex items-center">
              <MfaChallengeForm phone={mfaPhone} onVerified={completeMfaChallenge} />
            </div>
          ) : (
            <form onSubmit={handleLogin} className="p-8 sm:p-10 space-y-5">
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
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-navy">Mot de passe</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </label>
              <button type="button" onClick={handleForgotPassword} className="text-sm font-medium text-brand-blue -mt-3">
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
                <Link to="/proprietaire/inscription" className="font-semibold text-brand-blue">
                  Créer un compte propriétaire
                </Link>
              </p>
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
