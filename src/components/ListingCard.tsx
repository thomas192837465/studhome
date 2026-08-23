import { Heart } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import type { Listing } from "../data/listingTypes";
import { useApp } from "../context/AppContext";
import { useListings } from "../context/ListingsContext";

export function ListingCard({ listing }: { listing: Listing }) {
  const { isFavorite, toggleFavorite, isAuthenticated } = useApp();
  const { adjustFavorite } = useListings();
  const fav = isFavorite(listing.id);

  return (
    <div className="group rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <Link to={`/logements/${listing.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-100">
        {listing.image ? (
          <img
            src={listing.image}
            alt={listing.title}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-sm text-gray-400">Aucune photo</div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            if (isAuthenticated) {
              toggleFavorite(listing.id);
              adjustFavorite(listing.id, fav ? -1 : 1);
            }
          }}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm hover:scale-105 transition-transform"
        >
          <Heart
            size={17}
            className={fav ? "fill-brand-blue text-brand-blue" : "text-brand-blue"}
          />
        </button>
      </Link>
      <Link to={`/logements/${listing.id}`} className="block px-4 py-4">
        <h3 className="font-semibold text-brand-navy">{listing.title}</h3>
        <p className="mt-1 font-bold text-brand-navy">
          {listing.price.toLocaleString("fr-FR")} FCFA <span className="font-normal text-gray-500 text-sm">/ {listing.period}</span>
        </p>
        <p className="mt-1.5 text-sm text-gray-500">{listing.city}</p>
        {listing.universities.length > 0 && (
          <div className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-brand-green-light px-2.5 py-1 text-xs font-medium text-green-700">
            <FontAwesomeIcon icon={faGraduationCap} className="h-3 w-3" /> {listing.universities[0]}
          </div>
        )}
        <p className="mt-2.5 text-sm text-gray-500">{listing.type}</p>
      </Link>
    </div>
  );
}
