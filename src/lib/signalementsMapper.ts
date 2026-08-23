import type { Signalement } from "../data/signalementTypes";

export interface SignalementRow {
  id: string;
  listing_id: string;
  listing_title: string;
  reported_by: string;
  reason: string;
  details: string;
  status: string;
  created_at: string;
}

export function rowToSignalement(row: SignalementRow): Signalement {
  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: row.listing_title,
    reportedBy: row.reported_by,
    reason: row.reason,
    details: row.details,
    status: row.status as Signalement["status"],
    createdAt: row.created_at,
  };
}
