import type { Signalement, AdminTransaction, Administrator, ActivityLog } from "./adminTypes";

export const seedSignalements: Signalement[] = [
  { id: "45", logement: "Chambre à Bastos", signalePar: "Jessica M.", raison: "Logement déjà loué", date: "Aujourd'hui", statut: "Nouveau" },
  { id: "44", logement: "Studio Bonapriso", signalePar: "Kevin D.", raison: "Prix incorrect", date: "Hier", statut: "En cours" },
  { id: "43", logement: "Appartement Mvan", signalePar: "Marie N.", raison: "Photos trompeuses", date: "Hier", statut: "Nouveau" },
  { id: "42", logement: "Chambre Dschang", signalePar: "Junior F.", raison: "Propriétaire injoignable", date: "02/06/2024", statut: "Résolu" },
  { id: "41", logement: "Studio Molyko", signalePar: "Sarah K.", raison: "Déjà loué", date: "01/06/2024", statut: "Résolu" },
];

export const seedTransactions: AdminTransaction[] = [
  { id: "TXN-1052", date: "07/06/2024 10:30", utilisateur: "Jessica M.", pack: "50 crédits", mode: "Mobile Money (MTN)", montant: 5000, statut: "Réussi" },
  { id: "TXN-1051", date: "07/06/2024 09:15", utilisateur: "Kevin D.", pack: "100 crédits", mode: "Orange Money", montant: 9000, statut: "Réussi" },
  { id: "TXN-1050", date: "06/06/2024 22:45", utilisateur: "Marie N.", pack: "25 crédits", mode: "WebMoney", montant: 3000, statut: "Réussi" },
  { id: "TXN-1049", date: "06/06/2024 18:10", utilisateur: "Junior F.", pack: "50 crédits", mode: "Mobile Money (MTN)", montant: 5000, statut: "Réussi" },
  { id: "TXN-1048", date: "06/06/2024 15:30", utilisateur: "Sarah K.", pack: "100 crédits", mode: "Orange Money", montant: 9000, statut: "Réussi" },
];

export const seedAdministrators: Administrator[] = [
  { id: "a0", name: "Super Admin (moi)", role: "Super Admin", status: "Actif", lastLogin: "12/06/2024, 11:30" },
  { id: "a1", name: "Christian N.", role: "Admin Principal", status: "Actif", lastLogin: "12/06/2024, 10:15" },
  { id: "a2", name: "Vérificateur_01", role: "Agent de vérification", status: "Actif", lastLogin: "12/06/2024, 09:45" },
  { id: "a3", name: "Vérificateur_02", role: "Agent de vérification", status: "Actif", lastLogin: "12/06/2024, 09:10" },
  { id: "a4", name: "Support_01", role: "Support Client", status: "Actif", lastLogin: "12/06/2024, 08:30" },
  { id: "a5", name: "Compte_01", role: "Comptabilité", status: "Actif", lastLogin: "11/06/2024, 16:20" },
];

export const seedLogs: ActivityLog[] = [
  { id: "l1", time: "11:20", admin: "Super Admin", action: "Publication d'annonce", cible: "#1256", details: "Chambre meublée", ip: "154.30.11.24" },
  { id: "l2", time: "10:15", admin: "Vérificateur_02", action: "Demande de modification", cible: "#1254", details: "Appartement 2 pièces", ip: "154.30.11.24" },
  { id: "l3", time: "09:45", admin: "Support_01", action: "Réponse signalement", cible: "#45", details: "Chambre à louer", ip: "154.30.11.24" },
  { id: "l4", time: "09:30", admin: "Compte_01", action: "Ajustement de crédits", cible: "Linda T.", details: "+10 crédits", ip: "154.30.11.24" },
  { id: "l5", time: "08:50", admin: "Admin Principal", action: "Suspension propriétaire", cible: "Kevin D.", details: "7 jours", ip: "154.30.11.24" },
];

export const activitesRecentes = [
  { text: "Vérificateur_02 a publié l'annonce #1256", date: "Aujourd'hui, 10:30" },
  { text: "Support_01 a répondu à un signalement #45", date: "Aujourd'hui, 09:15" },
  { text: "Admin_03 a crédité 10 crédits à Linda T.", date: "Hier, 16:20" },
  { text: "Vérificateur_01 a demandé des modifications sur #1254", date: "Hier, 14:05" },
];

export const repartitionParVille = [
  { ville: "Yaoundé", pct: 52, color: "#26A9E1" },
  { ville: "Douala", pct: 24, color: "#16A34A" },
  { ville: "Buea", pct: 12, color: "#FAAE3F" },
  { ville: "Dschang", pct: 6, color: "#A78BFA" },
  { ville: "Autres", pct: 6, color: "#CBD5E1" },
];
