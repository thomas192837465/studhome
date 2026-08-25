export async function notifyListingStatus(params: {
  to: string;
  ownerName: string;
  listingTitle: string;
  status: "publiee" | "refusee" | "modification";
  reason?: string;
  message?: string;
}): Promise<void> {
  if (!params.to) return;
  try {
    await fetch("/api/notify/listing-status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
  } catch {
    // best-effort — a failed notification email shouldn't block the admin action
  }
}
