export type ReviewStatus = "En attente" | "Publié" | "Rejeté";

export interface Review {
  id: string;
  listingId: string;
  authorName: string;
  rating: number;
  comment: string;
  status: ReviewStatus;
  moderationReason?: string;
  createdAt: string;
}
