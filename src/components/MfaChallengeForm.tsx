import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { sendVerificationCode, checkVerificationCode, type TwoFactorMethod } from "../lib/twoFactor";

// Shown right after a first-factor login (password) when the account has
// SMS or email 2FA enrolled. The caller (Login.tsx / OwnerLogin.tsx /
// AdminLogin.tsx) knows the method + identifier from the profile it already
// fetched, and is responsible for marking the session as fully
// authenticated once onVerified() fires.
export function MfaChallengeForm({
  method,
  identifier,
  onVerified,
}: {
  method: TwoFactorMethod;
  identifier: string;
  onVerified: () => void;
}) {
  const [code, setCode] = useState("");
  const [preparing, setPreparing] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const startChallenge = async () => {
    setError("");
    setPreparing(true);
    setSent(false);
    try {
      await sendVerificationCode(method, identifier);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le code.");
    } finally {
      setPreparing(false);
    }
  };

  useEffect(() => {
    startChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method, identifier]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
    try {
      const ok = await checkVerificationCode(method, identifier, code.trim());
      if (!ok) {
        setError("Code incorrect ou expiré.");
        return;
      }
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de vérifier le code.");
    } finally {
      setVerifying(false);
    }
  };

  const channelLabel = method === "email" ? "par email" : "par SMS";

  return (
    <div className="mx-auto max-w-sm text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
        <ShieldCheck size={24} />
      </div>
      <h2 className="font-display text-lg font-bold text-brand-navy">Double authentification</h2>
      <p className="mt-2 text-sm text-gray-500">
        {preparing
          ? "Envoi du code en cours..."
          : sent
            ? `Entrez le code envoyé ${channelLabel} au compte enregistré.`
            : "Impossible d'envoyer le code."}
      </p>

      <form onSubmit={handleVerify} className="mt-5 space-y-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          autoFocus
          disabled={preparing || !sent}
          placeholder="Code de vérification"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-brand-blue/30 disabled:bg-gray-50"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={verifying || preparing || !code || !sent}
          className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
        >
          {verifying ? "Vérification..." : "Vérifier"}
        </button>
        <button
          type="button"
          onClick={startChallenge}
          disabled={preparing}
          className="w-full text-center text-sm text-gray-400 disabled:opacity-60"
        >
          Renvoyer le code
        </button>
      </form>
    </div>
  );
}
