import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, MapPin } from "lucide-react";
import { useListings } from "../../context/ListingsContext";
import { useBasePath } from "./adminUi";
import { listingStatusClass } from "../../data/listingStatus";

function WhatsAppIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.5.7 4.8 1.9 6.8L3 29l6.7-2.1c1.9 1.1 4.1 1.7 6.3 1.7 7 0 12.7-5.7 12.7-12.7C28.7 8.7 23 3 16 3z"
        fill="#25D366"
      />
      <path
        d="M22.4 19.1c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.2 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4z"
        fill="#fff"
      />
    </svg>
  );
}

const checklist = [
  "Photos ajoutées",
  "Description complète",
  "Prix renseigné",
  "Ville et quartier renseignés",
  "Adresse exacte renseignée",
  "Numéro WhatsApp valide",
  "Coordonnées GPS renseignées (obligatoire)",
];

export function AnnonceVerification() {
  const { id } = useParams();
  const base = useBasePath(useLocation().pathname);
  const navigate = useNavigate();
  const { getListing, publishListing, refuseListing, updateListingLocation } = useListings();
  const listing = id ? getListing(id) : undefined;

  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [locInitialized, setLocInitialized] = useState(false);
  const [locSaving, setLocSaving] = useState(false);
  const [locSaved, setLocSaved] = useState(false);

  useEffect(() => {
    if (listing && !locInitialized) {
      setLat(listing.latitude != null ? String(listing.latitude) : "");
      setLng(listing.longitude != null ? String(listing.longitude) : "");
      setLocInitialized(true);
    }
  }, [listing, locInitialized]);

  if (!listing) {
    return (
      <div className="p-10 text-center text-gray-500">
        Annonce introuvable.{" "}
        <Link to={`${base}/annonces`} className="text-brand-blue font-semibold">
          Retour à la liste
        </Link>
      </div>
    );
  }

  const hasCoords = listing.latitude != null && listing.longitude != null;

  const checks = [
    listing.gallery.length > 0,
    listing.description.trim().length > 0,
    listing.price > 0,
    !!listing.city && !!listing.quartier,
    !!listing.address,
    !!listing.ownerPhone,
    hasCoords,
  ];

  const handlePublish = async () => {
    if (!hasCoords) return;
    await publishListing(listing.id);
    navigate(`${base}/annonces/${listing.id}/publiee`);
  };

  const handleRefuse = async () => {
    await refuseListing(listing.id);
    navigate(`${base}/annonces`);
  };

  const handleSaveLocation = async () => {
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);
    if (Number.isNaN(latNum) || Number.isNaN(lngNum)) return;
    setLocSaving(true);
    try {
      await updateListingLocation(listing.id, latNum, lngNum);
      setLocSaved(true);
      setTimeout(() => setLocSaved(false), 2500);
    } finally {
      setLocSaving(false);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-5xl">
      <Link to={`${base}/annonces`} className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy mb-5">
        <ArrowLeft size={16} /> Retour à la liste des annonces
      </Link>

      <div className="grid lg:grid-cols-[1.3fr_1fr_0.9fr] gap-6">
        <div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center">
            {listing.gallery[0] ? (
              <img src={listing.gallery[0]} alt={listing.title} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm text-gray-400">Aucune photo</span>
            )}
          </div>
          {listing.gallery.length > 1 && (
            <div className="mt-2 grid grid-cols-4 gap-2">
              {listing.gallery.slice(1, 4).map((img, i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img src={img} alt="" className="h-full w-full object-cover" />
                </div>
              ))}
              {listing.gallery.length > 4 && (
                <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500">
                  +{listing.gallery.length - 4}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-lg font-bold text-brand-navy">{listing.title}</h1>
            <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${listingStatusClass(listing.status)}`}>
              {listing.status}
            </span>
          </div>
          <p className="text-lg font-bold text-brand-blue">
            {listing.price.toLocaleString("fr-FR")} FCFA <span className="text-sm font-normal text-gray-500">/ {listing.period}</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            {listing.city}, {listing.quartier}
          </p>
          {listing.address && <p className="text-sm text-gray-500">{listing.address}</p>}
          <p className="text-sm text-gray-500">Université(s) : {listing.universities.join(", ") || "—"}</p>

          <div className="mt-4 rounded-xl border border-gray-100 p-4">
            <h3 className="flex items-center gap-1.5 font-semibold text-brand-navy text-sm mb-1.5">
              <MapPin size={15} /> Coordonnées GPS
            </h3>
            <p className="mb-3 text-xs text-gray-500">
              Le Cameroun n'a pas d'adressage postal standard. Localisez précisément le logement sur la carte à
              partir de la description du propriétaire — cela devient l'adresse affichée à l'étudiant après
              déblocage. Obligatoire avant publication.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">Latitude</span>
                <input
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="Ex : 3.8480"
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-500">Longitude</span>
                <input
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="Ex : 11.5021"
                  className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={handleSaveLocation}
              disabled={!lat || !lng || locSaving}
              className="mt-2.5 w-full rounded-lg bg-brand-navy py-2 text-xs font-semibold text-white hover:bg-brand-navy/90 transition-colors disabled:opacity-50"
            >
              {locSaving ? "Enregistrement..." : locSaved ? "Coordonnées enregistrées ✓" : "Enregistrer les coordonnées"}
            </button>
            {hasCoords && (
              <a
                href={`https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=17/${listing.latitude}/${listing.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block text-center text-xs font-medium text-brand-blue"
              >
                Voir la position enregistrée sur la carte
              </a>
            )}
          </div>

          <div className="mt-4 rounded-xl border border-gray-100 p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400">Propriétaire</p>
              <p className="font-semibold text-brand-navy text-sm">{listing.ownerName}</p>
              <p className="text-xs text-gray-500">{listing.ownerPhone}</p>
            </div>
            <WhatsAppIcon />
          </div>

          <h3 className="font-semibold text-brand-navy text-sm mt-4 mb-1.5">Description</h3>
          <p className="text-sm text-gray-500">{listing.description || "Aucune description."}</p>

          <h3 className="font-semibold text-brand-navy text-sm mt-4 mb-1.5">Équipements</h3>
          <div className="grid grid-cols-2 gap-1.5 text-sm text-gray-600">
            {listing.equipements.length > 0 ? (
              listing.equipements.map((e) => <span key={e}>• {e}</span>)
            ) : (
              <span className="text-gray-400">Aucun équipement renseigné</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-brand-navy text-sm mb-3">Checklist de vérification</h3>
          <ul className="space-y-2 mb-6">
            {checklist.map((c, i) => (
              <li key={c} className="flex items-center justify-between text-sm text-gray-600">
                {c}
                {checks[i] ? (
                  <CheckCircle2 size={16} className="text-brand-green" />
                ) : (
                  <span className="h-4 w-4 rounded-full border-2 border-gray-200" />
                )}
              </li>
            ))}
          </ul>

          <h3 className="font-semibold text-brand-navy text-sm mb-3">Actions</h3>
          <div className="space-y-2.5">
            <button
              onClick={handlePublish}
              disabled={!hasCoords}
              title={!hasCoords ? "Enregistrez les coordonnées GPS avant de publier" : undefined}
              className="w-full rounded-xl bg-brand-green py-2.5 font-semibold text-white hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publier l'annonce
            </button>
            {!hasCoords && (
              <p className="text-center text-xs text-amber-600">
                Renseignez les coordonnées GPS ci-contre pour activer la publication.
              </p>
            )}
            <Link
              to={`${base}/annonces/${listing.id}/modifications`}
              className="block w-full rounded-xl bg-amber-100 py-2.5 text-center font-semibold text-amber-700 hover:bg-amber-200 transition-colors"
            >
              Demander des modifications
            </Link>
            <button
              onClick={handleRefuse}
              className="w-full rounded-xl bg-red-50 py-2.5 font-semibold text-red-600 hover:bg-red-100 transition-colors"
            >
              Refuser l'annonce
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
