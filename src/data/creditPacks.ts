import type { CreditPack } from "./types";

export const creditPacks: CreditPack[] = [
  {
    id: "decouverte",
    name: "Pack Découverte",
    credits: 20,
    price: 1900,
    validityDays: 30,
    contacts: 2,
    popular: false,
    tagline: "Idéal pour commencer",
    includesWelcomeBonus: false,
  },
  {
    id: "etudiant",
    name: "Pack Étudiant",
    credits: 45,
    price: 4000,
    validityDays: 60,
    contacts: 5,
    popular: true,
    tagline: "Le plus choisi par nos étudiants",
    includesWelcomeBonus: true,
  },
  {
    id: "recherche-plus",
    name: "Pack Recherche+",
    credits: 95,
    price: 7500,
    validityDays: 90,
    contacts: 10,
    popular: false,
    tagline: "Pour une recherche approfondie",
    includesWelcomeBonus: true,
  },
];

export const paymentMethods = [
  { id: "mtn", label: "MTN Mobile Money", icon: "mtn" },
  { id: "orange", label: "Orange Money", icon: "orange" },
  { id: "visa", label: "Carte bancaire", icon: "visa" },
] as const;
