import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAdminPortal } from "../../context/AdminPortalContext";
import { supabase } from "../../lib/supabase";
import { Logo } from "../../components/Logo";

export function AdminLogin() {
  const location = useLocation();
  const isSuper = location.pathname.startsWith("/superadmin");
  const navigate = useNavigate();
  const { loginWithPassword, logAction } = useAdminPortal();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(!!isSuper);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginWithPassword(email, password);
      await logAction("Connexion", email);
      navigate(isSuper ? "/superadmin/tableau-de-bord" : "/admin/tableau-de-bord");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connexion impossible. Réessayez.");
    } finally {
      setSubmitting(false);
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
        redirectTo: `${window.location.origin}/admin/definir-mot-de-passe`,
      });
      setResetSent(true);
    } catch {
      setError("Impossible d'envoyer l'email de réinitialisation.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-3xl grid sm:grid-cols-2 rounded-3xl overflow-hidden shadow-xl border border-gray-100">
        <div className="bg-brand-navy p-10 flex flex-col items-center justify-center text-center text-white">
          <div className="mb-1 scale-125">
            <Logo />
          </div>
          <span className="mt-3 mb-8 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-200">
            {isSuper ? "Super Admin" : "Admin"}
          </span>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-2xl bg-white/10">
            <ShieldCheck size={44} className="text-brand-blue" />
            <span className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-xl bg-brand-blue">
              <Lock size={18} className="text-white" />
            </span>
          </div>
          <h2 className="mt-8 font-display text-xl font-bold">Bienvenue</h2>
          <p className="mt-1 text-sm text-gray-400">
            Connectez-vous {isSuper ? "à votre compte pour accéder à votre espace." : "à votre espace administrateur."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 sm:p-10 flex flex-col justify-center space-y-4">
          <h3 className="font-display text-lg font-bold text-brand-navy">
            {isSuper ? "Espace Administration" : "Bienvenue"}
          </h3>
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>
          )}
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-navy">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@studhome.cm"
              required
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-navy">Mot de passe</span>
            <div className="relative">
              <input
                type={showPw ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-gray-500">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="h-4 w-4 rounded accent-brand-blue"
              />
              Se souvenir de moi
            </label>
            <button type="button" onClick={handleForgotPassword} className="font-medium text-brand-blue">
              Mot de passe oublié ?
            </button>
          </div>
          {resetSent && (
            <p className="rounded-lg bg-brand-green-light px-3 py-2 text-xs font-medium text-green-700">
              Email de réinitialisation envoyé, vérifiez votre boîte de réception.
            </p>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
          >
            {submitting ? "Connexion..." : "Se connecter"}
          </button>
          <p className="text-center text-xs text-gray-400">StudHome © 2024 · Tous droits réservés</p>
        </form>
      </div>
    </div>
  );
}
