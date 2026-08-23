import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faXmark, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useReviews } from "../../context/ReviewsContext";
import { useListings } from "../../context/ListingsContext";
import { StarRating } from "../../components/StarRating";

const tabs = ["Tous les statuts", "En attente", "Publié", "Rejeté"] as const;

function statusClass(status: string) {
  switch (status) {
    case "Publié":
      return "bg-brand-green-light text-green-700";
    case "En attente":
      return "bg-orange-50 text-orange-600";
    case "Rejeté":
      return "bg-red-50 text-red-600";
    default:
      return "bg-gray-100 text-gray-600";
  }
}

export function Avis() {
  const { reviews, publishReview, rejectReview, deleteReview } = useReviews();
  const { getListing } = useListings();
  const [filter, setFilter] = useState<(typeof tabs)[number]>("Tous les statuts");
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const filtered = reviews.filter((r) => filter === "Tous les statuts" || r.status === filter);

  const handleReject = async (id: string) => {
    await rejectReview(id, reason || "Contenu non conforme");
    setRejectingId(null);
    setReason("");
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Avis</h1>
          <p className="mt-1 text-sm text-gray-500">Modérez les avis laissés par les étudiants sur les annonces.</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none"
        >
          {tabs.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 py-16 text-center text-gray-400">
          Aucun avis pour l'instant.
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => {
            const listing = getListing(r.listingId);
            return (
              <div key={r.id} className="rounded-2xl border border-gray-100 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-brand-navy text-sm">
                      {r.authorName}{" "}
                      <span className="font-normal text-gray-400">
                        — {listing ? listing.title : "Annonce supprimée"}
                      </span>
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <StarRating value={r.rating} size="h-3.5 w-3.5" />
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClass(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                    {r.comment && <p className="mt-2 text-sm text-gray-600">{r.comment}</p>}
                    {r.status === "Rejeté" && r.moderationReason && (
                      <p className="mt-1.5 text-xs text-red-500">Raison : {r.moderationReason}</p>
                    )}
                    <p className="mt-1.5 text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {r.status !== "Publié" && (
                      <button
                        onClick={() => publishReview(r.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-brand-green px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                      >
                        <FontAwesomeIcon icon={faCheck} className="h-3 w-3" /> Publier
                      </button>
                    )}
                    {r.status !== "Rejeté" && (
                      <button
                        onClick={() => setRejectingId(rejectingId === r.id ? null : r.id)}
                        className="flex items-center gap-1.5 rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200"
                      >
                        <FontAwesomeIcon icon={faXmark} className="h-3 w-3" /> Rejeter
                      </button>
                    )}
                    <button
                      onClick={() => deleteReview(r.id)}
                      className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100"
                    >
                      <FontAwesomeIcon icon={faTrash} className="h-3 w-3" /> Supprimer
                    </button>
                  </div>
                </div>

                {rejectingId === r.id && (
                  <div className="mt-3 flex gap-2">
                    <input
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Raison du rejet (optionnel)"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none"
                    />
                    <button
                      onClick={() => handleReject(r.id)}
                      className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                    >
                      Confirmer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
