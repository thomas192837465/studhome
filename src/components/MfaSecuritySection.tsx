import { useEffect, useState } from "react";
import { ShieldCheck, ShieldOff } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { supabase } from "../lib/supabase";
import { MfaEnrollForm } from "./MfaEnrollForm";

type FactorState = "loading" | "none" | "enrolled";

// Self-contained "enable/disable SMS 2FA" block reused across the student,
// owner and admin profile/settings pages. Reads/writes profiles.phone_verified
// directly (our own Twilio-Verify-backed 2FA, not Supabase's paid MFA).
export function MfaSecuritySection() {
  const [state, setState] = useState<FactorState>("loading");
  const [userId, setUserId] = useState("");
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
    const { data, error: fetchError } = await supabase
      .from("profiles")
      .select("phone_verified")
      .eq("id", id)
      .maybeSingle();
    if (fetchError) {
      setError(fetchError.message);
      setState("none");
      return;
    }
    setState(data?.phone_verified ? "enrolled" : "none");
  };

  useEffect(() => {
    refresh();
  }, []);

  const handleDisable = async () => {
    setError("");
    setDisabling(true);
    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ phone_verified: false })
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
            <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" /> Activée pour ce compte
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Un code par SMS vous sera demandé à chaque nouvelle session sur un appareil.
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
        <MfaEnrollForm onEnrolled={refresh} />
      )}
    </div>
  );
}
