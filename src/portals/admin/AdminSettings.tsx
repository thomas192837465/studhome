import { useRef, useState } from "react";
import { Camera, Trash2, ArrowUp, ArrowDown, Star, UploadCloud, Plus, GraduationCap, MapPin } from "lucide-react";
import { useSiteContent, type SiteStat } from "../../context/SiteContentContext";
import { useListings } from "../../context/ListingsContext";
import { resizeImageFile } from "../../lib/resizeImage";
import { uploadCityPhoto, uploadHeroPhoto } from "../../lib/uploadPhoto";
import { MfaSecuritySection } from "../../components/MfaSecuritySection";

const GRID_SIZE = 10;

export function AdminSettings() {
  const {
    cityGrid,
    setCityGridCity,
    setCityGridPhoto,
    removeCityGridSlot,
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
    universities,
    addUniversity,
    removeUniversity,
    cities: cameroonCities,
    addCity,
    removeCity,
  } = useSiteContent();
  const { listings } = useListings();
  const publishedListings = listings.filter((l) => l.status === "Publiée");
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});
  const heroFileInputRef = useRef<HTMLInputElement>(null);
  const [newUniversity, setNewUniversity] = useState("");
  const [addingUniversity, setAddingUniversity] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [addingCity, setAddingCity] = useState(false);

  const handleAddUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUniversity.trim()) return;
    setAddingUniversity(true);
    try {
      await addUniversity(newUniversity);
      setNewUniversity("");
    } finally {
      setAddingUniversity(false);
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity.trim()) return;
    setAddingCity(true);
    try {
      await addCity(newCity);
      setNewCity("");
    } finally {
      setAddingCity(false);
    }
  };

  const citySlots = Array.from({ length: GRID_SIZE }, (_, i) => cityGrid.find((s) => s.position === i));

  const handleCityPhotoChange = async (position: number, city: string, file: File) => {
    setUploadingSlot(position);
    try {
      const resized = await resizeImageFile(file, 1200, 0.85);
      const url = await uploadCityPhoto(resized, city);
      await setCityGridPhoto(position, url);
    } finally {
      setUploadingSlot(null);
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
        <p className="text-sm text-gray-500 mb-4">
          Choisissez la ville et la photo de chacune des {GRID_SIZE} cases de la grille affichée sur la page d'accueil.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {citySlots.map((slot, i) => {
            const city = slot?.city ?? "";
            const photoUrl = slot?.photoUrl ?? "";
            return (
              <div key={i} className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100">
                {photoUrl ? (
                  <img src={photoUrl} alt={city} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-gray-300">
                    {city ? "Aucune photo" : "Case vide"}
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    disabled={!city}
                    onClick={() => fileInputRefs.current[i]?.click()}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-brand-navy disabled:opacity-40"
                    title={city ? "Changer la photo" : "Choisissez d'abord une ville"}
                  >
                    <Camera size={14} />
                  </button>
                  {(photoUrl || city) && (
                    <button
                      type="button"
                      onClick={() => removeCityGridSlot(i)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-red-500"
                      title="Vider cette case"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
                <input
                  ref={(el) => {
                    fileInputRefs.current[i] = el;
                  }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file && city) handleCityPhotoChange(i, city, file);
                    e.target.value = "";
                  }}
                />
                <select
                  value={city}
                  onChange={(e) => setCityGridCity(i, e.target.value)}
                  className="absolute bottom-1 left-1 right-1 truncate rounded bg-black/70 px-1.5 py-1 text-center text-[10px] font-medium text-white focus:outline-none"
                >
                  <option value="" className="text-black">
                    {uploadingSlot === i ? "Envoi..." : "Choisir une ville"}
                  </option>
                  {cameroonCities.map((c) => (
                    <option key={c} value={c} className="text-black">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
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

      <section>
        <h2 className="font-semibold text-brand-navy mb-1">Universités</h2>
        <p className="text-sm text-gray-500 mb-4">
          La liste ci-dessous complète automatiquement tous les champs "Université" du site (recherche, profil
          étudiant, questionnaire propriétaire).
        </p>
        <form onSubmit={handleAddUniversity} className="flex gap-2 mb-4 max-w-md">
          <input
            value={newUniversity}
            onChange={(e) => setNewUniversity(e.target.value)}
            placeholder="Ex : Université de Buea"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          <button
            type="submit"
            disabled={addingUniversity || !newUniversity.trim()}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
          >
            <Plus size={15} /> Ajouter
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {universities.map((u) => (
            <span
              key={u}
              className="flex items-center gap-1.5 rounded-full bg-brand-blue-light px-3 py-1.5 text-xs font-medium text-brand-blue"
            >
              <GraduationCap size={13} />
              {u}
              <button
                type="button"
                onClick={() => removeUniversity(u)}
                className="ml-0.5 text-brand-blue/60 hover:text-red-500"
                title="Supprimer"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-semibold text-brand-navy mb-1">Villes</h2>
        <p className="text-sm text-gray-500 mb-4">
          La liste ci-dessous complète automatiquement tous les champs "Ville" du site (recherche, profil étudiant,
          questionnaire propriétaire, cases de la grille ci-dessus).
        </p>
        <form onSubmit={handleAddCity} className="flex gap-2 mb-4 max-w-md">
          <input
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder="Ex : Bafang"
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
          <button
            type="submit"
            disabled={addingCity || !newCity.trim()}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
          >
            <Plus size={15} /> Ajouter
          </button>
        </form>
        <div className="flex flex-wrap gap-2">
          {cameroonCities.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1.5 rounded-full bg-brand-orange-light px-3 py-1.5 text-xs font-medium text-brand-orange-dark"
            >
              <MapPin size={13} />
              {c}
              <button
                type="button"
                onClick={() => removeCity(c)}
                className="ml-0.5 text-brand-orange-dark/60 hover:text-red-500"
                title="Supprimer"
              >
                ×
              </button>
            </span>
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
