import type { AdminListingStatus } from "../../data/adminTypes";

export function listingStatusClass(status: AdminListingStatus) {
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

export function signalementStatusClass(statut: "Nouveau" | "En cours" | "Résolu") {
  switch (statut) {
    case "Nouveau":
      return "bg-red-50 text-red-600";
    case "En cours":
      return "bg-brand-blue-light text-brand-blue";
    case "Résolu":
      return "bg-brand-green-light text-green-700";
  }
}

export function useBasePath(pathname: string) {
  return pathname.startsWith("/superadmin") ? "/superadmin" : "/admin";
}
