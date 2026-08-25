import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, ShieldCheck } from "lucide-react";
import { supabase } from "../../lib/supabase";
import type { ProfileRow } from "../../lib/profileMapper";

export function AdminSetPassword() {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // The invite/recovery link redirects here with the session already
    // established by supabase-js (it parses the URL hash automatically).
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setChecking(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: userData, error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      const userId = userData.user?.id;
      let role: ProfileRow["role"] | null = null;
      if (userId) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", userId).maybeSingle();
        role = (profile?.role as ProfileRow["role"]) ?? null;
      }
      navigate(role === "superadmin" ? "/superadmin/tableau-de-bord" : "/admin/tableau-de-bord");
    } catch {
      setError("Impossible de définir le mot de passe. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-blue-light">
          <ShieldCheck size={30} className="text-brand-blue" />
        </div>
        <h1 className="text-center font-display text-xl font-bold text-brand-navy">Définir votre mot de passe</h1>

        {!hasSession ? (
          <p className="mt-4 text-center text-sm text-gray-500">
            Ce lien n'est plus valide ou a expiré. Demandez une nouvelle invitation ou réinitialisation.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{error}</p>}
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-navy">Nouveau mot de passe</span>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-brand-navy">Confirmer le mot de passe</span>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-gray-200 pl-9 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </div>
            </label>
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
            >
              {submitting ? "Enregistrement..." : "Valider et se connecter"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
