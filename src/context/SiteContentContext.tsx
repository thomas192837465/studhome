import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";

export interface SiteStat {
  key: string;
  value: string;
  label: string;
}

export interface HeroPhoto {
  id: string;
  url: string;
  position: number;
}

export interface CityGridSlot {
  id: string;
  city: string;
  photoUrl: string;
  position: number;
}

interface SiteContentContextValue {
  cityGrid: CityGridSlot[];
  featuredListingIds: string[];
  siteStats: SiteStat[];
  heroPhotos: HeroPhoto[];
  universities: string[];
  cities: string[];
  pendingUniversities: string[];
  pendingCities: string[];
  loading: boolean;
  setCityGridCity: (position: number, city: string) => Promise<void>;
  setCityGridPhoto: (position: number, photoUrl: string) => Promise<void>;
  removeCityGridSlot: (position: number) => Promise<void>;
  isFeatured: (listingId: string) => boolean;
  toggleFeatured: (listingId: string) => Promise<void>;
  moveFeatured: (listingId: string, direction: "up" | "down") => Promise<void>;
  updateStat: (key: string, value: string, label: string) => Promise<void>;
  addHeroPhoto: (photoUrl: string) => Promise<void>;
  removeHeroPhoto: (id: string) => Promise<void>;
  moveHeroPhoto: (id: string, direction: "up" | "down") => Promise<void>;
  addUniversity: (name: string) => Promise<void>;
  removeUniversity: (name: string) => Promise<void>;
  addCity: (name: string) => Promise<void>;
  removeCity: (name: string) => Promise<void>;
  proposeUniversity: (name: string) => Promise<void>;
  proposeCity: (name: string) => Promise<void>;
  approveUniversity: (name: string) => Promise<void>;
  rejectUniversity: (name: string) => Promise<void>;
  approveCity: (name: string) => Promise<void>;
  rejectCity: (name: string) => Promise<void>;
}

const SiteContentContext = createContext<SiteContentContextValue | null>(null);

export function SiteContentProvider({ children }: { children: ReactNode }) {
  const [cityGrid, setCityGrid] = useState<CityGridSlot[]>([]);
  const [featured, setFeatured] = useState<{ id: string; listingId: string; position: number }[]>([]);
  const [siteStats, setSiteStats] = useState<SiteStat[]>([]);
  const [heroPhotos, setHeroPhotos] = useState<HeroPhoto[]>([]);
  const [universities, setUniversities] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [pendingUniversities, setPendingUniversities] = useState<string[]>([]);
  const [pendingCities, setPendingCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    const [cityRes, featuredRes, statsRes, heroRes, universitiesRes, citiesRes] = await Promise.all([
      supabase.from("city_photos").select("*").order("position", { ascending: true }),
      supabase.from("featured_listings").select("*").order("position", { ascending: true }),
      supabase.from("site_stats").select("*"),
      supabase.from("hero_photos").select("*").order("position", { ascending: true }),
      supabase.from("universities").select("name, status").order("name", { ascending: true }),
      supabase.from("cities").select("name, status").order("name", { ascending: true }),
    ]);
    setCityGrid(
      (cityRes.data ?? []).map((r) => ({ id: r.id, city: r.city, photoUrl: r.photo_url ?? "", position: r.position })),
    );
    setFeatured((featuredRes.data ?? []).map((r) => ({ id: r.id, listingId: r.listing_id, position: r.position })));
    setSiteStats((statsRes.data ?? []) as SiteStat[]);
    setHeroPhotos((heroRes.data ?? []).map((r) => ({ id: r.id, url: r.photo_url, position: r.position })));
    const uniRows = (universitiesRes.data ?? []) as { name: string; status: string }[];
    const cityRows = (citiesRes.data ?? []) as { name: string; status: string }[];
    setUniversities(uniRows.filter((r) => r.status !== "pending").map((r) => r.name));
    setCities(cityRows.filter((r) => r.status !== "pending").map((r) => r.name));
    setPendingUniversities(uniRows.filter((r) => r.status === "pending").map((r) => r.name));
    setPendingCities(cityRows.filter((r) => r.status === "pending").map((r) => r.name));
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();

    const channel = supabase
      .channel("site-content-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "city_photos" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "featured_listings" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "site_stats" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "hero_photos" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "universities" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "cities" }, fetchAll)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setCityGridCity = async (position: number, city: string) => {
    const existing = cityGrid.find((s) => s.position === position);
    const { error } = existing
      ? await supabase.from("city_photos").update({ city }).eq("id", existing.id)
      : await supabase.from("city_photos").insert({ city, photo_url: "", position });
    if (error) throw error;
    await fetchAll();
  };

  const setCityGridPhoto = async (position: number, photoUrl: string) => {
    const existing = cityGrid.find((s) => s.position === position);
    if (!existing) return;
    const { error } = await supabase.from("city_photos").update({ photo_url: photoUrl }).eq("id", existing.id);
    if (error) throw error;
    await fetchAll();
  };

  const removeCityGridSlot = async (position: number) => {
    const existing = cityGrid.find((s) => s.position === position);
    if (!existing) return;
    await supabase.from("city_photos").delete().eq("id", existing.id);
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

  const addHeroPhoto = async (photoUrl: string) => {
    const nextPosition = heroPhotos.length > 0 ? Math.max(...heroPhotos.map((h) => h.position)) + 1 : 0;
    const { error } = await supabase.from("hero_photos").insert({ photo_url: photoUrl, position: nextPosition });
    if (error) throw error;
    await fetchAll();
  };

  const removeHeroPhoto = async (id: string) => {
    await supabase.from("hero_photos").delete().eq("id", id);
    await fetchAll();
  };

  const moveHeroPhoto = async (id: string, direction: "up" | "down") => {
    const sorted = [...heroPhotos].sort((a, b) => a.position - b.position);
    const index = sorted.findIndex((h) => h.id === id);
    const swapWith = direction === "up" ? index - 1 : index + 1;
    if (index === -1 || swapWith < 0 || swapWith >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[swapWith];
    await Promise.all([
      supabase.from("hero_photos").update({ position: b.position }).eq("id", a.id),
      supabase.from("hero_photos").update({ position: a.position }).eq("id", b.id),
    ]);
    await fetchAll();
  };

  const addUniversity = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const { error } = await supabase.from("universities").insert({ name: trimmed });
    if (error && !error.message.includes("duplicate")) throw error;
    await fetchAll();
  };

  const removeUniversity = async (name: string) => {
    await supabase.from("universities").delete().eq("name", name);
    await fetchAll();
  };

  const addCity = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const { error } = await supabase.from("cities").insert({ name: trimmed });
    if (error && !error.message.includes("duplicate")) throw error;
    await fetchAll();
  };

  const removeCity = async (name: string) => {
    await supabase.from("cities").delete().eq("name", name);
    await fetchAll();
  };

  // Called by owners typing a city/university that isn't in the approved
  // list yet — inserted as "pending" via an RPC (rather than a direct
  // insert) since regular users don't have insert rights on these tables,
  // only the security-definer function does.
  const proposeUniversity = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await supabase.rpc("propose_university", { p_name: trimmed });
    await fetchAll();
  };

  const proposeCity = async (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    await supabase.rpc("propose_city", { p_name: trimmed });
    await fetchAll();
  };

  const approveUniversity = async (name: string) => {
    await supabase.from("universities").update({ status: "approved" }).eq("name", name);
    await fetchAll();
  };

  const rejectUniversity = async (name: string) => {
    await supabase.from("universities").delete().eq("name", name);
    await fetchAll();
  };

  const approveCity = async (name: string) => {
    await supabase.from("cities").update({ status: "approved" }).eq("name", name);
    await fetchAll();
  };

  const rejectCity = async (name: string) => {
    await supabase.from("cities").delete().eq("name", name);
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
      cityGrid: [...cityGrid].sort((a, b) => a.position - b.position),
      featuredListingIds: [...featured].sort((a, b) => a.position - b.position).map((f) => f.listingId),
      siteStats,
      heroPhotos: [...heroPhotos].sort((a, b) => a.position - b.position),
      universities,
      cities,
      pendingUniversities,
      pendingCities,
      loading,
      setCityGridCity,
      setCityGridPhoto,
      removeCityGridSlot,
      isFeatured,
      toggleFeatured,
      moveFeatured,
      updateStat,
      addHeroPhoto,
      removeHeroPhoto,
      moveHeroPhoto,
      addUniversity,
      removeUniversity,
      addCity,
      removeCity,
      proposeUniversity,
      proposeCity,
      approveUniversity,
      rejectUniversity,
      approveCity,
      rejectCity,
    }),
    [cityGrid, featured, siteStats, heroPhotos, universities, cities, pendingUniversities, pendingCities, loading],
  );

  return <SiteContentContext.Provider value={value}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be used within SiteContentProvider");
  return ctx;
}
