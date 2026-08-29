import { useState } from "react";
import { ShieldCheck, Smartphone, Mail } from "lucide-react";
import { MfaChallengeForm } from "./MfaChallengeForm";
import type { TwoFactorMethod } from "../lib/twoFactor";

type Step = "choose" | "phone" | "code";

// Lets the user pick SMS or email as their 2FA channel, collects a phone
// number if needed, then hands off to MfaChallengeForm to send and verify a
// code. Purely proves possession of the channel — it's the caller's job to
// decide what "verified" means (write it to an existing profile from
// settings, or bake it into a brand-new signup).
export function MfaEnrollForm({
  email,
  initialPhone = "",
  onVerified,
  onCancel,
}: {
  email: string;
  initialPhone?: string;
  onVerified: (method: TwoFactorMethod, identifier: string) => void;
  onCancel?: () => void;
}) {
  const [step, setStep] = useState<Step>("choose");
  const [method, setMethod] = useState<TwoFactorMethod>("sms");
  const [phone, setPhone] = useState(initialPhone);

  const identifier = method === "email" ? email : phone;

  if (step === "code") {
    return <MfaChallengeForm method={method} identifier={identifier} onVerified={() => onVerified(method, identifier)} />;
  }

  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <p className="flex items-center gap-1.5 text-sm font-semibold text-brand-navy mb-3">
        <ShieldCheck size={16} className="text-brand-blue" /> Activer la double authentification
      </p>

      {step === "choose" && (
        <div className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                setMethod("sms");
                setStep("phone");
              }}
              className="flex flex-col items-start gap-2 rounded-xl border border-gray-200 p-4 text-left hover:border-brand-blue hover:bg-brand-blue-light transition-colors"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
                <Smartphone size={18} />
              </span>
              <span className="font-semibold text-brand-navy text-sm">Par SMS</span>
              <span className="text-xs text-gray-500">Un code envoyé au numéro de votre choix.</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMethod("email");
                setStep("code");
              }}
              className="flex flex-col items-start gap-2 rounded-xl border border-gray-200 p-4 text-left hover:border-brand-blue hover:bg-brand-blue-light transition-colors"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
                <Mail size={18} />
              </span>
              <span className="font-semibold text-brand-navy text-sm">Par Email</span>
              <span className="text-xs text-gray-500">Un code envoyé à {email}.</span>
            </button>
          </div>
          {onCancel && (
            <button type="button" onClick={onCancel} className="text-sm text-gray-400 hover:text-gray-600">
              Annuler
            </button>
          )}
        </div>
      )}

      {step === "phone" && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setStep("code");
          }}
          className="space-y-3"
        >
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
          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-lg bg-brand-blue px-4 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
            >
              Envoyer le code
            </button>
            <button type="button" onClick={() => setStep("choose")} className="text-sm text-gray-400 hover:text-gray-600">
              ← Changer de méthode
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
