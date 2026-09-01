import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { rowToListing, type ListingRow } from "../lib/listingsMapper";
import { uploadListingPhotos } from "../lib/uploadPhoto";
import type { DailyStat, Listing, ListingDraft } from "../data/listingTypes";
import { todayISO } from "../data/listingTypes";

interface OwnerIdentity {
  id: string;
  name: string;
  phone: string;
  email?: string;
  avatarImg?: string;
  memberSince: string;
}

interface ListingsContextValue {
  listings: Listing[];
  loading: boolean;
  getListing: (id: string) => Listing | undefined;
  getListingsByOwner: (ownerId: string) => Listing[];
  getPublicListings: () => Listing[];
  submitListing: (draft: ListingDraft, owner: OwnerIdentity, unlockCost?: number) => Promise<string>;
  updateListing: (id: string, draft: ListingDraft, ownerId: string) => Promise<void>;
  publishListing: (id: string) => Promise<void>;
  updateListingLocation: (id: string, latitude: number, longitude: number) => Promise<void>;
  refuseListing: (id: string) => Promise<void>;
  requestModification: (id: string, message: string, reason: string) => Promise<void>;
  recordView: (id: string) => Promise<void>;
  adjustFavorite: (id: string, delta: 1 | -1) => Promise<void>;
  recordUnlock: (id: string) => Promise<void>;
}

const ListingsContext = createContext<ListingsContextValue | null>(null);

function bumpDailyStat(current: DailyStat[], field: "views" | "favorites" | "unlocks", delta: number): DailyStat[] {
  const today = todayISO();
  const log = [...current];
  const last = log[log.length - 1];
  if (last && last.date === today) {
    log[log.length - 1] = { ...last, [field]: Math.max(0, last[field] + delta) };
  } else {
    log.push({ date: today, views: 0, favorites: 0, unlocks: 0, [field]: Math.max(0, delta) } as DailyStat);
  }
  return log.slice(-30);
}

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    const { data, error } = await supabase.from("listings").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setListings((data as ListingRow[]).map(rowToListing));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchListings();

    const channel = supabase
      .channel("listings-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "listings" }, () => {
        fetchListings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getListing = (id: string) => listings.find((l) => l.id === id);
  const getListingsByOwner = (ownerId: string) => listings.filter((l) => l.ownerId === ownerId);
  const getPublicListings = () => listings.filter((l) => l.status === "Publiée");

  const submitListing = async (draft: ListingDraft, owner: OwnerIdentity, unlockCost = 10) => {
    const folder = owner.id.replace(/[^a-zA-Z0-9]/g, "") || "owner";
    const galleryUrls = draft.photos.length > 0 ? await uploadListingPhotos(draft.photos, folder) : [];

    const { data, error } = await supabase
      .from("listings")
      .insert({
        title: draft.title || `${draft.type || "Logement"} à ${draft.quartier || draft.ville}`,
        type: draft.type,
        city: draft.ville,
        quartier: draft.quartier,
        address: draft.address,
        latitude: draft.latitude ?? null,
        longitude: draft.longitude ?? null,
        universities: draft.universities,
        price: Number(draft.loyer) || 0,
        period: "an",
        description: draft.description,
        equipements: draft.equipements,
        image: galleryUrls[0] ?? "",
        gallery: galleryUrls,
        video_url: draft.video || null,
        status: "En attente",
        unlock_cost: unlockCost,
        owner_id: owner.id,
        owner_name: owner.name,
        owner_phone: owner.phone,
        owner_email: owner.email ?? null,
        owner_avatar_img: owner.avatarImg ?? null,
        owner_member_since: owner.memberSince,
      })
      .select()
      .single();

    if (error) throw error;
    await fetchListings();
    return (data as ListingRow).id;
  };

  const updateListing = async (id: string, draft: ListingDraft, ownerId: string) => {
    const folder = ownerId.replace(/[^a-zA-Z0-9]/g, "") || "owner";
    // photos already uploaded (http URLs) are kept as-is; only new base64 previews get uploaded
    const existingUrls = draft.photos.filter((p) => p.startsWith("http"));
    const newDataUrls = draft.photos.filter((p) => !p.startsWith("http"));
    const uploadedUrls = newDataUrls.length > 0 ? await uploadListingPhotos(newDataUrls, folder) : [];
    const galleryUrls = [...existingUrls, ...uploadedUrls];

    const { error } = await supabase
      .from("listings")
      .update({
        title: draft.title || `${draft.type || "Logement"} à ${draft.quartier || draft.ville}`,
        type: draft.type,
        city: draft.ville,
        quartier: draft.quartier,
        address: draft.address,
        latitude: draft.latitude ?? null,
        longitude: draft.longitude ?? null,
        universities: draft.universities,
        price: Number(draft.loyer) || 0,
        description: draft.description,
        equipements: draft.equipements,
        image: galleryUrls[0] ?? "",
        gallery: galleryUrls,
        video_url: draft.video || null,
        status: "En attente",
        modification_message: null,
        modification_reason: null,
      })
      .eq("id", id);

    if (error) throw error;
    await fetchListings();
  };

  const publishListing = async (id: string) => {
    await supabase.from("listings").update({ status: "Publiée" }).eq("id", id);
    await fetchListings();
  };

  const updateListingLocation = async (id: string, latitude: number, longitude: number) => {
    const { error } = await supabase.from("listings").update({ latitude, longitude }).eq("id", id);
    if (error) throw error;
    await fetchListings();
  };

  const refuseListing = async (id: string) => {
    await supabase.from("listings").update({ status: "Refusée" }).eq("id", id);
    await fetchListings();
  };

  const requestModification = async (id: string, message: string, reason: string) => {
    await supabase
      .from("listings")
      .update({ status: "Modifications demandées", modification_message: message, modification_reason: reason })
      .eq("id", id);
    await fetchListings();
  };

  const bumpCounter = async (id: string, field: "views" | "favorites_count" | "unlocks_count", delta: number, dailyField: "views" | "favorites" | "unlocks") => {
    const current = getListing(id);
    if (!current) return;
    const nextDailyStats = bumpDailyStat(current.dailyStats, dailyField, delta);
    await Promise.all([
      supabase.rpc("increment_listing_counter", { p_listing_id: id, p_field: field, p_delta: delta }),
      supabase.from("listings").update({ daily_stats: nextDailyStats }).eq("id", id),
    ]);
    await fetchListings();
  };

  const recordView = async (id: string) => {
    const sessionKey = `studhome-viewed-${id}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");
    await bumpCounter(id, "views", 1, "views");
  };

  const adjustFavorite = async (id: string, delta: 1 | -1) => {
    await bumpCounter(id, "favorites_count", delta, "favorites");
  };

  const recordUnlock = async (id: string) => {
    await bumpCounter(id, "unlocks_count", 1, "unlocks");
  };

  const value = useMemo<ListingsContextValue>(
    () => ({
      listings,
      loading,
      getListing,
      getListingsByOwner,
      getPublicListings,
      submitListing,
      updateListing,
      publishListing,
      updateListingLocation,
      refuseListing,
      requestModification,
      recordView,
      adjustFavorite,
      recordUnlock,
    }),
    [listings, loading],
  );

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within ListingsProvider");
  return ctx;
}
