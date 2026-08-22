export interface Owner {
  name: string;
  phone: string;
  avatar: string;
  avatarImg?: string;
  idVerified: boolean;
  phoneVerified: boolean;
  memberSince: string;
  listingsCount: number;
  responseTime: string;
}

export interface ProximityItem {
  name: string;
  distance: string;
}

export interface Listing {
  id: string;
  title: string;
  city: string;
  university: string;
  distanceMin: number;
  price: number;
  period: "an" | "mois";
  type: "Chambre en colocation" | "Studio" | "Appartement" | "Chambre privée" | "Résidence étudiante";
  cardTag: "Résidence" | "Studio" | "Chambre" | "Appartement";
  furnished: boolean;
  verified: boolean;
  image: string;
  gallery: string[];
  features: string[];
  description: string;
  proximity: ProximityItem[];
  owner: Owner;
  unlockCost: number;
}

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
