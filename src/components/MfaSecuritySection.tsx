import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../lib/supabase";
import { markTwoFactorVerifiedForSession, type TwoFactorMethod } from "../lib/twoFactor";
import { MfaEnrollForm } from "./MfaEnrollForm";

type FactorState = "loading" | "none" | "enrolled";

// Self-contained "enable/disable 2FA" block reused across the student,
// owner and admin profile/settings pages. Reads/writes
// profiles.two_factor_method directly (our own SMS/email 2FA, not
// Supabase's paid MFA).
export function MfaSecuritySection() {
  const [state, setState] = useState<FactorState>("loading");
  const [userId, setUserId] = useState("");
  const [email, setEmail] = useState("");
  const [method, setMethod] = useState<TwoFactorMethod | null>(null);
  const [disabling, setDisabling] = useState(false);
  const [error, setError] = useState("");

  const refresh = async () => {
    setState("loading");
    const { data: userData } = await supabase.auth.getUser();
    const id = userData.user?.id;
    if (!id) {
      setState("none");
      return;
    }
    setUserId(id);
    setEmail(userData.user?.email ?? "");
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("two_factor_method")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) {
      setError(fetchError.message);
      setState("none");
      return;
    }
    setMethod(data?.two_factor_method ?? null);
    setState(data?.two_factor_method ? "enrolled" : "none");
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleVerified = async (verifiedMethod: TwoFactorMethod, identifier: string) => {
    setError("");
    try {
      const patch: Record<string, string | null> = { two_factor_method: verifiedMethod };
      if (verifiedMethod === "sms") patch.phone = identifier;
      const { error: updateError } = await supabase.from("profiles").update(patch).eq("id", userId);
      if (updateError) throw updateError;
      markTwoFactorVerifiedForSession(userId);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'activer la double authentification.");
    }
  };

  const handleDisable = async () => {
    setError("");
    setDisabling(true);
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ two_factor_method: null })
        .eq("id", userId);
      if (updateError) throw updateError;
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible de désactiver la double authentification.");
    } finally {
      setDisabling(false);
    }
  };

  if (state === "loading") return null;

  return (
    <div>
      <h3 className="font-semibold text-brand-navy mb-3 flex items-center gap-1.5">
        <ShieldCheck size={16} className="text-brand-blue" /> Double authentification
      </h3>
      {state === "enrolled" ? (
        <div className="rounded-xl border border-gray-100 p-4">
          <p className="flex items-center gap-1.5 text-sm font-medium text-brand-green">
            <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" /> Activée par {method === "email" ? "email" : "SMS"}
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Un code vous sera demandé à chaque nouvelle session sur un appareil.
          </p>
          {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
          <button
            type="button"
            onClick={handleDisable}
            disabled={disabling}
            className="mt-3 flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
          >
            <ShieldOff size={13} /> {disabling ? "Désactivation..." : "Désactiver"}
          </button>
        </div>
      ) : (
        <MfaEnrollForm email={email} onVerified={handleVerified} />
      )}
    </div>
  );
}
