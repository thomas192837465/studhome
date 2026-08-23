export interface Transaction {
  id: string;
  date: string;
  type: "Achat" | "Utilisation" | "Remboursement";
  description: string;
  credits: number;
  amount: number;
  status: "Terminé" | "En cours" | "Échoué";
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  validityDays: number;
  contacts: number;
  popular: boolean;
  tagline: string;
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  university: string;
  bio: string;
  avatar: string;
  role: "Etudiant" | "Etudiante";
  referralCode: string;
}
