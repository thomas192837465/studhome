import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, Heart, Lock, ShieldCheck, CheckCircle2, X, GraduationCap, Play } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faCircleCheck, faStar as faStarSolid, faFlag } from "@fortawesome/free-solid-svg-icons";
import { useListings } from "../context/ListingsContext";
import { useApp } from "../context/AppContext";
import { useReviews } from "../context/ReviewsContext";
import { useSignalements } from "../context/SignalementsContext";
import { MapPreview } from "../components/MapPreview";
import { Avatar } from "../components/Avatar";
import { StarRating } from "../components/StarRating";
import { WatermarkedImage } from "../components/WatermarkedImage";

const reportReasons = [
  "Annonce frauduleuse",
  "Logement introuvable ou inexistant",
  "Propriétaire injoignable",
  "Contenu inapproprié",
  "Autre",
];

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
  // Masks digit characters in place regardless of formatting (spaces,
  // dashes, or none at all) — a plain split(" ") silently failed to mask
  // anything when the owner typed their number without spaces.
  const digitPositions: number[] = [];
  for (let i = 0; i < phone.length; i++) {
    if (/\d/.test(phone[i])) digitPositions.push(i);
  }
  const total = digitPositions.length;
  if (total <= 5) return phone;
  const visibleStart = 3;
  const visibleEnd = 2;
  const chars = phone.split("");
  digitPositions.forEach((charIndex, digitPos) => {
    const isVisible = digitPos < visibleStart || digitPos >= total - visibleEnd;
    if (!isVisible) chars[charIndex] = "•";
  });
  return chars.join("");
}

export function AccommodationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getListing, getListingsByOwner, recordView, adjustFavorite, recordUnlock } = useListings();
  const listing = id ? getListing(id) : undefined;
  const { isAuthenticated, authLoading, user, isFavorite, toggleFavorite, isUnlocked, unlockListing, credits } = useApp();
  const { getPublishedForListing, submitReview } = useReviews();
  const { submitSignalement } = useSignalements();
  const [activeImg, setActiveImg] = useState(0);
  const [showToast, setShowToast] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState(reportReasons[0]);
  const [reportDetails, setReportDetails] = useState("");
  const [reportSubmitted, setReportSubmitted] = useState(false);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    setActiveImg(0);
  }, [id]);

  useEffect(() => {
    if (id) recordView(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/connexion?tab=inscription", { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate]);

  if (authLoading || !isAuthenticated) {
    return null;
  }

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
  const slides = [
    ...listing.gallery.map((src) => ({ type: "photo" as const, src })),
    ...(listing.videoUrl ? [{ type: "video" as const, src: listing.videoUrl }] : []),
  ];
  const thumbIndexes =
    slides.length <= 4
      ? slides.map((_, i) => i)
      : listing.videoUrl
        ? [0, 1, 2, slides.length - 1]
        : [0, 1, 2, 3];
  const ownerListingsCount = getListingsByOwner(listing.ownerId).filter((l) => l.status === "Publiée").length;
  const publishedReviews = getPublishedForListing(listing.id);
  const avgRating = publishedReviews.length
    ? publishedReviews.reduce((s, r) => s + r.rating, 0) / publishedReviews.length
    : 0;
  const authorName = `${user.firstName} ${user.lastName}`.trim();
  const alreadyReviewed = publishedReviews.some((r) => r.authorName === authorName);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (reviewRating === 0) {
      setReviewError("Choisissez une note avant d'envoyer votre avis.");
      return;
    }
    setReviewError("");
    await submitReview(listing.id, authorName || "Étudiant StudHome", reviewRating, reviewComment);
    setReviewSubmitted(true);
    setReviewRating(0);
    setReviewComment("");
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/connexion");
      return;
    }
    setReportError("");
    try {
      await submitSignalement(listing.id, listing.title, authorName || "Étudiant StudHome", reportReason, reportDetails);
      setReportSubmitted(true);
      setShowReportForm(false);
      setReportDetails("");
      setReportReason(reportReasons[0]);
    } catch {
      setReportError("Une erreur est survenue, réessayez.");
    }
  };

  const handleToggleFavorite = () => {
    if (!isAuthenticated) return;
    toggleFavorite(listing.id);
    adjustFavorite(listing.id, fav ? -1 : 1);
  };

  const handleUnlock = async () => {
    if (!isAuthenticated) {
      navigate("/connexion");
      return;
    }
    if (unlocked) return;
    const ok = await unlockListing(listing.id, listing.unlockCost, listing.city);
    if (ok) {
      recordUnlock(listing.id);
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
            {slides[activeImg] ? (
              slides[activeImg].type === "video" ? (
                <video src={slides[activeImg].src} controls className="h-full w-full object-cover bg-black" />
              ) : (
                <WatermarkedImage
                  src={slides[activeImg].src}
                  alt={listing.title}
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              )
            ) : (
              <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">Aucune photo</div>
            )}
            <span className="absolute top-3 left-3 flex items-center gap-1 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-green-700">
              <ShieldCheck size={13} /> Vérifié
            </span>
            <button
              onClick={handleToggleFavorite}
              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95"
            >
              <Heart size={17} className={fav ? "fill-brand-blue text-brand-blue" : "text-brand-blue"} />
            </button>
            {slides.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImg((i) => (i - 1 + slides.length) % slides.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => setActiveImg((i) => (i + 1) % slides.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90"
                >
                  <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>

          {slides.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3">
              {thumbIndexes.map((i) => {
                const s = slides[i];
                return (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    className={`relative aspect-square rounded-xl overflow-hidden bg-gray-100 ${
                      activeImg === i ? "ring-2 ring-brand-blue" : ""
                    }`}
                  >
                    {s.type === "video" ? (
                      <>
                        <video src={s.src} className="h-full w-full object-cover" muted />
                        <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <Play size={18} className="text-white fill-white" />
                        </span>
                      </>
                    ) : (
                      <WatermarkedImage src={s.src} alt="" className="h-full w-full" imgClassName="h-full w-full object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-brand-navy mb-2">Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
              {listing.description || "Aucune description fournie."}
            </p>
          </div>

          {listing.universities.length > 0 && (
            <div className="mt-8">
              <h2 className="font-display text-lg font-bold text-brand-navy mb-3">Universités à proximité</h2>
              <div className="rounded-xl border border-gray-100 overflow-hidden">
                {listing.universities.map((u, i) => (
                  <div
                    key={u}
                    className={`flex items-center gap-2 px-4 py-3 text-sm ${i % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                  >
                    <GraduationCap size={15} className="text-brand-blue shrink-0" />
                    <span className="text-gray-700">{u}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-brand-navy mb-3 flex items-center gap-2">
              Localisation {!unlocked && <Lock size={15} className="text-gray-400" />}
            </h2>
            <div className="relative aspect-[16/8] rounded-xl overflow-hidden bg-gray-100">
              <MapPreview
                className={`h-full w-full ${!unlocked ? "blur-sm scale-105" : ""}`}
                latitude={unlocked ? listing.latitude : undefined}
                longitude={unlocked ? listing.longitude : undefined}
              />
              {!unlocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                  <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand-navy shadow">
                    <Lock size={14} /> Localisation verrouillée
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-brand-navy mb-3">
              Avis des étudiants {publishedReviews.length > 0 && `(${publishedReviews.length})`}
            </h2>

            {publishedReviews.length === 0 ? (
              <p className="text-sm text-gray-400">Aucun avis pour l'instant sur ce logement.</p>
            ) : (
              <div className="space-y-4 mb-6">
                {publishedReviews.map((r) => (
                  <div key={r.id} className="rounded-xl border border-gray-100 p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-brand-navy text-sm">{r.authorName}</p>
                      <StarRating value={r.rating} size="h-3.5 w-3.5" />
                    </div>
                    {r.comment && <p className="mt-1.5 text-sm text-gray-600">{r.comment}</p>}
                    <p className="mt-1.5 text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {!isAuthenticated ? (
              <p className="text-sm text-gray-400">
                <Link to="/connexion" className="text-brand-blue font-semibold">
                  Connectez-vous
                </Link>{" "}
                pour laisser un avis.
              </p>
            ) : !unlocked ? (
              <p className="text-sm text-gray-400">
                Débloquez le contact du propriétaire pour pouvoir laisser un avis sur ce logement.
              </p>
            ) : alreadyReviewed || reviewSubmitted ? (
              <p className="flex items-center gap-1.5 text-sm text-brand-green font-medium">
                <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" /> Merci, votre avis a été envoyé et sera
                visible après validation par notre équipe.
              </p>
            ) : (
              <form onSubmit={handleSubmitReview} className="rounded-xl border border-gray-100 p-4">
                <p className="text-sm font-semibold text-brand-navy mb-2">Laisser un avis</p>
                <StarRating value={reviewRating} onChange={setReviewRating} size="h-5 w-5" />
                <textarea
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Partagez votre expérience avec ce logement..."
                  rows={3}
                  className="mt-3 w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
                {reviewError && <p className="mt-1.5 text-xs text-red-500">{reviewError}</p>}
                <button
                  type="submit"
                  className="mt-3 rounded-xl bg-brand-blue px-5 py-2 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
                >
                  Envoyer l'avis
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h1 className="font-display text-xl font-bold text-brand-navy">{listing.title}</h1>
            {publishedReviews.length > 0 && (
              <p className="mt-1 flex items-center gap-1.5 text-sm">
                <FontAwesomeIcon icon={faStarSolid} className="h-3.5 w-3.5 text-brand-orange" />
                <span className="font-semibold text-brand-navy">{avgRating.toFixed(1)}</span>
                <span className="text-gray-400">
                  ({publishedReviews.length} avis)
                </span>
              </p>
            )}
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
              <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" /> {listing.city}, {listing.quartier}
            </p>
            <p className="mt-1.5 flex items-center gap-1.5 text-sm">
              {unlocked ? (
                listing.latitude != null && listing.longitude != null ? (
                  <a
                    href={`https://www.openstreetmap.org/?mlat=${listing.latitude}&mlon=${listing.longitude}#map=17/${listing.latitude}/${listing.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-brand-blue font-medium underline decoration-dotted underline-offset-2"
                  >
                    {listing.address}
                  </a>
                ) : (
                  <span className="text-brand-navy font-medium">{listing.address}</span>
                )
              ) : (
                <>
                  <Lock size={12} className="text-gray-400" />
                  <span className="text-gray-400">Adresse exacte visible après déblocage du contact</span>
                </>
              )}
            </p>
            <p className="mt-3">
              <span className="font-display text-2xl font-bold text-brand-blue">
                {listing.price.toLocaleString("fr-FR")} FCFA
              </span>{" "}
              <span className="text-gray-500 text-sm">/ {listing.period}</span>
            </p>

            {listing.equipements.length > 0 && (
              <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
                {listing.equipements.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
            )}

            <p className="mt-3 text-sm text-gray-500">
              {listing.cautionType === "incluse"
                ? "Caution incluse dans le loyer annuel"
                : listing.cautionType === "aucune"
                  ? "Aucune caution demandée"
                  : `Caution : ${listing.cautionMonths || "1 mois"} en plus du loyer annuel`}
            </p>

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
                <>
                  Propriétaire débloqué <FontAwesomeIcon icon={faCircleCheck} className="h-3.5 w-3.5" />
                </>
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
                <Avatar src={listing.ownerAvatarImg} name={listing.ownerName} className="h-11 w-11" />
                <div>
                  <p className="font-semibold text-brand-navy">{listing.ownerName}</p>
                  <p className="text-sm text-gray-500">
                    {unlocked ? listing.ownerPhone : maskPhone(listing.ownerPhone)}
                  </p>
                </div>
              </div>
              {unlocked ? (
                <a
                  href={`https://wa.me/${listing.ownerPhone.replace(/\D/g, "")}`}
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
              <p className="text-gray-500">
                Membre depuis : {new Date(listing.ownerMemberSince).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
              </p>
              <p className="text-gray-500">Logements publiés : {ownerListingsCount}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 p-5 shadow-sm text-center">
            {reportSubmitted ? (
              <p className="flex items-center justify-center gap-1.5 text-sm text-brand-green font-medium">
                <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" /> Signalement envoyé, notre équipe va l'examiner.
              </p>
            ) : showReportForm ? (
              <form onSubmit={handleSubmitReport} className="text-left">
                <p className="text-sm font-semibold text-brand-navy mb-2">Signaler ce logement</p>
                <select
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none mb-2"
                >
                  {reportReasons.map((r) => (
                    <option key={r}>{r}</option>
                  ))}
                </select>
                <textarea
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  placeholder="Détails (optionnel)"
                  rows={2}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
                {reportError && <p className="mt-1.5 text-xs text-red-500">{reportError}</p>}
                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="submit"
                    className="rounded-lg bg-red-500 px-4 py-2 text-xs font-semibold text-white hover:bg-red-600"
                  >
                    Envoyer le signalement
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowReportForm(false)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => (isAuthenticated ? setShowReportForm(true) : navigate("/connexion"))}
                className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500"
              >
                <FontAwesomeIcon icon={faFlag} className="h-3 w-3" /> Signaler ce logement
              </button>
            )}
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
