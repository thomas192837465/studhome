import type { Review } from "../data/reviewTypes";

export interface ReviewRow {
  id: string;
  listing_id: string;
  author_name: string;
  rating: number;
  comment: string;
  status: string;
  moderation_reason: string | null;
  created_at: string;
}

export function rowToReview(row: ReviewRow): Review {
  return {
    id: row.id,
    listingId: row.listing_id,
    authorName: row.author_name,
    rating: row.rating,
    comment: row.comment,
    status: row.status as Review["status"],
    moderationReason: row.moderation_reason ?? undefined,
    createdAt: row.created_at,
  };
}
