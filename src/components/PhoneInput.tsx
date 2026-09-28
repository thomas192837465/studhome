import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

interface Country {
  iso2: string;
  name: string;
  dialCode: string;
  flag: string;
}

// Not exhaustive (~70 countries) but covers Africa, Europe and the other
// regions Cameroonian universities' international students most commonly
// come from. Cameroon is listed first and is always the default.
const COUNTRIES: Country[] = [
  { iso2: "CM", name: "Cameroun", dialCode: "237", flag: "🇨🇲" },
  { iso2: "NG", name: "Nigéria", dialCode: "234", flag: "🇳🇬" },
  { iso2: "TD", name: "Tchad", dialCode: "235", flag: "🇹🇩" },
  { iso2: "CF", name: "Centrafrique", dialCode: "236", flag: "🇨🇫" },
  { iso2: "GA", name: "Gabon", dialCode: "241", flag: "🇬🇦" },
  { iso2: "CG", name: "Congo", dialCode: "242", flag: "🇨🇬" },
  { iso2: "CD", name: "RD Congo", dialCode: "243", flag: "🇨🇩" },
  { iso2: "GQ", name: "Guinée équatoriale", dialCode: "240", flag: "🇬🇶" },
  { iso2: "BJ", name: "Bénin", dialCode: "229", flag: "🇧🇯" },
  { iso2: "TG", name: "Togo", dialCode: "228", flag: "🇹🇬" },
  { iso2: "CI", name: "Côte d'Ivoire", dialCode: "225", flag: "🇨🇮" },
  { iso2: "GH", name: "Ghana", dialCode: "233", flag: "🇬🇭" },
  { iso2: "SN", name: "Sénégal", dialCode: "221", flag: "🇸🇳" },
  { iso2: "ML", name: "Mali", dialCode: "223", flag: "🇲🇱" },
  { iso2: "BF", name: "Burkina Faso", dialCode: "226", flag: "🇧🇫" },
  { iso2: "NE", name: "Niger", dialCode: "227", flag: "🇳🇪" },
  { iso2: "GN", name: "Guinée", dialCode: "224", flag: "🇬🇳" },
  { iso2: "MR", name: "Mauritanie", dialCode: "222", flag: "🇲🇷" },
  { iso2: "RW", name: "Rwanda", dialCode: "250", flag: "🇷🇼" },
  { iso2: "BI", name: "Burundi", dialCode: "257", flag: "🇧🇮" },
  { iso2: "CV", name: "Cap-Vert", dialCode: "238", flag: "🇨🇻" },
  { iso2: "KE", name: "Kenya", dialCode: "254", flag: "🇰🇪" },
  { iso2: "UG", name: "Ouganda", dialCode: "256", flag: "🇺🇬" },
  { iso2: "TZ", name: "Tanzanie", dialCode: "255", flag: "🇹🇿" },
  { iso2: "ET", name: "Éthiopie", dialCode: "251", flag: "🇪🇹" },
  { iso2: "ZA", name: "Afrique du Sud", dialCode: "27", flag: "🇿🇦" },
  { iso2: "EG", name: "Égypte", dialCode: "20", flag: "🇪🇬" },
  { iso2: "MA", name: "Maroc", dialCode: "212", flag: "🇲🇦" },
  { iso2: "DZ", name: "Algérie", dialCode: "213", flag: "🇩🇿" },
  { iso2: "TN", name: "Tunisie", dialCode: "216", flag: "🇹🇳" },
  { iso2: "AO", name: "Angola", dialCode: "244", flag: "🇦🇴" },
  { iso2: "FR", name: "France", dialCode: "33", flag: "🇫🇷" },
  { iso2: "BE", name: "Belgique", dialCode: "32", flag: "🇧🇪" },
  { iso2: "CH", name: "Suisse", dialCode: "41", flag: "🇨🇭" },
  { iso2: "DE", name: "Allemagne", dialCode: "49", flag: "🇩🇪" },
  { iso2: "IT", name: "Italie", dialCode: "39", flag: "🇮🇹" },
  { iso2: "ES", name: "Espagne", dialCode: "34", flag: "🇪🇸" },
  { iso2: "PT", name: "Portugal", dialCode: "351", flag: "🇵🇹" },
  { iso2: "NL", name: "Pays-Bas", dialCode: "31", flag: "🇳🇱" },
  { iso2: "GB", name: "Royaume-Uni", dialCode: "44", flag: "🇬🇧" },
  { iso2: "IE", name: "Irlande", dialCode: "353", flag: "🇮🇪" },
  { iso2: "LU", name: "Luxembourg", dialCode: "352", flag: "🇱🇺" },
  { iso2: "SE", name: "Suède", dialCode: "46", flag: "🇸🇪" },
  { iso2: "NO", name: "Norvège", dialCode: "47", flag: "🇳🇴" },
  { iso2: "TR", name: "Turquie", dialCode: "90", flag: "🇹🇷" },
  { iso2: "US", name: "États-Unis", dialCode: "1", flag: "🇺🇸" },
  { iso2: "CA", name: "Canada", dialCode: "1", flag: "🇨🇦" },
  { iso2: "BR", name: "Brésil", dialCode: "55", flag: "🇧🇷" },
  { iso2: "CN", name: "Chine", dialCode: "86", flag: "🇨🇳" },
  { iso2: "IN", name: "Inde", dialCode: "91", flag: "🇮🇳" },
  { iso2: "SA", name: "Arabie saoudite", dialCode: "966", flag: "🇸🇦" },
  { iso2: "AE", name: "Émirats arabes unis", dialCode: "971", flag: "🇦🇪" },
  { iso2: "QA", name: "Qatar", dialCode: "974", flag: "🇶🇦" },
  { iso2: "LB", name: "Liban", dialCode: "961", flag: "🇱🇧" },
];

const DEFAULT_COUNTRY = COUNTRIES[0];

function splitValue(value: string): { country: Country; local: string } {
  const digits = value.replace(/\D/g, "");
  // Longest dial code first so "1" (US/CA) doesn't shadow "241" (Gabon), etc.
  const match = [...COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length).find((c) => digits.startsWith(c.dialCode));
  if (!match) return { country: DEFAULT_COUNTRY, local: digits };
  return { country: match, local: digits.slice(match.dialCode.length) };
}

export function PhoneInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const initial = value ? splitValue(value) : { country: DEFAULT_COUNTRY, local: "" };
  const [country, setCountry] = useState<Country>(initial.country);
  const [local, setLocal] = useState(initial.local);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const emit = (nextCountry: Country, nextLocal: string) => {
    onChange(nextLocal ? `+${nextCountry.dialCode}${nextLocal}` : "");
  };

  const searchDigits = search.replace(/\D/g, "");
  const filtered = search
    ? COUNTRIES.filter(
        (c) => c.name.toLowerCase().includes(search.toLowerCase()) || (searchDigits !== "" && c.dialCode.includes(searchDigits)),
      )
    : COUNTRIES;

  return (
    <div ref={ref} className="relative flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 focus-within:ring-2 focus-within:ring-brand-blue/30">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex shrink-0 items-center gap-1 text-sm text-gray-600"
      >
        <span className="text-base leading-none">{country.flag}</span>
        <span>+{country.dialCode}</span>
        <ChevronDown size={13} className="text-gray-400" />
      </button>
      <span className="h-5 w-px bg-gray-200 shrink-0" />
      <input
        value={local}
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, "");
          setLocal(digits);
          emit(country, digits);
        }}
        type="tel"
        placeholder={placeholder}
        className="w-full text-sm focus:outline-none"
      />

      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-64 rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="border-b border-gray-100 p-2">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
              placeholder="Rechercher un pays..."
              className="w-full rounded-lg border border-gray-200 px-2.5 py-1.5 text-sm focus:outline-none"
            />
          </div>
          <div className="max-h-56 overflow-y-auto py-1">
            {filtered.map((c) => (
              <button
                key={c.iso2}
                type="button"
                onClick={() => {
                  setCountry(c);
                  setOpen(false);
                  setSearch("");
                  emit(c, local);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                  c.iso2 === country.iso2 ? "bg-brand-blue-light text-brand-blue" : "text-gray-700"
                }`}
              >
                <span className="text-base leading-none">{c.flag}</span>
                <span className="flex-1 truncate">{c.name}</span>
                <span className="text-gray-400">+{c.dialCode}</span>
              </button>
            ))}
            {filtered.length === 0 && <p className="px-3 py-2 text-sm text-gray-400">Aucun pays trouvé.</p>}
          </div>
        </div>
      )}
    </div>
  );
}
