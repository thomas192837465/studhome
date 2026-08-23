import type { Signalement, AdminTransaction, ActivityLog } from "./adminTypes";

// No real data sources exist yet for these (no student "report a listing" feature,
// no real payment processing, no persisted audit log) — kept empty rather than
// showing fabricated examples. Each page renders an honest empty state instead.
export const seedSignalements: Signalement[] = [];
export const seedTransactions: AdminTransaction[] = [];
export const seedLogs: ActivityLog[] = [];
export const activitesRecentes: { text: string; date: string }[] = [];
