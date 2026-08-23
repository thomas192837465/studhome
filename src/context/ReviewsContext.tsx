import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase } from "../lib/supabase";
import { rowToReview, type ReviewRow } from "../lib/reviewsMapper";
import type { Review } from "../data/reviewTypes";

interface ReviewsContextValue {
  reviews: Review[];
  loading: boolean;
  getPublishedForListing: (listingId: string) => Review[];
  getAllForListing: (listingId: string) => Review[];
  submitReview: (listingId: string, authorName: string, rating: number, comment: string) => Promise<void>;
  publishReview: (id: string) => Promise<void>;
  rejectReview: (id: string, reason: string) => Promise<void>;
  deleteReview: (id: string) => Promise<void>;
}

const ReviewsContext = createContext<ReviewsContextValue | null>(null);

export function ReviewsProvider({ children }: { children: ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
    if (!error && data) {
      setReviews((data as ReviewRow[]).map(rowToReview));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();

    const channel = supabase
      .channel("reviews-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => {
        fetchReviews();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getPublishedForListing = (listingId: string) =>
    reviews.filter((r) => r.listingId === listingId && r.status === "Publié");

  const getAllForListing = (listingId: string) => reviews.filter((r) => r.listingId === listingId);

  const submitReview = async (listingId: string, authorName: string, rating: number, comment: string) => {
    const { error } = await supabase.from("reviews").insert({
      listing_id: listingId,
      author_name: authorName,
      rating,
      comment,
      status: "En attente",
    });
    if (error) throw error;
    await fetchReviews();
  };

  const publishReview = async (id: string) => {
    await supabase.from("reviews").update({ status: "Publié", moderation_reason: null }).eq("id", id);
    await fetchReviews();
  };

  const rejectReview = async (id: string, reason: string) => {
    await supabase.from("reviews").update({ status: "Rejeté", moderation_reason: reason }).eq("id", id);
    await fetchReviews();
  };

  const deleteReview = async (id: string) => {
    await supabase.from("reviews").delete().eq("id", id);
    await fetchReviews();
  };

  const value = useMemo<ReviewsContextValue>(
    () => ({
      reviews,
      loading,
      getPublishedForListing,
      getAllForListing,
      submitReview,
      publishReview,
      rejectReview,
      deleteReview,
    }),
    [reviews, loading],
  );

  return <ReviewsContext.Provider value={value}>{children}</ReviewsContext.Provider>;
}

export function useReviews() {
  const ctx = useContext(ReviewsContext);
  if (!ctx) throw new Error("useReviews must be used within ReviewsProvider");
  return ctx;
}
