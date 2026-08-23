import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { useAdminPortal } from "../../context/AdminPortalContext";

export function AdminLogin() {
  const location = useLocation();
  const isSuper = location.pathname.startsWith("/superadmin");
  const navigate = useNavigate();
  const { login } = useAdminPortal();
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(!!isSuper);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const email = (form.elements.namedItem("email") as HTMLInputElement)?.value ?? "";
    const displayName = email.split("@")[0] || (isSuper ? "Super Admin" : "Admin");
    login(isSuper ? "Super Admin" : "Admin", displayName);
    navigate(isSuper ? "/superadmin/tableau-de-bord" : "/admin/tableau-de-bord");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-3xl grid sm:grid-cols-2 rounded-3xl overflow-hidden shadow-xl border border-gray-100">
        <div className="bg-brand-navy p-10 flex flex-col items-center justify-center text-center text-white">
          <span className="font-display font-bold text-2xl mb-1">
            <span className="text-brand-orange">Stud</span>
            <span className="text-brand-blue">Home</span>
          </span>
          <span className="mb-8 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-200">
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
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-brand-navy">Email</span>
            <input
              type="email"
              name="email"
              defaultValue={isSuper ? "superadmin@studhome.cm" : "admin@studhome.cm"}
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
                defaultValue="admin123456"
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
            <button type="button" className="font-medium text-brand-blue">
              Mot de passe oublié ?
            </button>
          </div>
          <button
            type="submit"
            className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
          >
            Se connecter
          </button>
          <p className="text-center text-xs text-gray-400">StudHome © 2024 · Tous droits réservés</p>
        </form>
      </div>
    </div>
  );
}
