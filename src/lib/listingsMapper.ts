import type { Listing } from "../data/listingTypes";

// snake_case row shape as stored in Supabase's `listings` table
export interface ListingRow {
  id: string;
  title: string;
  type: string;
  city: string;
  quartier: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  universities: string[];
  price: number;
  period: string;
  description: string;
  equipements: string[];
  image: string;
  gallery: string[];
  video_url: string | null;
  status: string;
  submitted_date: string;
  created_at: string;
  unlock_cost: number;
  owner_id: string;
  owner_name: string;
  owner_phone: string;
  owner_avatar_img: string | null;
  owner_member_since: string;
  modification_message: string | null;
  modification_reason: string | null;
  views: number;
  favorites_count: number;
  unlocks_count: number;
  last_stats_update: string;
  daily_stats: Listing["dailyStats"];
}

export function rowToListing(row: ListingRow): Listing {
  return {
    id: row.id,
    title: row.title,
    type: row.type,
    city: row.city,
    quartier: row.quartier,
    address: row.address ?? "",
    latitude: row.latitude ?? undefined,
    longitude: row.longitude ?? undefined,
    universities: row.universities ?? [],
    price: row.price,
    period: row.period as Listing["period"],
    description: row.description,
    equipements: row.equipements ?? [],
    image: row.image,
    gallery: row.gallery ?? [],
    videoUrl: row.video_url ?? undefined,
    status: row.status as Listing["status"],
    submittedDate: row.submitted_date,
    createdAt: row.created_at,
    unlockCost: row.unlock_cost,
    ownerId: row.owner_id,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    ownerAvatarImg: row.owner_avatar_img ?? undefined,
    ownerMemberSince: row.owner_member_since,
    modificationMessage: row.modification_message ?? undefined,
    modificationReason: row.modification_reason ?? undefined,
    views: row.views,
    favoritesCount: row.favorites_count,
    unlocksCount: row.unlocks_count,
    lastStatsUpdate: row.last_stats_update,
    dailyStats: row.daily_stats ?? [],
  };
}
