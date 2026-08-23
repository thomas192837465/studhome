// Server-side source of truth for pack pricing — mirrors src/data/creditPacks.ts.
// Kept separate (not imported from src/) so the pricing a payment is verified
// against can never be influenced by anything the browser sends.
export const PACKS = {
  decouverte: { credits: 10, price: 5000, name: "Pack Découverte" },
  etudiant: { credits: 25, price: 10000, name: "Pack Etudiant" },
  avance: { credits: 50, price: 18000, name: "Pack Avancé" },
  premium: { credits: 100, price: 30000, name: "Pack Premium" },
};
