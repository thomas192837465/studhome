export interface ProfileRow {
  id: string;
  role: "etudiant" | "proprietaire";
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string;
  city: string;
  university: string;
  bio: string;
  avatar: string;
  referral_code: string | null;
  credits: number;
  created_at: string;
}

export function makeReferralCode(firstName: string) {
  const base = (firstName || "STUD").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 4) || "STUD";
  return `${base}${Math.floor(100 + Math.random() * 900)}`;
}
