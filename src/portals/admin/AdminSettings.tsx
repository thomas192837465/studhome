import { useRef, useState } from "react";
import { Camera, Trash2, ArrowUp, ArrowDown, Star, UploadCloud } from "lucide-react";
import { useSiteContent, type SiteStat } from "../../context/SiteContentContext";
import { useListings } from "../../context/ListingsContext";
import { resizeImageFile } from "../../lib/resizeImage";
import { uploadCityPhoto, uploadHeroPhoto } from "../../lib/uploadPhoto";
import { cameroonCities } from "../../data/cameroonLocations";
import { MfaSecuritySection } from "../../components/MfaSecuritySection";

const gridCities = cameroonCities.slice(0, 10);

export function AdminSettings() {
  const {
    cityPhotos,
    setCityPhoto,
    removeCityPhoto,
    featuredListingIds,
    isFeatured,
    toggleFeatured,
    moveFeatured,
    siteStats,
    updateStat,
    heroPhotos,
    addHeroPhoto,
    removeHeroPhoto,
    moveHeroPhoto,
  } = useSiteContent();
  const { listings } = useListings();
  const publishedListings = listings.filter((l) => l.status === "Publiée");
  const [uploadingCity, setUploadingCity] = useState<string | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const handleCityPhotoChange = async (city: string, file: File) => {
    setUploadingCity(city);
    try {
      const resized = await resizeImageFile(file, 1200, 0.85);
      const url = await uploadCityPhoto(resized, city);
      await setCityPhoto(city, url);
    } finally {
      setUploadingCity(null);
    }
  };

  const handleHeroPhotoChange = async (file: File) => {
    setUploadingHero(true);
    try {
      const resized = await resizeImageFile(file, 1600, 0.85);
      const url = await uploadHeroPhoto(resized);
      await addHeroPhoto(url);
    } finally {
      setUploadingHero(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 space-y-10">
      <div>
        <h1 className="font-display text-2xl font-bold text-brand-navy mb-1">Paramètres</h1>
        <p className="text-sm text-gray-500">Gérez le contenu affiché sur la page d'accueil.</p>
      </div>

      <section className="max-w-lg">
        <h2 className="font-semibold text-brand-navy mb-1">Mon compte</h2>
        <p className="text-sm text-gray-500 mb-4">Sécurisez votre propre accès administrateur.</p>
        <MfaSecuritySection />
      </section>

      <section>
        <h2 className="font-semibold text-brand-navy mb-1">Photos du hero</h2>
        <p className="text-sm text-gray-500 mb-4">
          Photos affichées en grand sur la page d'accueil, en carrousel automatique (défilement toutes les 15
          secondes). L'ordre ci-dessous détermine l'ordre du carrousel.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          {heroPhotos.map((photo, i) => (
            <div key={photo.id} className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center gap-1.5 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => moveHeroPhoto(photo.id, "up")}
                  disabled={i === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-navy disabled:opacity-40"
                >
                  <ArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => moveHeroPhoto(photo.id, "down")}
                  disabled={i === heroPhotos.length - 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-brand-navy disabled:opacity-40"
                >
                  <ArrowDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => removeHeroPhoto(photo.id)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-red-500"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            disabled={uploadingHero}
            onClick={() => heroFileInputRef.current?.click()}
            className="flex aspect-[4/3] flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 hover:border-brand-blue/40 hover:bg-brand-blue-light/30 transition-colors disabled:opacity-60"
          >
            <UploadCloud size={20} />
            <span className="text-xs font-medium">{uploadingHero ? "Envoi..." : "Ajouter une photo"}</span>
          </button>
          <input
            ref={heroFileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleHeroPhotoChange(file);
              e.target.value = "";
            }}
          />
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-brand-navy mb-1">Photos des villes</h2>
        <p className="text-sm text-gray-500 mb-4">Une photo par ville pour la grille de la page d'accueil.</p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {gridCities.map((city) => (
            <div key={city} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
              {cityPhotos[city] ? (
                <img src={cityPhotos[city]} alt={city} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-gray-300">Aucune photo</div>
              )}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => fileInputRefs.current[city]?.click()}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-navy"
                >
                  <Camera size={14} />
                </button>
                {cityPhotos[city] && (
                  <button
                    type="button"
                    onClick={() => removeCityPhoto(city)}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <input
                ref={(el) => {
                  fileInputRefs.current[city] = el;
                }}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCityPhotoChange(city, file);
                  e.target.value = "";
                }}
              />
              <span className="absolute bottom-1 left-1 right-1 truncate rounded bg-black/60 px-1.5 py-0.5 text-center text-[10px] font-medium text-white">
                {uploadingCity === city ? "Envoi..." : city}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-brand-navy mb-1">Logements à la une</h2>
        <p className="text-sm text-gray-500 mb-4">
          Choisissez les logements publiés à mettre en avant dans le carrousel de la page d'accueil. Ordre = ordre du carrousel.
        </p>
        {publishedListings.length === 0 ? (
          <p className="text-sm text-gray-400">Aucun logement publié pour l'instant.</p>
        ) : (
          <div className="space-y-2">
            {publishedListings
              .slice()
              .sort((a, b) => {
                const posA = featuredListingIds.indexOf(a.id);
                const posB = featuredListingIds.indexOf(b.id);
                if (posA === -1 && posB === -1) return 0;
                if (posA === -1) return 1;
                if (posB === -1) return -1;
                return posA - posB;
              })
              .map((l) => {
                const featured = isFeatured(l.id);
                return (
                  <div
                    key={l.id}
                    className={`flex items-center gap-3 rounded-xl border p-3 ${
                      featured ? "border-brand-orange bg-brand-orange-light" : "border-gray-100"
                    }`}
                  >
                    {l.image ? (
                      <img src={l.image} alt={l.title} className="h-12 w-12 shrink-0 rounded-lg object-cover" />
                    ) : (
                      <span className="h-12 w-12 shrink-0 rounded-lg bg-gray-100" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-brand-navy">{l.title}</p>
                      <p className="text-xs text-gray-500">{l.city}</p>
                    </div>
                    {featured && (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveFeatured(l.id, "up")}
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/60"
                        >
                          <ArrowUp size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveFeatured(l.id, "down")}
                          className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/60"
                        >
                          <ArrowDown size={14} />
                        </button>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => toggleFeatured(l.id)}
                      className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                        featured ? "bg-brand-orange text-white" : "border border-gray-200 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Star size={12} className={featured ? "fill-white" : ""} />
                      {featured ? "En avant" : "Mettre en avant"}
                    </button>
                  </div>
                );
              })}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-semibold text-brand-navy mb-1">Chiffres clés</h2>
        <p className="text-sm text-gray-500 mb-4">Affichés dans le bandeau de la page d'accueil.</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {siteStats.map((stat) => (
            <StatEditor key={stat.key} stat={stat} onSave={updateStat} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatEditor({
  stat,
  onSave,
}: {
  stat: SiteStat;
  onSave: (key: string, value: string, label: string) => Promise<void>;
}) {
  const [value, setValue] = useState(stat.value);
  const [label, setLabel] = useState(stat.label);
  const [saved, setSaved] = useState(false);
  const dirty = value !== stat.value || label !== stat.label;

  const handleSave = async () => {
    await onSave(stat.key, value, label);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="mb-2 w-full rounded-lg border border-gray-200 px-3 py-2 text-lg font-bold text-brand-navy focus:outline-none"
      />
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-600 focus:outline-none"
      />
      {dirty && (
        <button
          type="button"
          onClick={handleSave}
          className="mt-2 w-full rounded-lg bg-brand-blue py-1.5 text-xs font-semibold text-white hover:bg-brand-blue-dark"
        >
          Enregistrer
        </button>
      )}
      {saved && <p className="mt-2 text-center text-xs font-medium text-brand-green">Enregistré</p>}
    </div>
  );
}
