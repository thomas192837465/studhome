import type { Transaction, User } from "./types";

export const defaultUser: User = {
  firstName: "Awa",
  lastName: "Ngo Bell",
  email: "awa.ngobell@gmail.com",
  phone: "+237 699 12 34 56",
  city: "Yaoundé",
  university: "Université de Yaoundé I",
  bio: "Etudiant en droit passionné par le droit.",
  avatar: "",
  role: "Etudiante",
  referralCode: "AWA123",
};

export const defaultCredits = 250;

export const seedTransactions: Transaction[] = [
  {
    id: "tx-2",
    date: "12 Mai 2026, 16:05",
    type: "Achat",
    description: "Pack Etudiant - 25 crédits",
    credits: 25,
    amount: 10000,
    status: "Terminé",
  },
  {
    id: "tx-1",
    date: "10 Mai 2026, 19:45",
    type: "Utilisation",
    description: "Contact propriétaire - CITY",
    credits: -1,
    amount: 0,
    status: "Terminé",
  },
];
