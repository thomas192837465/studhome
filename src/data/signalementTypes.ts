export type SignalementStatus = "Nouveau" | "En cours" | "Résolu";

export interface Signalement {
  id: string;
  listingId: string;
  listingTitle: string;
  reportedBy: string;
  reason: string;
  details: string;
  status: SignalementStatus;
  createdAt: string;
}
