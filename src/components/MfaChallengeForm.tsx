import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";

// Shown right after a first-factor login (password) when the account has SMS
// 2FA enrolled. Verifying refreshes the Supabase session to AAL2 in the
// background — the app's own onAuthStateChange listener picks that up and
// finishes signing the user in, so this component only needs to call
// onVerified() as a UI hint (e.g. to stop rendering itself).
export function MfaChallengeForm({ onVerified }: { onVerified: () => void }) {
  const [factorId, setFactorId] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [code, setCode] = useState("");
  const [preparing, setPreparing] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const startChallenge = async () => {
    setError("");
    setPreparing(true);
    try {
      // listFactors() doesn't return the enrolled phone number itself (only
      // id/status/timestamps), so the code-sent message stays generic.
      const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
      if (listError) throw listError;
      const phoneFactor = factors.phone?.[0];
      if (!phoneFactor) throw new Error("Aucun numéro enregistré pour la double authentification.");
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: phoneFactor.id,
      });
      if (challengeError) throw challengeError;
      setFactorId(phoneFactor.id);
      setChallengeId(challenge.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le code.");
    } finally {
      setPreparing(false);
    }
  };

  useEffect(() => {
    startChallenge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
    try {
      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId,
        challengeId,
        code: code.trim(),
      });
      if (verifyError) throw verifyError;
      onVerified();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code incorrect ou expiré.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
        <ShieldCheck size={24} />
      </div>
      <h2 className="font-display text-lg font-bold text-brand-navy">Double authentification</h2>
      <p className="mt-2 text-sm text-gray-500">
        {preparing
          ? "Envoi du code en cours..."
          : challengeId
            ? "Entrez le code envoyé par SMS au numéro enregistré sur votre compte."
            : "Impossible d'envoyer le code."}
      </p>

      <form onSubmit={handleVerify} className="mt-5 space-y-3">
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
          inputMode="numeric"
          autoFocus
          disabled={preparing || !challengeId}
          placeholder="Code de vérification"
          className="w-full rounded-xl border border-gray-200 px-4 py-3 text-center text-lg font-semibold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-brand-blue/30 disabled:bg-gray-50"
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={verifying || preparing || !code || !challengeId}
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
