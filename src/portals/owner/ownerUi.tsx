import type { OwnerListingStatus } from "../../data/ownerTypes";

export function statusBadgeClass(status: OwnerListingStatus) {
  switch (status) {
    case "Publiée":
      return "bg-brand-green-light text-green-700";
    case "En attente de vérification":
      return "bg-orange-50 text-orange-600";
    case "Informations à compléter":
      return "bg-red-50 text-red-600";
  }
}
