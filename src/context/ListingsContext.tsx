import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { DailyStat, Listing, ListingDraft } from "../data/listingTypes";
import { todayISO } from "../data/listingTypes";

const STORAGE_KEY = "studhome-listings-v2";

function loadListings(): Listing[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Listing[];
  } catch {
    // ignore corrupted storage
  }
  return [];
}

function bumpDailyStat(listing: Listing, field: "views" | "favorites" | "unlocks", delta: number): DailyStat[] {
  const today = todayISO();
  const log = [...listing.dailyStats];
  const last = log[log.length - 1];
  if (last && last.date === today) {
    last[field] = Math.max(0, last[field] + delta);
  } else {
    log.push({ date: today, views: 0, favorites: 0, unlocks: 0, [field]: Math.max(0, delta) } as DailyStat);
  }
  // keep the last 30 recorded days only
  return log.slice(-30);
}

interface OwnerIdentity {
  id: string;
  name: string;
  phone: string;
  avatarImg?: string;
  memberSince: string;
}

interface ListingsContextValue {
  listings: Listing[];
  getListing: (id: string) => Listing | undefined;
  getListingsByOwner: (ownerId: string) => Listing[];
  getPublicListings: () => Listing[];
  submitListing: (draft: ListingDraft, owner: OwnerIdentity, unlockCost?: number) => string;
  publishListing: (id: string) => void;
  refuseListing: (id: string) => void;
  requestModification: (id: string, message: string, reason: string) => void;
  recordView: (id: string) => void;
  adjustFavorite: (id: string, delta: 1 | -1) => void;
  recordUnlock: (id: string) => void;
}

const ListingsContext = createContext<ListingsContextValue | null>(null);

export function ListingsProvider({ children }: { children: ReactNode }) {
  const [listings, setListings] = useState<Listing[]>(loadListings);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(listings));
  }, [listings]);

  const getListing = (id: string) => listings.find((l) => l.id === id);
  const getListingsByOwner = (ownerId: string) => listings.filter((l) => l.ownerId === ownerId);
  const getPublicListings = () => listings.filter((l) => l.status === "Publiée");

  const submitListing = (draft: ListingDraft, owner: OwnerIdentity, unlockCost = 10) => {
    const id = `lst-${Date.now()}`;
    const now = new Date().toISOString();
    const newListing: Listing = {
      id,
      title: `${draft.type || "Logement"} à ${draft.quartier || draft.ville}`,
      type: draft.type,
      city: draft.ville,
      quartier: draft.quartier,
      universities: draft.universities,
      price: Number(draft.loyer) || 0,
      period: "mois",
      description: draft.description,
      equipements: draft.equipements,
      image: draft.photos[0] ?? "",
      gallery: draft.photos,
      status: "En attente",
      submittedDate: now,
      createdAt: now,
      unlockCost,
      ownerId: owner.id,
      ownerName: owner.name,
      ownerPhone: owner.phone,
      ownerAvatarImg: owner.avatarImg,
      ownerMemberSince: owner.memberSince,
      views: 0,
      favoritesCount: 0,
      unlocksCount: 0,
      lastStatsUpdate: now,
      dailyStats: [],
    };
    setListings((prev) => [newListing, ...prev]);
    return id;
  };

  const publishListing = (id: string) =>
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Publiée" } : l)));

  const refuseListing = (id: string) =>
    setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: "Refusée" } : l)));

  const requestModification = (id: string, message: string, reason: string) =>
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? { ...l, status: "Modifications demandées", modificationMessage: message, modificationReason: reason }
          : l,
      ),
    );

  const recordView = (id: string) => {
    const sessionKey = `studhome-viewed-${id}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              views: l.views + 1,
              lastStatsUpdate: new Date().toISOString(),
              dailyStats: bumpDailyStat(l, "views", 1),
            }
          : l,
      ),
    );
  };

  const adjustFavorite = (id: string, delta: 1 | -1) =>
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              favoritesCount: Math.max(0, l.favoritesCount + delta),
              lastStatsUpdate: new Date().toISOString(),
              dailyStats: bumpDailyStat(l, "favorites", delta),
            }
          : l,
      ),
    );

  const recordUnlock = (id: string) =>
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              unlocksCount: l.unlocksCount + 1,
              lastStatsUpdate: new Date().toISOString(),
              dailyStats: bumpDailyStat(l, "unlocks", 1),
            }
          : l,
      ),
    );

  const value = useMemo<ListingsContextValue>(
    () => ({
      listings,
      getListing,
      getListingsByOwner,
      getPublicListings,
      submitListing,
      publishListing,
      refuseListing,
      requestModification,
      recordView,
      adjustFavorite,
      recordUnlock,
    }),
    [listings],
  );

  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings() {
  const ctx = useContext(ListingsContext);
  if (!ctx) throw new Error("useListings must be used within ListingsProvider");
  return ctx;
}
