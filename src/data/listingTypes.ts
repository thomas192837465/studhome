export type ListingStatus = "En attente" | "Publiée" | "Modifications demandées" | "Refusée";

export interface DailyStat {
  date: string; // YYYY-MM-DD
  views: number;
  favorites: number;
  unlocks: number;
}

export interface Listing {
  id: string;
  title: string;
  type: string;
  city: string;
  quartier: string;
  address: string;
  latitude?: number;
  longitude?: number;
  universities: string[];
  price: number;
  period: "mois" | "an";
  description: string;
  equipements: string[];
  image: string;
  gallery: string[];
  videoUrl?: string;
  status: ListingStatus;
  submittedDate: string;
  createdAt: string;
  unlockCost: number;

  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  ownerAvatarImg?: string;
  ownerMemberSince: string;

  modificationMessage?: string;
  modificationReason?: string;

  views: number;
  favoritesCount: number;
  unlocksCount: number;
  lastStatsUpdate: string;
  dailyStats: DailyStat[];
}

export interface ListingDraft {
  type: string;
  ville: string;
  quartier: string;
  address: string;
  universities: string[];
  description: string;
  equipements: string[];
  photos: string[];
  video: string;
  loyer: string;
  charges: string[];
  caution: string;
  disponibleDate: string;
}

export const emptyDraft: ListingDraft = {
  type: "",
  ville: "",
  quartier: "",
  address: "",
  universities: [],
  description: "",
  equipements: [],
  photos: [],
  video: "",
  loyer: "",
  charges: [],
  caution: "1 mois",
  disponibleDate: "",
};

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
