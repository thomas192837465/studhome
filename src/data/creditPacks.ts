import type { CreditPack } from "./types";

export const creditPacks: CreditPack[] = [
  {
    id: "decouverte",
    name: "Pack Découverte",
    credits: 10,
    price: 5000,
    validityDays: 30,
    contacts: 10,
    popular: false,
    tagline: "Idéal pour commencer",
  },
  {
    id: "etudiant",
    name: "Pack Etudiant",
    credits: 25,
    price: 10000,
    validityDays: 60,
    contacts: 25,
    popular: true,
    tagline: "Le plus choisi par nos étudiants",
  },
  {
    id: "avance",
    name: "Pack Avancé",
    credits: 50,
    price: 18000,
    validityDays: 90,
    contacts: 50,
    popular: false,
    tagline: "Plus de contacts",
  },
  {
    id: "premium",
    name: "Pack Premium",
    credits: 100,
    price: 30000,
    validityDays: 120,
    contacts: 100,
    popular: false,
    tagline: "Pour une recherche sereine",
  },
];

export const paymentMethods = [
  { id: "mtn", label: "MTN Mobile Money", icon: "mtn" },
  { id: "orange", label: "Orange Money", icon: "orange" },
  { id: "visa", label: "Carte bancaire", icon: "visa" },
] as const;
