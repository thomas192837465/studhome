import type { ListingStatus } from "./listingTypes";

export function listingStatusClass(status: ListingStatus) {
  switch (status) {
    case "Publiée":
      return "bg-brand-green-light text-green-700";
    case "En attente":
      return "bg-orange-50 text-orange-600";
    case "Modifications demandées":
      return "bg-amber-50 text-amber-700";
    case "Refusée":
      return "bg-red-50 text-red-600";
  }
}
