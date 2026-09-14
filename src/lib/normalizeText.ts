// Trims, lowercases and strips accents so search/comparison treats
// "Douala " / "douala" / "Yaounde" / "Yaoundé" as equivalent.
export function normalizeText(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}
