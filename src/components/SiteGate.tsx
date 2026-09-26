import { useEffect, useState, type ReactNode } from "react";
import { Lock } from "lucide-react";
import { Logo } from "./Logo";
import { isUnlockedLocally, markUnlockedLocally, isSiteGateEnabled, checkSitePassword } from "../lib/siteGate";

export function SiteGate({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<"checking" | "open" | "locked">("checking");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      if (isUnlockedLocally()) {
        if (active) setStatus("open");
        return;
      }
      const enabled = await isSiteGateEnabled();
      if (!active) return;
      setStatus(enabled ? "locked" : "open");
    })();
    return () => {
      active = false;
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
    try {
      const ok = await checkSitePassword(password);
      if (ok) {
        markUnlockedLocally();
        setStatus("open");
      } else {
        setError("Mot de passe incorrect.");
      }
    } finally {
      setVerifying(false);
    }
  };

  if (status === "checking") return null;
  if (status === "open") return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
        <div className="mb-4 flex justify-center">
          <Logo />
        </div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
          <Lock size={22} />
        </div>
        <h1 className="font-display text-lg font-bold text-brand-navy">Accès réservé</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Ce site est en phase de test. Entrez le mot de passe fourni pour continuer.
        </p>
        <form onSubmit={handleSubmit} className="mt-6 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Mot de passe"
            autoFocus
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            disabled={verifying || !password}
            className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
          >
            {verifying ? "Vérification..." : "Continuer"}
          </button>
        </form>
      </div>
    </div>
  );
}
