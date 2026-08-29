export type TwoFactorMethod = "sms" | "email";

const ENDPOINTS: Record<TwoFactorMethod, { send: string; verify: string; field: string }> = {
  sms: { send: "/api/twilio/send-code", verify: "/api/twilio/verify-code", field: "phone" },
  email: { send: "/api/email/send-code", verify: "/api/email/verify-code", field: "email" },
};

export async function sendVerificationCode(method: TwoFactorMethod, identifier: string): Promise<void> {
  const { send, field } = ENDPOINTS[method];
  const res = await fetch(send, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [field]: identifier }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Impossible d'envoyer le code.");
}

export async function checkVerificationCode(method: TwoFactorMethod, identifier: string, code: string): Promise<boolean> {
  const { verify, field } = ENDPOINTS[method];
  const res = await fetch(verify, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ [field]: identifier, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Impossible de vérifier le code.");
  return !!data.success;
}

// Per-browser-session memory of a completed 2FA challenge, keyed by user id.
// Supabase's native MFA persists this in the JWT itself (AAL2); rolling our
// own via plain SMS/email has no equivalent, so re-verifying on every page
// refresh would otherwise resend a code each time. Cleared when the tab/
// window closes, so a fresh browser session always re-challenges.
const sessionKey = (userId: string) => `studhome-2fa-ok-${userId}`;

export function markTwoFactorVerifiedForSession(userId: string) {
  try {
    sessionStorage.setItem(sessionKey(userId), "1");
  } catch {
    // sessionStorage can throw in private-browsing contexts — non-fatal, it
    // just means the challenge will be asked again if the page reloads.
  }
}

export function isTwoFactorVerifiedForSession(userId: string): boolean {
  try {
    return sessionStorage.getItem(sessionKey(userId)) === "1";
  } catch {
    return false;
  }
}
