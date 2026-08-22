export type OwnerListingStatus = "En attente de vérification" | "Publiée" | "Informations à compléter";

export interface OwnerListing {
  id: string;
  title: string;
  city: string;
  quartier: string;
  price: number;
  status: OwnerListingStatus;
  submittedDate: string;
  image: string;
  universities: string[];
  description: string;
  equipements: string[];
  type: string;
  views: number;
  favorites: number;
  unlocks: number;
  performance: number[];
}

export interface OwnerDraft {
  type: string;
  ville: string;
  quartier: string;
  universities: string[];
  description: string;
  equipements: string[];
  photos: string[];
  loyer: string;
  charges: string[];
  caution: string;
  disponibleDate: string;
}

export interface OwnerUser {
  fullName: string;
  phone: string;
}

export const emptyDraft: OwnerDraft = {
  type: "",
  ville: "",
  quartier: "",
  universities: [],
  description: "",
  equipements: [],
  photos: [],
  loyer: "",
  charges: [],
  caution: "1 mois",
  disponibleDate: "",
};
