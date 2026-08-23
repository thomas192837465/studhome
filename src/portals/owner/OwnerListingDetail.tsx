import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Eye, Heart, Users, MapPin, GraduationCap } from "lucide-react";
import { useListings } from "../../context/ListingsContext";
import { listingStatusClass } from "../../data/listingStatus";
import { Sparkline } from "../../components/Sparkline";

export function OwnerListingDetail() {
  const { id } = useParams();
  const { getListing } = useListings();
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

  const hasStats = listing.dailyStats.length > 0;
  const viewsSeries = hasStats ? listing.dailyStats.map((d) => d.views) : [0];

  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <Link to="/proprietaire/annonces" className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy mb-5">
        <ArrowLeft size={16} /> Retour aux annonces
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-1">
        <h1 className="font-display text-xl font-bold text-brand-navy">{listing.title}</h1>
        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${listingStatusClass(listing.status)}`}>
          {listing.status}
        </span>
      </div>
      <p className="text-xl font-bold text-brand-blue mt-1">
        {listing.price.toLocaleString("fr-FR")} FCFA <span className="text-sm font-normal text-gray-500">/ {listing.period}</span>
      </p>
      <p className="mt-2 flex items-center gap-1.5 text-sm text-gray-500">
        <MapPin size={14} /> {listing.city}, {listing.quartier}
      </p>
      {listing.address && <p className="mt-1 text-sm text-gray-500">{listing.address}</p>}
      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
        <GraduationCap size={14} /> {listing.universities.join(", ") || "—"}
      </p>

      {listing.status === "Modifications demandées" && listing.modificationMessage && (
        <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-800">
          <p className="font-semibold mb-1">Message de l'équipe StudHome :</p>
          <p className="whitespace-pre-line">{listing.modificationMessage}</p>
          <Link
            to={`/proprietaire/annonces/${listing.id}/modifier`}
            className="mt-3 inline-block rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 transition-colors"
          >
            Modifier l'annonce
          </Link>
        </div>
      )}

      <div className="mt-6 grid lg:grid-cols-[1.4fr_1fr] gap-8">
        <div>
          {listing.gallery.length > 0 ? (
            <>
              <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100">
                <img src={listing.gallery[0]} alt={listing.title} className="h-full w-full object-cover" />
              </div>
              {listing.gallery.length > 1 && (
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {listing.gallery.slice(1, 5).map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-[4/3] rounded-2xl bg-gray-100 flex items-center justify-center text-sm text-gray-400">
              Aucune photo
            </div>
          )}
        </div>

        <div className="space-y-3">
          <StatRow icon={Eye} value={listing.views} label="Vues totales" />
          <StatRow icon={Heart} value={listing.favoritesCount} label="Étudiants ont ajouté en favori" />
          <StatRow icon={Users} value={listing.unlocksCount} label="Étudiants ont débloqué vos coordonnées" />
          {listing.status === "Publiée" && (
            <Link
              to={`/logements/${listing.id}`}
              className="block w-full rounded-xl bg-brand-blue py-2.5 text-center font-semibold text-white hover:bg-brand-blue-dark transition-colors"
            >
              Voir mon annonce
            </Link>
          )}
          <Link
            to={`/proprietaire/annonces/${listing.id}/modifier`}
            className="block w-full rounded-xl border border-gray-200 py-2.5 text-center font-semibold text-brand-navy hover:bg-gray-50 transition-colors"
          >
            Modifier l'annonce
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="font-semibold text-brand-navy mb-1">Performance</h2>
        <p className="text-xs text-gray-400 mb-4">
          {hasStats
            ? `Dernière mise à jour : ${new Date(listing.lastStatsUpdate).toLocaleString("fr-FR")}`
            : "Pas encore de données — les statistiques apparaissent dès la première visite de votre annonce."}
        </p>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <PerfMetric label="Vues" value={listing.views} />
          <PerfMetric label="Favoris" value={listing.favoritesCount} />
          <PerfMetric label="Contacts débloqués" value={listing.unlocksCount} />
        </div>
        <div className="rounded-2xl border border-gray-100 p-4">
          <Sparkline data={viewsSeries} height={100} className="w-full h-24" />
          {hasStats && (
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>{new Date(listing.dailyStats[0].date).toLocaleDateString("fr-FR")}</span>
              <span>{new Date(listing.dailyStats[listing.dailyStats.length - 1].date).toLocaleDateString("fr-FR")}</span>
            </div>
          )}
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

function PerfMetric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-display text-xl font-bold text-brand-navy">{value}</p>
    </div>
  );
}
