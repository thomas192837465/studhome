import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Heart, Users, MapPin, GraduationCap } from "lucide-react";
import { useOwner } from "../../context/OwnerContext";
import { statusBadgeClass } from "./ownerUi";
import { Sparkline } from "../../components/Sparkline";

const months = ["5 mai", "12 mai", "19 mai", "26 mai", "2 juin"];

export function OwnerListingDetail() {
  const { id } = useParams();
  const { getListing } = useOwner();
  const listing = id ? getListing(id) : undefined;

  if (!listing) {
    return (
      <div className="p-10 text-center text-gray-500">
        Annonce introuvable.{" "}
        <Link to="/proprietaire/annonces" className="text-brand-blue font-semibold">
          Retour aux annonces
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <Link to="/proprietaire/annonces" className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy mb-5">
        <ArrowLeft size={16} /> Retour aux annonces
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-1">
        <h1 className="font-display text-xl font-bold text-brand-navy">{listing.title}</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(listing.status)}`}>
          {listing.status}
        </span>
      </div>
      <p className="text-xl font-bold text-brand-blue mt-1">
        {listing.price.toLocaleString("fr-FR")} FCFA <span className="text-sm font-normal text-gray-500">/ mois</span>
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
        <MapPin size={14} /> {listing.city}, {listing.quartier}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
        <GraduationCap size={14} /> {listing.universities.join(", ")}
      </p>

      <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div>
          <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
            <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
          </div>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {[listing.image, listing.image, listing.image].map((img, i) => (
              <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img src={img} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
            <div className="aspect-square rounded-lg bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-500">
              +6
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <StatRow icon={Eye} value={listing.views} label="Vues totales" />
          <StatRow icon={Heart} value={listing.favorites} label="Étudiants ont ajouté en favori" />
          <StatRow icon={Users} value={listing.unlocks} label="Étudiants ont débloqué vos coordonnées" />
          <button className="w-full rounded-xl bg-brand-blue py-2.5 font-semibold text-white hover:bg-brand-blue-dark transition-colors">
            Voir mon annonce
          </button>
          <button className="w-full rounded-xl border border-gray-200 py-2.5 font-semibold text-brand-navy hover:bg-gray-50 transition-colors">
            Modifier l'annonce
          </button>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-semibold text-brand-navy mb-4">Performance sur les 30 derniers jours</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <PerfMetric label="Vues" value={listing.views} change="+21%" />
          <PerfMetric label="Favoris" value={listing.favorites} change="+9%" />
          <PerfMetric label="Contacts débloqués" value={listing.unlocks} change="+25%" />
        </div>
        <div className="rounded-2xl border border-gray-100 p-4">
          <Sparkline data={listing.performance} height={100} className="w-full h-24" />
          <div className="mt-2 flex justify-between text-xs text-gray-400">
            {months.map((m) => (
              <span key={m}>{m}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatRow({ icon: Icon, value, label }: { icon: typeof Eye; value: number; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-gray-100 px-4 py-3">
      <Icon size={18} className="text-brand-blue shrink-0" />
      <div>
        <p className="font-display font-bold text-brand-navy leading-none">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

function PerfMetric({ label, value, change }: { label: string; value: number; change: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="font-display text-xl font-bold text-brand-navy">{value}</p>
        <span className="text-xs font-medium text-brand-green">{change}</span>
      </div>
    </div>
  );
}
