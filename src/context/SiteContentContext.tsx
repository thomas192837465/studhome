import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

export interface SiteStat {
  key: string;
  value: string;
  label: string;
}

interface SiteContentContextValue {
  cityPhotos: Record<string, string>;
  featuredListingIds: string[];
  siteStats: SiteStat[];
  loading: boolean;
  setCityPhoto: (city: string, photoUrl: string) => Promise<void>;
  removeCityPhoto: (city: string) => Promise<void>;
  isFeatured: (listingId: string) => boolean;
  toggleFeatured: (listingId: string) => Promise<void>;
  moveFeatured: (listingId: string, direction: "up" | "down") => Promise<void>;
  updateStat: (key: string, value: string, label: string) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [cityPhotos, setCityPhotos] = useState<Record<string, string>>({});
  const [featured, setFeatured] = useState<{ id: string; listingId: string; position: number }[]>([]);
  const [siteStats, setSiteStats] = useState<SiteStat[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [cityRes, featuredRes, statsRes] = await Promise.all([
      supabase.from("city_photos").select("*"),
      supabase.from("featured_listings").select("*").order("position", { ascending: true }),
      supabase.from("site_stats").select("*"),
    ]);
    const cityMap: Record<string, string> = {};
    for (const row of cityRes.data ?? []) cityMap[row.city] = row.photo_url;
    setCityPhotos(cityMap);
    setFeatured((featuredRes.data ?? []).map((r) => ({ id: r.id, listingId: r.listing_id, position: r.position })));
    setSiteStats((statsRes.data ?? []) as SiteStat[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("site-content-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "city_photos" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "featured_listings" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_stats" }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCityPhoto = async (city: string, photoUrl: string) => {
    const { error } = await supabase
      .from("city_photos")
      .upsert({ city, photo_url: photoUrl, updated_at: new Date().toISOString() });
    if (error) throw error;
    await fetchAll();
  };

  const removeCityPhoto = async (city: string) => {
    await supabase.from("city_photos").delete().eq("city", city);
    await fetchAll();
  };

  const isFeatured = (listingId: string) => featured.some((f) => f.listingId === listingId);

  const toggleFeatured = async (listingId: string) => {
    const existing = featured.find((f) => f.listingId === listingId);
    if (existing) {
      await supabase.from("featured_listings").delete().eq("id", existing.id);
    } else {
      const nextPosition = featured.length > 0 ? Math.max(...featured.map((f) => f.position)) + 1 : 0;
      await supabase.from("featured_listings").insert({ listing_id: listingId, position: nextPosition });
    }
    await fetchAll();
  };

  const moveFeatured = async (listingId: string, direction: "up" | "down") => {
    const sorted = [...featured].sort((a, b) => a.position - b.position);
    const index = sorted.findIndex((f) => f.listingId === listingId);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[swapWith];
    await Promise.all([
      supabase.from("featured_listings").update({ position: b.position }).eq("id", a.id),
      supabase.from("featured_listings").update({ position: a.position }).eq("id", b.id),
    ]);
    await fetchAll();
  };

  const updateStat = async (key: string, value: string, label: string) => {
    const { error } = await supabase
      .from("site_stats")
      .upsert({ key, value, label, updated_at: new Date().toISOString() });
    if (error) throw error;
    await fetchAll();
  };

  const value = useMemo<SiteContentContextValue>(
    () => ({
      cityPhotos,
      featuredListingIds: [...featured].sort((a, b) => a.position - b.position).map((f) => f.listingId),
      siteStats,
      loading,
      setCityPhoto,
      removeCityPhoto,
      isFeatured,
      toggleFeatured,
      moveFeatured,
      updateStat,
    }),
    [cityPhotos, featured, siteStats, loading],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be used within SiteContentProvider");
  return ctx;
}
