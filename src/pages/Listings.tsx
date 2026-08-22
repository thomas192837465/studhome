import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { listings } from "../data/listings";
import { ListingCard } from "../components/ListingCard";

const typeOptions = [
  "Chambre en colocation",
  "Studio",
  "Appartement",
  "Chambre privée",
  "Résidence étudiante",
] as const;

type SortKey = "recent" | "asc" | "desc";

export function Listings() {
  const [params, setParams] = useSearchParams();
  const [ville, setVille] = useState(params.get("ville") ?? "");
  const [universite, setUniversite] = useState(params.get("universite") ?? "");
  const [budgetMax, setBudgetMax] = useState(200000);
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["Chambre en colocation"]);
  const [furnishedOnly, setFurnishedOnly] = useState(true);
  const [showMoreTypes, setShowMoreTypes] = useState(false);
  const [sort, setSort] = useState<SortKey>("recent");
  const [page, setPage] = useState(1);

  const toggleType = (t: string) => {
    setSelectedTypes((s) => (s.includes(t) ? s.filter((x) => x !== t) : [...s, t]));
  };

  const filtered = useMemo(() => {
    let result = listings.filter((l) => {
      if (ville && !l.city.toLowerCase().includes(ville.toLowerCase())) return false;
      if (universite && !l.university.toLowerCase().includes(universite.toLowerCase())) return false;
      if (l.price > budgetMax) return false;
      if (selectedTypes.length && !selectedTypes.includes(l.type)) return false;
      if (furnishedOnly && !l.furnished) return false;
      return true;
    });
    if (sort === "asc") result = [...result].sort((a, b) => a.price - b.price);
    if (sort === "desc") result = [...result].sort((a, b) => b.price - a.price);
    return result;
  }, [ville, universite, budgetMax, selectedTypes, furnishedOnly, sort]);

  const perPage = 6;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const paged = filtered.slice((page - 1) * perPage, page * perPage);

  const handleSearch = () => {
    const p = new URLSearchParams();
    if (ville) p.set("ville", ville);
    if (universite) p.set("universite", universite);
    setParams(p);
    setPage(1);
  };

  const reset = () => {
    setBudgetMax(200000);
    setSelectedTypes([]);
    setFurnishedOnly(false);
    setPage(1);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 py-8">
      {/* search bar */}
      <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4 grid sm:grid-cols-[1fr_1fr_auto] gap-3">
        <div className="rounded-xl bg-white border border-gray-200 px-4 py-2.5 flex items-center gap-2">
          <span className="text-gray-400">📍</span>
          <div className="flex-1">
            <p className="text-[11px] text-gray-400">Ville</p>
            <input
              value={ville}
              onChange={(e) => setVille(e.target.value)}
              placeholder="Toutes les villes"
              className="w-full text-sm font-medium text-brand-navy focus:outline-none"
            />
          </div>
        </div>
        <div className="rounded-xl bg-white border border-gray-200 px-4 py-2.5 flex items-center gap-2">
          <span className="text-gray-400">🎓</span>
          <div className="flex-1">
            <p className="text-[11px] text-gray-400">Université/Ecole</p>
            <input
              value={universite}
              onChange={(e) => setUniversite(e.target.value)}
              placeholder="Toutes les universités"
              className="w-full text-sm font-medium text-brand-navy focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-6 font-semibold text-white hover:bg-brand-orange-dark transition-colors"
        >
          <Search size={16} /> Recherche
        </button>
      </div>

      <div className="mt-8 grid lg:grid-cols-[260px_1fr] gap-10">
        {/* filters */}
        <aside>
          <h3 className="font-display font-bold text-lg text-brand-navy">Filters</h3>
          <hr className="my-4 border-gray-100" />

          <h4 className="font-semibold text-sm text-brand-navy mb-3">Budget (FCFA / mois)</h4>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              value={0}
              readOnly
              className="w-1/2 rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-500"
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="w-1/2 rounded-lg border border-gray-200 px-2 py-1.5 text-sm text-gray-500"
            />
          </div>
          <input
            type="range"
            min={0}
            max={200000}
            step={1000}
            value={budgetMax}
            onChange={(e) => setBudgetMax(Number(e.target.value))}
            className="w-full accent-brand-blue"
          />

          <h4 className="font-semibold text-sm text-brand-navy mt-6 mb-3">Type de logement</h4>
          <div className="space-y-2.5">
            {typeOptions.slice(0, showMoreTypes ? typeOptions.length : 3).map((t) => (
              <label key={t} className="flex items-center gap-2.5 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(t)}
                  onChange={() => toggleType(t)}
                  className="h-4 w-4 rounded accent-brand-blue"
                />
                {t}
              </label>
            ))}
          </div>
          <button
            onClick={() => setShowMoreTypes((s) => !s)}
            className="mt-2 flex items-center gap-1 text-sm font-medium text-brand-blue"
          >
            {showMoreTypes ? "Voir moins" : "Voir plus"} <ChevronDown size={14} />
          </button>

          <h4 className="font-semibold text-sm text-brand-navy mt-6 mb-3">Equipements</h4>
          <div className="space-y-2.5">
            <label className="flex items-center gap-2.5 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={furnishedOnly}
                onChange={(e) => setFurnishedOnly(e.target.checked)}
                className="h-4 w-4 rounded accent-brand-blue"
              />
              Meublé
            </label>
            <label className="flex items-center gap-2.5 text-sm text-gray-600">
              <input type="checkbox" className="h-4 w-4 rounded accent-brand-blue" />
              Non meublé
            </label>
          </div>

          <button onClick={reset} className="mt-6 text-sm font-semibold text-brand-blue">
            Réinitialiser
          </button>
        </aside>

        {/* results */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-gray-500">{filtered.length} logements trouvés</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-400">Trier par :</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="font-medium text-brand-navy focus:outline-none"
              >
                <option value="recent">Plus récents</option>
                <option value="asc">Prix croissant</option>
                <option value="desc">Prix décroissant</option>
              </select>
            </div>
          </div>

          {paged.length === 0 ? (
            <p className="text-gray-400 text-sm py-16 text-center">
              Aucun logement ne correspond à votre recherche.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {paged.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          )}

          {pageCount > 1 && (
            <div className="mt-10 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pageCount }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                    n === page ? "bg-brand-blue text-white" : "border border-gray-200 text-gray-600"
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
