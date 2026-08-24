import type { Transaction } from "../data/types";

export interface TransactionRow {
  id: string;
  type: string;
  description: string;
  credits: number;
  amount: number;
  status: string;
  created_at: string;
}

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: new Date(row.created_at).toLocaleString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    type: row.type as Transaction["type"],
    description: row.description,
    credits: row.credits,
    amount: row.amount,
    status: row.status as Transaction["status"],
  };
}
