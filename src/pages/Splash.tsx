import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { useApp } from "../context/AppContext";

export function Splash() {
  const navigate = useNavigate();
  const { isAuthenticated } = useApp();

  useEffect(() => {
    // Supabase's own invite/recovery emails (e.g. the dashboard's "Invite
    // user" button) always redirect to the project's configured Site URL —
    // there's no way to point them at /admin/definir-mot-de-passe directly.
    // Catch that case here at the root and forward the session hash along.
    const hash = window.location.hash;
    if (hash.includes("type=invite") || hash.includes("type=recovery") || hash.includes("error=")) {
      navigate(`/admin/definir-mot-de-passe${hash}`, { replace: true });
      return;
    }

    const t = setTimeout(() => {
      navigate(isAuthenticated ? "/home" : "/connexion", { replace: true });
    }, 900);
    return () => clearTimeout(t);
  }, [isAuthenticated, navigate]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white">
      <div className="scale-150">
        <Logo />
      </div>
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-gray-100">
        <div className="h-full w-1/2 animate-[loading_1s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-brand-orange to-brand-blue" />
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
}
