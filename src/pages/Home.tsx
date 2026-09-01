import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Lock,
  Headphones,
  Users,
  Search,
  MessageCircle,
  Home as HomeIcon,
  Smile,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserGroup,
  faSchool,
  faFileLines,
  faGraduationCap,
  faLocationDot,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import heroRoom from "../assets/images/hero-room.jpg";
import testimonialLinda from "../assets/images/testimonial-linda.jpg";
import { CameroonFlag } from "../components/CameroonFlag";
import { WatermarkedImage } from "../components/WatermarkedImage";
import { Autocomplete } from "../components/Autocomplete";
import { useListings } from "../context/ListingsContext";
import { useSiteContent } from "../context/SiteContentContext";

const statIcons: Record<string, typeof faUserGroup> = {
  users: faUserGroup,
  schools: faSchool,
  listings: faFileLines,
};

const whyUs = [
  {
    icon: ShieldCheck,
    title: "Logements vérifiés",
    text: "Des logements visités et vérifiés pour votre sécurité.",
  },
  {
    icon: Lock,
    title: "Paiements sécurisés",
    text: "Pas de frais caché ni paiement sécurisés, vous savez à quoi vous vous engagez.",
  },
  {
    icon: Headphones,
    title: "Support réactif",
    text: "On vous accompagne avant, pendant, et après votre installation.",
  },
  {
    icon: Users,
    title: "Communauté étudiante",
    text: "Rejoignez des milliers d'étudiants et trouvez votre futur colocataire.",
  },
];

const steps = [
  { icon: Search, title: "Recherchez", text: "Trouvez le logement qui vous correspond." },
  { icon: MessageCircle, title: "Contactez", text: "Engagez avec le propriétaire via notre messagerie WhatsApp sécurisée." },
  { icon: HomeIcon, title: "Visitez & Réservez", text: "Visitez et réservez votre logement en toute simplicité." },
  { icon: Smile, title: "Emménagez", text: "Installez-vous et profitez sereinement de vos études !" },
];

const testimonials = [
  {
    name: "Linda",
    school: "Université de Yaoundé I",
    photo: testimonialLinda,
    quote:
      "Ce que j'ai préféré avec StudHome c'est le fait d'avoir des photos de plusieurs logements. J'ai choisi celui qui correspondait vraiment à mes critères : proche de l'école, grande chambre, calme...",
  },
  {
    name: "Olivia",
    school: "Université de Douala",
    photo: null,
    quote:
      "Quand j'ai obtenu mon bac, j'étais un peu perdu pour trouver un logement sans mes parents. Avec StudHome, j'ai communiqué avec le bailleur simplement à distance, et j'ai pu m'installer sans stress avant la rentrée.",
  },
  {
    name: "Stéphane",
    school: "Université de Buea",
    photo: null,
    quote:
      "Je stressais à l'idée de tomber sur des démarcheurs, mais avec StudHome on a les contacts des bailleurs ou des concierges. Il y a une totale transparence sur les tarifs des loyers. Je recommande à 100 % !",
  },
];

const partners = ["Sanlam", "Deplaycs.ci", "SAIER", "HedTech", "CRED"];

export function Home() {
  const navigate = useNavigate();
  const [ville, setVille] = useState("");
  const [universite, setUniversite] = useState("");
  const { getPublicListings } = useListings();
  const publicListings = getPublicListings();
  const { cityGrid, featuredListingIds, siteStats, heroPhotos, universities: cameroonUniversities, cities } = useSiteContent();
  const filledCitySlots = cityGrid.filter((s) => s.city);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [heroIndex, setHeroIndex] = useState(0);

  const carouselListings = useMemo(() => {
    const byId = new Map(publicListings.map((l) => [l.id, l]));
    return featuredListingIds.map((id) => byId.get(id)).filter((l): l is (typeof publicListings)[number] => !!l);
  }, [publicListings, featuredListingIds]);
  const activeCarouselListing = carouselListings[carouselIndex % Math.max(carouselListings.length, 1)];

  const heroImages = heroPhotos.length > 0 ? heroPhotos.map((p) => p.url) : [heroRoom];
  const activeHeroImage = heroImages[heroIndex % heroImages.length];

  useEffect(() => {
    if (heroImages.length <= 1) return;
    const t = setInterval(() => setHeroIndex((i) => (i + 1) % heroImages.length), 15000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heroImages.length]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (ville) params.set("ville", ville);
    if (universite) params.set("universite", universite);
    navigate(`/logements?${params.toString()}`);
  };

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[440px] sm:min-h-[500px] overflow-hidden">
        <img
          key={activeHeroImage}
          src={activeHeroImage}
          alt="Chambre étudiante"
          className="absolute inset-0 h-full w-full object-cover animate-[heroFade_0.6s_ease-in-out]"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,white_0%,white_18%,rgba(255,255,255,0.55)_32%,rgba(255,255,255,0)_48%)]" />
        <CameroonFlag className="absolute top-6 right-6 lg:top-8 lg:right-10 h-8 w-12 rounded-md shadow-lg overflow-hidden" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-10 pt-16 pb-16 sm:pt-20">
          <div className="max-w-lg">
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight text-brand-navy">
              Le logement étudiant, simple, sûr et abordable
            </h1>
            <p className="mt-4 text-gray-500 max-w-md">
              Trouvez votre chez-vous en toute confiance parmi des logements vérifiés partout en Afrique.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/logements"
                className="rounded-full bg-brand-orange px-6 py-3 font-semibold text-white hover:bg-brand-orange-dark transition-colors"
              >
                Trouver un logement →
              </Link>
              <Link
                to="/a-propos"
                className="rounded-full border border-gray-300 px-6 py-3 font-semibold text-brand-navy hover:border-gray-400 transition-colors"
              >
                Comment ça marche ?
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto max-w-3xl px-4 -mt-10 sm:-mt-12">
        <div className="rounded-2xl bg-white shadow-xl border border-gray-100 p-6">
          <h3 className="font-semibold text-brand-navy mb-4">Où souhaitez-vous étudier ?</h3>
          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Ville</label>
              <Autocomplete
                value={ville}
                onChange={setVille}
                options={cities}
                placeholder="Toutes les villes"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Université / Ecole</label>
              <Autocomplete
                value={universite}
                onChange={setUniversite}
                options={cameroonUniversities}
                placeholder="Université / Ecole"
                className="w-full rounded-lg border border-gray-200 px-3 py-2.5 text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
              />
            </div>
            <button
              onClick={handleSearch}
              className="flex items-center justify-center gap-2 rounded-lg bg-brand-orange px-5 py-2.5 font-semibold text-white hover:bg-brand-orange-dark transition-colors"
            >
              <Search size={16} /> Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <section className="mt-12 sm:mt-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="rounded-2xl bg-brand-blue-light px-6 py-5 flex flex-wrap justify-center gap-8 sm:gap-16 text-center">
            {siteStats.map((stat) => (
              <Stat key={stat.key} icon={statIcons[stat.key] ?? faUserGroup} value={stat.value} label={stat.label} />
            ))}
          </div>
        </div>
      </section>

      {/* Cities */}
      <section className="mx-auto max-w-5xl px-6 mt-16">
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
          {filledCitySlots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => navigate(`/logements?ville=${encodeURIComponent(slot.city)}`)}
              className="relative aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-brand-blue-light to-gray-100 flex items-end p-2 hover:opacity-90 transition-opacity"
            >
              {slot.photoUrl ? (
                <img src={slot.photoUrl} alt={slot.city} className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <FontAwesomeIcon
                  icon={faBuilding}
                  className="absolute inset-0 m-auto h-7 w-7 text-brand-blue/30"
                />
              )}
              <span className="relative w-full rounded-md bg-brand-orange py-1 text-center text-xs font-semibold text-white">
                {slot.city}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-6 flex justify-center">
          <Link
            to="/logements"
            className="rounded-full bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
          >
            Voir toutes les villes
          </Link>
        </div>
      </section>

      {/* Why choose us */}
      <section className="mx-auto max-w-6xl px-6 mt-20">
        <div className="rounded-3xl bg-brand-blue-light px-6 sm:px-10 py-10 grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center overflow-hidden">
          <div>
            <h2 className="font-display text-2xl font-bold text-brand-navy mb-6">Pourquoi choisir StudHome ?</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {whyUs.map(({ icon: Icon, title, text }) => (
                <div key={title}>
                  <Icon className="text-brand-blue mb-2" size={26} />
                  <h3 className="font-semibold text-brand-navy">{title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{text}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="h-56 w-56 rounded-full bg-white/60 flex items-center justify-center">
              <FontAwesomeIcon icon={faGraduationCap} className="h-24 w-24 text-brand-blue" />
            </div>
          </div>
        </div>
      </section>

      {/* Discover carousel */}
      <section className="mx-auto max-w-3xl px-6 mt-20 text-center">
        <h2 className="font-display text-2xl font-bold text-brand-navy mb-6">
          Découvrez votre nouveau logement avec StudHome
        </h2>
        <div className="relative rounded-2xl overflow-hidden aspect-[16/9] bg-gray-100">
          {activeCarouselListing ? (
            <Link to={`/logements/${activeCarouselListing.id}`}>
              {activeCarouselListing.image ? (
                <WatermarkedImage
                  src={activeCarouselListing.image}
                  alt={activeCarouselListing.title}
                  className="h-full w-full"
                  imgClassName="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-gray-300">
                  <FontAwesomeIcon icon={faBuilding} className="h-12 w-12" />
                </div>
              )}
            </Link>
          ) : (
            <div className="h-full w-full flex flex-col items-center justify-center gap-2 text-gray-400">
              <FontAwesomeIcon icon={faBuilding} className="h-10 w-10" />
              <p className="text-sm">Aucun logement mis en avant pour l'instant</p>
            </div>
          )}
          {activeCarouselListing && (
            <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between bg-brand-blue/90 px-4 py-2.5">
              <span className="flex items-center gap-1.5 text-sm font-medium text-white">
                <FontAwesomeIcon icon={faLocationDot} className="h-3.5 w-3.5" /> {activeCarouselListing.city}
              </span>
              {carouselListings.length > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCarouselIndex((i) => (i - 1 + carouselListings.length) % carouselListings.length)
                    }
                    className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setCarouselIndex((i) => (i + 1) % carouselListings.length)}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <Link
          to="/logements"
          className="mt-6 inline-block rounded-full bg-brand-blue px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
        >
          Voir les logements
        </Link>
      </section>

      {/* Parrainage banner */}
      <section className="mx-auto max-w-6xl px-6 mt-20">
        <div className="relative overflow-hidden rounded-3xl bg-brand-orange px-8 sm:px-12 py-10 text-white">
          <div className="absolute -right-4 top-4 text-6xl opacity-30">$</div>
          <div className="absolute right-16 bottom-4 text-4xl opacity-30">$</div>
          <div className="absolute right-32 top-10 text-3xl opacity-20">$</div>
          <h2 className="font-display text-2xl font-bold max-w-md">Parraine un ami et gagne des crédits !</h2>
          <p className="mt-2 max-w-md text-white/90 text-sm">
            Vous recevrez des crédits, votre ami aussi. Plus vous parrainez, plus vous accumulez.
          </p>
          <Link
            to="/parrainage"
            className="mt-5 inline-block rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-brand-orange-dark hover:bg-gray-50 transition-colors"
          >
            Découvrez le parrainage
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-6 mt-20">
        <h2 className="font-display text-2xl font-bold text-brand-navy text-center mb-10">Comment ça marche ?</h2>
        <div className="grid sm:grid-cols-4 gap-8">
          {steps.map(({ icon: Icon, title, text }, i) => (
            <div key={title} className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-brand-orange-light text-brand-orange-dark relative">
                <Icon size={24} />
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-orange text-[10px] font-bold text-white">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-semibold text-brand-navy">{title}</h3>
              <p className="text-sm text-gray-500 mt-1">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust + testimonials */}
      <section className="mx-auto max-w-6xl px-6 mt-20 mb-20">
        <div className="rounded-3xl bg-brand-blue-light px-6 sm:px-10 py-10 grid lg:grid-cols-[1fr_1.6fr] gap-10">
          <div>
            <h3 className="font-semibold text-brand-navy mb-1">Ils nous font confiance</h3>
            <p className="text-sm text-gray-500 mb-6">
              Reconnus par les plus grands Universitaires et les entreprises innovantes.
            </p>
            <div className="flex flex-wrap gap-3">
              {partners.map((p) => (
                <span
                  key={p}
                  className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-gray-500 shadow-sm"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-brand-navy">Ce que disent les étudiants</h3>
              <button className="text-sm font-medium text-brand-navy rounded-full border border-gray-300 px-4 py-1.5 bg-white">
                Voir tous les avis
              </button>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {testimonials.map((t) => (
                <div key={t.name} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    {t.photo ? (
                      <img src={t.photo} alt={t.name} className="h-9 w-9 rounded-full object-cover" />
                    ) : (
                      <span className="h-9 w-9 rounded-full bg-gray-200" />
                    )}
                    <div>
                      <p className="text-sm font-semibold text-brand-navy leading-tight">{t.name}</p>
                      <p className="text-[11px] text-gray-500">{t.school}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-5">"{t.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: typeof faUserGroup; value: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <FontAwesomeIcon icon={icon} className="h-5 w-5 text-brand-blue" />
      <span className="text-left">
        <span className="block font-bold text-brand-navy leading-none">{value}</span>
        <span className="block text-xs text-gray-500">{label}</span>
      </span>
    </div>
  );
}
