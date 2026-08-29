export async function sendVerificationCode(phone: string): Promise<void> {
  const res = await fetch("/api/twilio/send-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || "Impossible d'envoyer le code.");
}

export async function checkVerificationCode(phone: string, code: string): Promise<boolean> {
  const res = await fetch("/api/twilio/verify-code", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Impossible de vérifier le code.");
  return !!data.success;
}

// Per-browser-session memory of a completed 2FA challenge, keyed by user id.
// Supabase's native MFA persists this in the JWT itself (AAL2); rolling our
// own via Twilio Verify has no equivalent, so re-verifying on every page
// refresh would otherwise resend an SMS each time. Cleared when the tab/
// window closes, so a fresh browser session always re-challenges.
const sessionKey = (userId: string) => `studhome-2fa-ok-${userId}`;

export function markPhoneVerifiedForSession(userId: string) {
  try {
    sessionStorage.setItem(sessionKey(userId), "1");
  } catch {
    // sessionStorage can throw in private-browsing contexts — non-fatal, it
    // just means the challenge will be asked again if the page reloads.
  }
}

export function isPhoneVerifiedForSession(userId: string): boolean {
  try {
    return sessionStorage.getItem(sessionKey(userId)) === "1";
  } catch {
    return false;
  }
}
