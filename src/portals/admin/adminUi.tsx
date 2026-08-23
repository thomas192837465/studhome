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
