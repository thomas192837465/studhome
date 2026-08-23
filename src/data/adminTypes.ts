export type PortalRole = "Admin" | "Super Admin";

export interface Signalement {
  id: string;
  logement: string;
  signalePar: string;
  raison: string;
  date: string;
  statut: "Nouveau" | "En cours" | "Résolu";
}

export interface AdminTransaction {
  id: string;
  date: string;
  utilisateur: string;
  pack: string;
  mode: string;
  montant: number;
  statut: "Réussi" | "Échoué";
}

export interface Administrator {
  id: string;
  name: string;
  role: string;
  status: "Actif" | "Suspendu";
  lastLogin: string;
}

export interface ActivityLog {
  id: string;
  time: string;
  admin: string;
  action: string;
  cible: string;
  details: string;
  ip: string;
}

export interface AdminSession {
  name: string;
  role: PortalRole;
}
