import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Lock, ShieldCheck, CheckCircle2, X } from "lucide-react";
import { getListingById } from "../data/listings";
import { useApp } from "../context/AppContext";
import { MapPreview } from "../components/MapPreview";

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

function maskPhone(phone: string) {
  const digits = phone.split(" ");
  return digits.map((d, i) => (i === 0 || i === digits.length - 1 ? d : "••")).join(" ");
}

export function AccommodationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const listing = id ? getListingById(id) : undefined;
  const { isAuthenticated, isFavorite, toggleFavorite, isUnlocked, unlockListing, credits } = useApp();
  const [activeImg, setActiveImg] = useState(0);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    setActiveImg(0);
  }, [id]);

  if (!listing) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <p className="text-gray-500">Ce logement n'existe pas ou plus.</p>
        <Link to="/logements" className="mt-4 inline-block text-brand-blue font-semibold">
          Retour aux résultats
        </Link>
      </div>
    );
  }

  const unlocked = isUnlocked(listing.id);
  const fav = isFavorite(listing.id);

  const handleUnlock = () => {
    if (!isAuthenticated) {
      navigate("/connexion");
      return;
    }
    if (unlocked) return;
    const ok = unlockListing(listing.id, listing.unlockCost, listing.city);
    if (ok) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    } else {
      navigate("/credits/achat");
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-10 py-8">
      {showToast && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-xl bg-brand-green-light border border-green-200 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="text-brand-green shrink-0" size={20} />
            <div>
              <p className="text-sm font-semibold text-green-800">Contact débloqué avec succès !</p>
              <p className="text-xs text-green-700">Vous pouvez maintenant contacter le propriétaire.</p>
            </div>
          </div>
          <button onClick={() => setShowToast(false)} className="text-green-700">
            <X size={16} />
          </button>
        </div>
      )}

      <Link to="/logements" className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy mb-5">
        <ArrowLeft size={16} /> Retour aux résultats
      </Link>

      <div className="grid lg:grid-cols-[1.5fr_1fr] gap-8">
        <div>
          <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-gray-100">
            <img src={listing.gallery[activeImg]} alt={listing.title} className="h-full w-full object-cover" />
            {listing.verified && (
              <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-green-700">
                <ShieldCheck size={13} /> Vérifié
              </span>
            )}
            <button
              onClick={() => isAuthenticated && toggleFavorite(listing.id)}
              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95"
            >
              <Heart size={17} className={fav ? "fill-brand-blue text-brand-blue" : "text-brand-blue"} />
            </button>
            <button
              onClick={() => setActiveImg((i) => (i - 1 + listing.gallery.length) % listing.gallery.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setActiveImg((i) => (i + 1) % listing.gallery.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-3">
            {listing.gallery.slice(0, 3).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImg(i)}
                className="aspect-square rounded-xl overflow-hidden bg-gray-100"
              >
                <img src={img} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
            <button
              onClick={() => setActiveImg(3)}
              className="aspect-square rounded-xl bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500"
            >
              +{unlocked ? "8" : "8"}
            </button>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-brand-navy mb-2">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">{listing.description}</p>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-brand-navy mb-3">A proximité</h2>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              {listing.proximity.map((p, i) => (
                <div
                  key={p.name}
                  className={`flex items-center justify-between px-4 py-3 text-sm ${
                    i % 2 === 0 ? "bg-gray-50" : "bg-white"
                  }`}
                >
                  <span className="text-gray-700">{p.name}</span>
                  <span className="text-gray-500">{p.distance}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-brand-navy mb-3 flex items-center gap-2">
              Localisation {!unlocked && <Lock size={15} className="text-gray-400" />}
            </h2>
            <div className="relative aspect-[16/8] rounded-xl overflow-hidden bg-gray-100">
              <MapPreview className={`h-full w-full ${!unlocked ? "blur-sm scale-105" : ""}`} />
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                  <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-navy shadow">
                    <Lock size={14} /> Localisation verrouillée
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h1 className="font-display text-xl font-bold text-brand-navy">{listing.title}</h1>
            <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">📍 {listing.city}</p>
            <p className="mt-3">
              <span className="font-display text-2xl font-bold text-brand-blue">
                {listing.price.toLocaleString("fr-FR")} FCFA
              </span>{" "}
              <span className="text-gray-500 text-sm">/ {listing.period}</span>
            </p>
            <span className="mt-1 inline-block rounded-full bg-brand-blue-light px-2.5 py-0.5 text-xs font-medium text-brand-blue">
              Caution incluse
            </span>

            <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
              {listing.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>

            <button
              onClick={handleUnlock}
              disabled={unlocked}
              className={`mt-5 w-full rounded-xl py-3 font-semibold text-center transition-colors ${
                unlocked
                  ? "bg-brand-green-light text-green-700 cursor-default"
                  : "bg-brand-blue text-white hover:bg-brand-blue-dark"
              }`}
            >
              {unlocked ? (
                "Propriétaire débloqué ✓"
              ) : (
                <>
                  Contacter le propriétaire
                  <span className="block text-xs font-normal opacity-90">Coût : {listing.unlockCost} crédits</span>
                </>
              )}
            </button>
            {!unlocked && isAuthenticated && credits < listing.unlockCost && (
              <p className="mt-2 text-center text-xs text-red-500">
                Crédits insuffisants —{" "}
                <Link to="/credits/achat" className="underline font-medium">
                  acheter des crédits
                </Link>
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="font-semibold text-brand-navy mb-3">Propriétaire</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {listing.owner.avatarImg ? (
                  <img
                    src={listing.owner.avatarImg}
                    alt={listing.owner.name}
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue font-bold">
                    {listing.owner.name.charAt(0)}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-brand-navy">{listing.owner.name}</p>
                  <p className="text-sm text-gray-500">
                    {unlocked ? listing.owner.phone : maskPhone(listing.owner.phone)}
                  </p>
                </div>
              </div>
              {unlocked ? (
                <a
                  href="https://wa.me/999999999"
                  target="_blank"
                  rel="noreferrer"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200"
                >
                  <WhatsAppIcon />
                </a>
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-300">
                  <Lock size={15} />
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-y-2 text-xs">
              <p className="flex items-center gap-1 text-green-700">
                <ShieldCheck size={13} /> Pièce d'identité vérifiée
              </p>
              <p className="text-gray-500">Membre depuis : {listing.owner.memberSince}</p>
              <p className="flex items-center gap-1 text-green-700">
                <ShieldCheck size={13} /> Téléphone vérifié
              </p>
              <p className="text-gray-500">Logements publiés : {listing.owner.listingsCount}</p>
              <p></p>
              <p className="text-gray-500">Temps de réponse : {listing.owner.responseTime}</p>
            </div>
          </div>

          {!unlocked && (
            <div className="rounded-2xl bg-brand-orange-light border border-brand-orange/20 p-5 text-center">
              <p className="font-display font-bold text-brand-navy">Débloquez l'annonce complète</p>
              <p className="mt-1 text-xs text-gray-500">
                Accédez au numéro du propriétaire et à la localisation exacte sur la carte.
              </p>
              <p className="mt-3 text-sm text-gray-600">
                Vous disposez actuellement de <span className="font-semibold">{credits}</span> crédits.
              </p>
              {isAuthenticated && credits < listing.unlockCost && (
                <Link to="/credits/achat" className="mt-1 inline-block text-sm font-semibold text-brand-orange-dark underline">
                  Acheter des crédits
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
