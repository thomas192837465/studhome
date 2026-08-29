import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { supabase } from "../lib/supabase";
import { sendVerificationCode, checkVerificationCode, markPhoneVerifiedForSession } from "../lib/phoneVerification";

type Step = "phone" | "code";

// Lets an already-authenticated user turn on SMS-based 2FA from their
// profile settings (or complete the mandatory step right after signup).
// Verifies the number via Twilio Verify directly, then records it on the
// user's own profile row.
export function MfaEnrollForm({ onEnrolled, onCancel }: { onEnrolled: () => void; onCancel?: () => void }) {
  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSending(true);
    try {
      await sendVerificationCode(phone);
      setStep("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'envoyer le code. Vérifiez le numéro.");
    } finally {
      setSending(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setVerifying(true);
    try {
      const ok = await checkVerificationCode(phone, code.trim());
      if (!ok) {
        setError("Code incorrect ou expiré.");
        return;
      }
      const { data } = await supabase.auth.getUser();
      const userId = data.user?.id;
      if (!userId) throw new Error("Session expirée, reconnectez-vous.");
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ phone, phone_verified: true })
        .eq("id", userId);
      if (updateError) throw updateError;
      markPhoneVerifiedForSession(userId);
      onEnrolled();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Code incorrect ou expiré.");
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-navy mb-3">
        <ShieldCheck size={16} className="text-brand-blue" /> Activer la double authentification par SMS
      </p>

      {step === "phone" ? (
        <form onSubmit={handleSendCode} className="space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-sm text-gray-500">Numéro de téléphone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              placeholder="+237 6XX XXX XXX"
              required
              className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </label>
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={sending}
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
            >
              {sending ? "Envoi en cours..." : "Envoyer le code"}
            </button>
            {onCancel && (
              <button type="button" onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600">
                Annuler
              </button>
            )}
          </div>
        </form>
      ) : (
        <form onSubmit={handleVerify} className="space-y-3">
          <p className="text-sm text-gray-500">
            Entrez le code envoyé au <span className="font-semibold text-brand-navy">{phone}</span>
          </p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
            inputMode="numeric"
            autoFocus
            placeholder="Code de vérification"
            className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-center text-lg font-semibold tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={verifying || !code}
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
            >
              {verifying ? "Vérification..." : "Activer"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setError("");
              }}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              Changer de numéro
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
