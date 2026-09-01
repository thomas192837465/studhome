import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Bed,
  Building2,
  Building,
  Users2,
  Sofa,
  PackageOpen,
  UploadCloud,
  X,
  Info,
  MapPin,
  LocateFixed,
  Loader2,
  CheckCircle2,
  Circle,
  ShieldCheck,
  BadgeCheck,
  MinusCircle,
  GraduationCap,
  Video,
  Film,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { useOwner } from "../../context/OwnerContext";
import { useListings } from "../../context/ListingsContext";
import { resizeImageFile } from "../../lib/resizeImage";
import { getVideoDuration } from "../../lib/validateVideo";
import { uploadListingVideo } from "../../lib/uploadPhoto";
import { getCurrentPosition, reverseGeocode } from "../../lib/geolocation";
import { Autocomplete } from "../../components/Autocomplete";
import { CameroonFlag } from "../../components/CameroonFlag";
import { useSiteContent } from "../../context/SiteContentContext";
import type { ListingDraft } from "../../data/listingTypes";

const steps = ["Type", "Infos", "Photos", "Tarif", "Propriétaire", "Aperçu"];

const MAX_PHOTOS = 15;
const MAX_VIDEO_MB = 50;
const MAX_VIDEO_SECONDS = 60;

const typeOptions = [
  { id: "Chambre", icon: Bed, desc: "Chambre simple avec accès aux espaces communs" },
  { id: "Studio", icon: Building2, desc: "Studio autonome avec cuisine et salle d'eau" },
  { id: "Appartement", icon: Building, desc: "Appartement complet (2 pièces et plus)" },
  { id: "Colocation", icon: Users2, desc: "Chambre en colocation (plusieurs occupants)" },
  { id: "Meublé", icon: Sofa, desc: "Logement équipé de meubles, prêt à vivre" },
  { id: "Non meublé", icon: PackageOpen, desc: "Logement sans mobilier" },
];

const equipementsOptions = ["Eau chaude", "Wi-Fi", "Groupe électrogène", "Parking", "Gardien", "Climatisation"];

const cautionTypeOptions = [
  {
    id: "non_incluse" as const,
    icon: ShieldCheck,
    label: "Non, la caution n'est pas incluse",
    desc: "Les étudiants devront payer une caution en plus du loyer annuel.",
  },
  {
    id: "incluse" as const,
    icon: BadgeCheck,
    label: "Oui, la caution est incluse",
    desc: "La caution est déjà comprise dans le loyer annuel.",
  },
  {
    id: "aucune" as const,
    icon: MinusCircle,
    label: "Pas de caution demandée",
    desc: "Vous ne demandez pas de dépôt de garantie.",
  },
];

export function PublishWizard() {
  const { id: editId } = useParams();
  const { ownerId, ownerUser, draft, updateDraft, submitDraft, resetDraft } = useOwner();
  const { getListing, updateListing } = useListings();
  const { universities: universitesOptions, cities: villes, proposeCity, proposeUniversity } = useSiteContent();
  const [step, setStep] = useState(1);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoError, setVideoError] = useState("");
  const [uniInput, setUniInput] = useState("");
  const [locationMode, setLocationMode] = useState<"gps" | "manual" | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [geocodedLabel, setGeocodedLabel] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const initialized = useRef(false);

  const editingListing = editId ? getListing(editId) : undefined;

  useEffect(() => {
    if (initialized.current) return;
    if (editId) {
      if (!editingListing) return; // wait for listings to load
      const asDraft: ListingDraft = {
        title: editingListing.title,
        type: editingListing.type,
        ville: editingListing.city,
        quartier: editingListing.quartier,
        address: editingListing.address,
        latitude: editingListing.latitude,
        longitude: editingListing.longitude,
        universities: editingListing.universities,
        description: editingListing.description,
        equipements: editingListing.equipements,
        photos: editingListing.gallery,
        video: editingListing.videoUrl || "",
        loyer: String(editingListing.price || ""),
        charges: [],
        cautionType: editingListing.cautionType,
        caution: editingListing.cautionMonths || "1 mois",
        disponibleDate: "",
        contactPhone: editingListing.ownerPhone,
      };
      updateDraft(asDraft);
      if (editingListing.latitude != null && editingListing.longitude != null) {
        setLocationMode("gps");
        setGeocodedLabel([editingListing.quartier, editingListing.city].filter(Boolean).join(", "));
      } else if (editingListing.quartier) {
        setLocationMode("manual");
      }
    } else {
      resetDraft();
      updateDraft({ contactPhone: ownerUser.phone });
    }
    initialized.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, editingListing]);

  const addUniversityFromInput = (v: string) => {
    if (v && !draft.universities.includes(v)) {
      updateDraft({ universities: [...draft.universities, v] });
      if (!universitesOptions.some((u) => u.toLowerCase() === v.toLowerCase())) proposeUniversity(v);
    }
    setUniInput("");
  };

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    setLocationError("");
    try {
      const coords = await getCurrentPosition();
      const geo = await reverseGeocode(coords);
      updateDraft({
        latitude: coords.latitude,
        longitude: coords.longitude,
        ville: draft.ville || geo.city,
        quartier: geo.area || draft.quartier,
      });
      setGeocodedLabel(geo.label);
      setLocationMode("gps");
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : "Impossible de localiser votre logement.");
    } finally {
      setLocating(false);
    }
  };

  if (editId && !editingListing) {
    return <div className="p-10 text-center text-gray-400">Chargement de l'annonce...</div>;
  }

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const remaining = MAX_PHOTOS - draft.photos.length;
    const toProcess = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, Math.max(0, remaining));
    if (toProcess.length === 0) return;
    setUploading(true);
    try {
      const resized = await Promise.all(toProcess.map((file) => resizeImageFile(file, 1600, 0.82, true)));
      updateDraft({ photos: [...draft.photos, ...resized] });
    } finally {
      setUploading(false);
    }
  };

  const handleVideoFile = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file || !file.type.startsWith("video/")) return;
    if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
      setVideoError(`La vidéo est trop volumineuse (max ${MAX_VIDEO_MB} Mo).`);
      return;
    }
    setVideoError("");
    setVideoUploading(true);
    try {
      const duration = await getVideoDuration(file);
      if (duration > MAX_VIDEO_SECONDS) {
        setVideoError(`La vidéo est trop longue (max ${MAX_VIDEO_SECONDS} secondes).`);
        return;
      }
      const url = await uploadListingVideo(file, ownerId ?? "anonyme");
      updateDraft({ video: url });
    } catch {
      setVideoError("Échec de l'envoi de la vidéo. Réessayez.");
    } finally {
      setVideoUploading(false);
    }
  };

  const next = () => (step < 6 ? setStep(step + 1) : undefined);
  const back = () => (step > 1 ? setStep(step - 1) : navigate("/proprietaire/publier"));

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError("");
    try {
      if (editId) {
        await updateListing(editId, draft, ownerId ?? "");
        navigate(`/proprietaire/annonces/${editId}`);
      } else {
        await submitDraft();
        navigate("/proprietaire/publier/succes");
      }
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Une erreur est survenue. Réessayez.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-3xl mx-auto">
      <div className="rounded-3xl border border-gray-100 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 mb-7 text-xs">
          {steps.map((label, i) => {
            const n = i + 1;
            const active = n === step;
            const done = n < step;
            return (
              <div key={label} className="flex items-center gap-2">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ${
                    active
                      ? "bg-brand-blue text-white"
                      : done
                        ? "bg-brand-blue-light text-brand-blue"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {n}
                </span>
                <span className={active ? "font-semibold text-brand-blue" : "text-gray-400"}>{label}</span>
                {n < steps.length && <span className="w-4 h-px bg-gray-200" />}
              </div>
            );
          })}
        </div>

        {step === 1 && (
          <div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Quel type de logement proposez-vous ?</h2>
            <p className="mt-1 text-sm text-gray-500">Sélectionnez le type qui correspond le mieux à votre bien.</p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {typeOptions.map(({ id, icon: Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => updateDraft({ type: id })}
                  className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-colors ${
                    draft.type === id ? "border-brand-blue bg-brand-blue-light" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Icon size={22} className="text-brand-blue shrink-0 mt-0.5" />
                  <span>
                    <span className="block font-semibold text-brand-navy text-sm">{id}</span>
                    <span className="block text-xs text-gray-500 mt-0.5">{desc}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Informations sur le logement</h2>
            <p className="mt-1 text-sm text-gray-500">Renseignez les détails de votre logement.</p>

            <label className="block mt-6 max-w-sm">
              <span className="mb-1.5 block text-sm font-medium text-brand-navy">Nom du logement *</span>
              <input
                value={draft.title}
                onChange={(e) => updateDraft({ title: e.target.value })}
                placeholder="Ex : Résidence Saint-Luc"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              <span className="mt-1 block text-xs text-gray-400">
                C'est le nom qui apparaîtra comme titre de votre annonce.
              </span>
            </label>

            <label className="block mt-4 max-w-sm">
              <span className="mb-1.5 block text-sm font-medium text-brand-navy">Ville *</span>
              <Autocomplete
                value={draft.ville}
                onChange={(v) => updateDraft({ ville: v, quartier: "" })}
                options={villes}
                onBlur={() => {
                  const v = draft.ville.trim();
                  if (v && !villes.some((c) => c.toLowerCase() === v.toLowerCase())) proposeCity(v);
                }}
                placeholder="Ex : Yaoundé"
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              <span className="mt-1 block text-xs text-gray-400">
                Votre ville n'est pas dans la liste ? Écrivez-la, elle sera ajoutée après validation par notre équipe.
              </span>
            </label>

            <div className="mt-5">
              <span className="mb-2 block text-sm font-medium text-brand-navy">Localisation du logement *</span>

              {locationMode === null && (
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleUseCurrentLocation}
                    disabled={locating}
                    className="flex flex-col items-start gap-2 rounded-xl border border-gray-200 p-4 text-left hover:border-brand-blue hover:bg-brand-blue-light transition-colors disabled:opacity-60"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
                      <LocateFixed size={18} />
                    </span>
                    <span className="font-semibold text-brand-navy text-sm">Je suis dans le logement</span>
                    <span className="text-xs text-gray-500">
                      Utilisez votre position actuelle pour localiser précisément le logement.
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode("manual")}
                    className="flex flex-col items-start gap-2 rounded-xl border border-gray-200 p-4 text-left hover:border-gray-300 transition-colors"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                      <MapPin size={18} />
                    </span>
                    <span className="font-semibold text-brand-navy text-sm">Je ne suis pas actuellement sur place</span>
                    <span className="text-xs text-gray-500">
                      Indiquez le quartier approximativement, un agent confirmera la position plus tard.
                    </span>
                  </button>
                </div>
              )}

              {locating && (
                <p className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 size={15} className="animate-spin" /> Localisation en cours...
                </p>
              )}

              {locationError && <p className="mt-3 text-sm text-red-500">{locationError}</p>}

              {locationMode === "gps" && !locating && (
                <div className="mt-3 rounded-xl bg-brand-green-light border border-green-100 p-4">
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-green-800">
                    <CheckCircle2 size={16} className="shrink-0" />
                    Nous avons localisé votre logement ici : {geocodedLabel || `${draft.quartier}, ${draft.ville}`}.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setLocationMode(null);
                      setLocationError("");
                      updateDraft({ latitude: undefined, longitude: undefined });
                    }}
                    className="mt-2 text-xs font-medium text-green-700 underline"
                  >
                    Localiser à nouveau
                  </button>

                  <label className="block mt-4">
                    <span className="mb-1.5 block text-sm font-medium text-brand-navy">
                      Comment reconnaître le logement ?
                    </span>
                    <input
                      value={draft.address}
                      onChange={(e) => updateDraft({ address: e.target.value })}
                      placeholder="Ex : Immeuble jaune, portail noir, derrière la pharmacie"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    />
                  </label>
                </div>
              )}

              {locationMode === "manual" && (
                <div className="mt-3 space-y-4">
                  <p className="rounded-xl bg-brand-blue-light px-4 py-3 text-sm text-gray-700">
                    Pas de problème ! Vous pouvez continuer à publier votre logement. Un agent StudHome vous
                    contactera prochainement afin de confirmer avec vous la localisation exacte du logement.
                  </p>
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-brand-navy">Détails complémentaires (optionnel)</span>
                    <input
                      value={draft.address}
                      onChange={(e) => updateDraft({ address: e.target.value })}
                      placeholder="Ex : Rue 1.234, derrière la pharmacie du Carrefour"
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                    />
                  </label>
                  <button type="button" onClick={() => setLocationMode(null)} className="text-xs font-medium text-gray-400">
                    ← Changer de méthode
                  </button>
                </div>
              )}

              <span className="mt-3 flex items-start gap-1.5 text-xs text-gray-400">
                <Info size={13} className="mt-0.5 shrink-0" />
                Ces informations de localisation précise ne sont visibles par un étudiant qu'après avoir débloqué le
                contact (payant). Elles n'apparaissent jamais publiquement.
              </span>
            </div>

            <label className="block mt-4">
              <span className="mb-1.5 block text-sm font-medium text-brand-navy">Université(s) à proximité</span>
              <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 p-2.5">
                {draft.universities.map((u) => (
                  <span
                    key={u}
                    className="flex items-center gap-1 rounded-full bg-brand-blue-light px-2.5 py-1 text-xs font-medium text-brand-blue"
                  >
                    {u}
                    <button onClick={() => updateDraft({ universities: draft.universities.filter((x) => x !== u) })}>
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <div className="flex flex-1 min-w-[160px] items-center gap-1.5">
                  <Autocomplete
                    value={uniInput}
                    onChange={setUniInput}
                    options={universitesOptions.filter((u) => !draft.universities.includes(u))}
                    onSelect={addUniversityFromInput}
                    placeholder="+ Ajouter une université"
                    className="flex-1 min-w-0 text-sm focus:outline-none"
                  />
                  {uniInput.trim() && (
                    <button
                      type="button"
                      onClick={() => addUniversityFromInput(uniInput.trim())}
                      className="shrink-0 rounded-full bg-brand-blue px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-blue-dark"
                    >
                      Ajouter
                    </button>
                  )}
                </div>
              </div>
              <span className="mt-1 block text-xs text-gray-400">
                Université absente de la liste ? Tapez son nom puis cliquez sur "Ajouter" — elle sera ajoutée après
                validation.
              </span>
            </label>

            <label className="block mt-4">
              <span className="mb-1.5 block text-sm font-medium text-brand-navy">Description *</span>
              <textarea
                value={draft.description}
                onChange={(e) => updateDraft({ description: e.target.value.slice(0, 300) })}
                rows={3}
                placeholder="Chambre meublée avec salle d'eau interne, accès cuisine, eau chaude, wifi, groupe électrogène et parking."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
              <span className="block text-right text-xs text-gray-400">{draft.description.length}/300</span>
            </label>

            <div className="mt-2">
              <span className="mb-2 block text-sm font-medium text-brand-navy">Équipements</span>
              <div className="grid sm:grid-cols-3 gap-2.5">
                {equipementsOptions.map((eq) => (
                  <label key={eq} className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={draft.equipements.includes(eq)}
                      onChange={() =>
                        updateDraft({
                          equipements: draft.equipements.includes(eq)
                            ? draft.equipements.filter((x) => x !== eq)
                            : [...draft.equipements, eq],
                        })
                      }
                      className="h-4 w-4 rounded accent-brand-blue"
                    />
                    {eq}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Ajoutez des photos</h2>
            <p className="mt-1 text-sm text-gray-500">
              Ajoutez jusqu'à 15 photos. La première photo sera utilisée comme couverture de votre annonce.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                handleFiles(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploading || draft.photos.length >= MAX_PHOTOS}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                handleFiles(e.dataTransfer.files);
              }}
              className="mt-5 w-full rounded-xl border-2 border-dashed border-gray-200 py-10 flex flex-col items-center gap-2 text-sm text-gray-500 hover:border-brand-blue/40 hover:bg-brand-blue-light/30 transition-colors disabled:opacity-60"
            >
              <UploadCloud size={28} className="text-gray-400" />
              <span>
                {uploading
                  ? "Traitement des photos..."
                  : draft.photos.length >= MAX_PHOTOS
                    ? "Nombre maximum de photos atteint"
                    : (
                      <>
                        Glissez-déposez vos photos ici ou <span className="text-brand-blue font-medium">cliquez pour sélectionner</span>
                      </>
                    )}
              </span>
              <span className="text-xs text-gray-400">JPG, PNG — Max {MAX_PHOTOS} images — {draft.photos.length}/{MAX_PHOTOS} ajoutées</span>
            </button>

            {draft.photos.length > 0 && (
              <div className="mt-4 grid grid-cols-4 sm:grid-cols-5 gap-3">
                {draft.photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img src={p} alt="" className="h-full w-full object-cover" />
                    {i === 0 && (
                      <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] text-white">
                        Couverture
                      </span>
                    )}
                    <button
                      onClick={() => updateDraft({ photos: draft.photos.filter((_, idx) => idx !== i) })}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/90 text-gray-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-6 rounded-xl bg-brand-blue-light p-4 text-xs text-gray-600 space-y-1.5">
              <p className="font-semibold text-brand-navy text-sm mb-1">Conseils pour de bonnes photos</p>
              <p className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-brand-green" /> Prenez des photos nettes et
                lumineuses
              </p>
              <p className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-brand-green" /> Montrez la chambre, la salle
                d'eau, la cuisine et l'extérieur
              </p>
              <p className="flex items-center gap-1.5">
                <FontAwesomeIcon icon={faCheck} className="h-3 w-3 text-brand-green" /> Évitez les photos floues ou
                sombres
              </p>
            </div>

            <div className="mt-6">
              <span className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-brand-navy">
                <Film size={15} /> Vidéo de présentation (optionnel)
              </span>
              <p className="mb-3 text-xs text-gray-500">
                Une courte vidéo rassure les étudiants. Max {MAX_VIDEO_SECONDS} secondes, {MAX_VIDEO_MB} Mo.
              </p>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => {
                  handleVideoFile(e.target.files);
                  e.target.value = "";
                }}
              />
              {draft.video ? (
                <div className="relative overflow-hidden rounded-xl bg-black">
                  <video src={draft.video} controls className="max-h-64 w-full" />
                  <button
                    onClick={() => updateDraft({ video: "" })}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-gray-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={videoUploading}
                  onClick={() => videoInputRef.current?.click()}
                  className="w-full rounded-xl border-2 border-dashed border-gray-200 py-8 flex flex-col items-center gap-2 text-sm text-gray-500 hover:border-brand-blue/40 hover:bg-brand-blue-light/30 transition-colors disabled:opacity-60"
                >
                  <Video size={24} className="text-gray-400" />
                  <span>
                    {videoUploading ? "Envoi en cours..." : "Cliquez pour ajouter une vidéo"}
                  </span>
                </button>
              )}
              {videoError && <p className="mt-2 text-xs text-red-500">{videoError}</p>}
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Définissez le tarif</h2>
            <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-brand-blue-light px-4 py-3 text-xs text-gray-600">
              <Info size={16} className="mt-0.5 shrink-0 text-brand-blue" />
              Le tarif affiché sur StudHome sera celui que vous définissez ici. StudHome ne modifie pas les loyers et
              ne prend aucune commission.
            </div>

            <label className="block mt-5">
              <span className="mb-1.5 block text-sm font-medium text-brand-navy">Loyer annuel *</span>
              <div className="flex items-center rounded-xl border border-gray-200 px-4 py-3">
                <input
                  value={draft.loyer}
                  onChange={(e) => updateDraft({ loyer: e.target.value.replace(/\D/g, "") })}
                  placeholder="200000"
                  className="w-full text-sm focus:outline-none"
                />
                <span className="text-sm text-gray-400 shrink-0">FCFA / an</span>
              </div>
              <span className="mt-1 block text-xs text-gray-400">Montant annuel que les étudiants verront sur votre annonce.</span>
            </label>

            <div className="mt-4">
              <span className="mb-2 block text-sm font-medium text-brand-navy">Charges incluses</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {["Eau", "Wi-Fi", "Électricité", "Groupe électrogène"].map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={draft.charges.includes(c)}
                      onChange={() =>
                        updateDraft({
                          charges: draft.charges.includes(c) ? draft.charges.filter((x) => x !== c) : [...draft.charges, c],
                        })
                      }
                      className="h-4 w-4 rounded accent-brand-blue"
                    />
                    {c}
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5">
              <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-brand-navy">
                Caution (dépôt de garantie) <Info size={13} className="text-gray-400" />
              </span>
              <div className="grid sm:grid-cols-3 gap-3">
                {cautionTypeOptions.map((opt) => {
                  const selected = draft.cautionType === opt.id;
                  return (
                    <button
                      type="button"
                      key={opt.id}
                      onClick={() => updateDraft({ cautionType: opt.id })}
                      className={`rounded-xl border-2 p-4 text-left transition-colors ${
                        selected ? "border-brand-blue bg-brand-blue-light/30" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selected ? (
                          <CheckCircle2 size={16} className="text-brand-blue shrink-0" />
                        ) : (
                          <Circle size={16} className="text-gray-300 shrink-0" />
                        )}
                        <opt.icon size={15} className="text-brand-blue shrink-0" />
                        <span className="text-sm font-semibold text-brand-navy">{opt.label}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-gray-500">{opt.desc}</p>

                      {opt.id === "non_incluse" && selected && (
                        <div className="mt-3 border-t border-brand-blue/20 pt-3" onClick={(e) => e.stopPropagation()}>
                          <span className="mb-1 block text-xs font-semibold text-brand-navy">
                            Caution de combien de mois ?
                          </span>
                          <select
                            value={draft.caution}
                            onChange={(e) => updateDraft({ caution: e.target.value })}
                            className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none"
                          >
                            <option>1 mois</option>
                            <option>2 mois</option>
                            <option>3 mois</option>
                          </select>
                        </div>
                      )}

                      {opt.id === "incluse" && (
                        <div className="mt-3 rounded-lg bg-brand-blue-light px-3 py-2 text-xs text-blue-800">
                          À ce que verront les étudiants : <span className="font-semibold">Caution incluse</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <label className="block mt-5 max-w-sm">
              <span className="mb-1.5 block text-sm font-medium text-brand-navy">Disponible à partir du</span>
              <input
                type="date"
                value={draft.disponibleDate}
                onChange={(e) => updateDraft({ disponibleDate: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
              />
            </label>
          </div>
        )}

        {step === 5 && (
          <div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Vos coordonnées propriétaire</h2>
            <p className="mt-1 text-sm text-gray-500">
              Ces informations seront visibles par les étudiants une fois l'annonce publiée.
            </p>
            <div className="mt-6 rounded-xl border border-gray-100 p-5 flex items-center gap-4">
              <MapPin className="text-brand-blue shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-brand-navy">
                  {[draft.ville, draft.quartier].filter(Boolean).join(", ") || "Ville"}
                </p>
                <p className="text-gray-500">{draft.universities.join(", ") || "Aucune université sélectionnée"}</p>
              </div>
            </div>
            <div className="mt-3 rounded-xl border border-gray-100 p-5">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-navy">Confirmez votre numéro WhatsApp *</span>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 focus-within:ring-2 focus-within:ring-brand-blue/30">
                  <CameroonFlag className="h-3.5 w-5 rounded-sm shrink-0" />
                  <input
                    value={draft.contactPhone}
                    onChange={(e) => updateDraft({ contactPhone: e.target.value })}
                    type="tel"
                    placeholder="+237 6XX XXX XXX"
                    className="w-full text-sm focus:outline-none"
                  />
                </div>
                <span className="mt-1.5 block text-xs text-gray-400">
                  C'est ce numéro que les étudiants utiliseront pour vous contacter sur WhatsApp au sujet de cette
                  annonce — modifiez-le si vous souhaitez en utiliser un autre.
                </span>
              </label>
            </div>
          </div>
        )}

        {step === 6 && (
          <div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Prévisualisation de l'annonce</h2>
            <div className="mt-5 grid sm:grid-cols-2 gap-6">
              <div>
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
                  {draft.photos[0] ? (
                    <img src={draft.photos[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">
                      Aucune photo ajoutée
                    </div>
                  )}
                  <span className="absolute top-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-brand-green">
                    Aperçu de votre annonce
                  </span>
                </div>
                {draft.photos.length > 1 && (
                  <div className="mt-2 grid grid-cols-4 gap-2">
                    {draft.photos.slice(1, 5).map((p, i) => (
                      <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                        <img src={p} alt="" className="h-full w-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-brand-navy">
                  {draft.title || "Nom du logement"}
                </h3>
                <p className="mt-1 text-xl font-bold text-brand-blue">
                  {draft.loyer || "0"} FCFA <span className="text-sm font-normal text-gray-500">/ an</span>
                </p>
                <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
                  <MapPin size={14} /> {[draft.ville, draft.quartier].filter(Boolean).join(", ") || "Ville"}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <GraduationCap size={14} /> {draft.universities.join(", ") || "—"}
                </p>
                {draft.equipements.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 gap-1.5 text-sm text-gray-600">
                    {draft.equipements.map((e) => (
                      <span key={e}>• {e}</span>
                    ))}
                  </div>
                )}
                <p className="mt-3 text-sm text-gray-500">{draft.description || "Aucune description."}</p>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                disabled={submitting}
                className="flex-1 rounded-xl border border-gray-200 py-3 font-semibold text-brand-navy hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Modifier
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
              >
                {submitting ? "Envoi en cours..." : editId ? "Enregistrer les modifications" : "Soumettre l'annonce"}
              </button>
            </div>
            {submitError && <p className="mt-3 text-center text-sm text-red-500">{submitError}</p>}
            <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
              <Info size={13} />{" "}
              {editId
                ? "L'annonce repassera en attente de vérification par notre équipe."
                : "En soumettant, vous confirmez que toutes les informations sont exactes."}
            </p>
          </div>
        )}

        {step < 6 && (
          <div className="mt-8">
            <div className="flex justify-between">
              <button onClick={back} className="rounded-xl border border-gray-200 px-6 py-2.5 font-semibold text-brand-navy hover:bg-gray-50 transition-colors">
                Retour
              </button>
              <button
                onClick={next}
                disabled={
                  step === 1
                    ? !draft.type
                    : step === 2
                      ? !draft.title ||
                        !draft.ville ||
                        (locationMode === "gps" ? draft.latitude == null : locationMode !== "manual")
                      : step === 3
                        ? draft.photos.length === 0
                        : step === 5
                          ? !draft.contactPhone.trim()
                          : false
                }
                className="rounded-xl bg-brand-blue px-6 py-2.5 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            </div>
            {step === 3 && draft.photos.length === 0 && (
              <p className="mt-2 text-right text-xs text-gray-400">Ajoutez au moins une photo pour continuer.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
