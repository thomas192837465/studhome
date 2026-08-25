import { useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bold, Italic, List, ListOrdered, Info } from "lucide-react";
import { useListings } from "../../context/ListingsContext";
import { useBasePath } from "./adminUi";
import { listingStatusClass } from "../../data/listingStatus";

const defaultMessage = `Bonjour,

Merci pour votre annonce.

Avant publication, merci de bien vouloir :
• Ajouter une photo de la salle d'eau
• Préciser le montant du loyer (charges incluses ou non)
• Vérifier votre numéro WhatsApp (injoignable)

Merci pour votre compréhension.`;

export function DemandeModifications() {
  const { id } = useParams();
  const base = useBasePath(useLocation().pathname);
  const navigate = useNavigate();
  const { getListing, requestModification } = useListings();
  const listing = id ? getListing(id) : undefined;
  const [message, setMessage] = useState(defaultMessage);
  const [reason, setReason] = useState("Informations incomplètes");

  if (!listing) return null;

  const handleSend = async () => {
    await requestModification(listing.id, message, reason);
    navigate(`${base}/annonces`);
  };

  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <Link to={`${base}/annonces/${listing.id}`} className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy mb-5">
        <ArrowLeft size={16} /> Retour à l'annonce
      </Link>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6">
        <div>
          <h1 className="font-display text-xl font-bold text-brand-navy">Demande de modifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Expliquez clairement au propriétaire ce qu'il doit modifier pour que son annonce soit publiée.
          </p>

          <label className="block mt-5">
            <span className="mb-1.5 block text-sm font-medium text-brand-navy">Message au propriétaire *</span>
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="flex items-center gap-3 border-b border-gray-100 px-3 py-2 text-gray-400">
                <Bold size={15} />
                <Italic size={15} />
                <List size={15} />
                <ListOrdered size={15} />
              </div>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={10}
                className="w-full px-4 py-3 text-sm focus:outline-none resize-none"
              />
            </div>
          </label>
          <p className="mt-2 flex items-center gap-1.5 text-xs text-gray-400">
            <Info size={13} /> Le propriétaire recevra une notification par email et SMS.
          </p>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => navigate(`${base}/annonces/${listing.id}`)}
              className="rounded-xl border border-gray-200 px-6 py-2.5 font-semibold text-brand-navy hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSend}
              className="rounded-xl bg-brand-blue px-6 py-2.5 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
            >
              Envoyer la demande
            </button>
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-brand-navy text-sm mb-3">Récapitulatif de l'annonce</h3>
          <div className="rounded-xl border border-gray-100 p-4 flex items-center gap-3">
            {listing.gallery[0] ? (
              <img src={listing.gallery[0]} alt="" className="h-14 w-14 rounded-lg object-cover shrink-0" />
            ) : (
              <span className="h-14 w-14 rounded-lg bg-gray-100 shrink-0" />
            )}
            <div className="text-sm">
              <p className="font-semibold text-brand-navy">{listing.title}</p>
              <p className="text-gray-500">{listing.price.toLocaleString("fr-FR")} FCFA / {listing.period}</p>
              <p className="text-xs text-gray-400 mt-1">
                Soumise le : {new Date(listing.submittedDate).toLocaleDateString("fr-FR")}
              </p>
              <p className="text-xs text-gray-400">Par : {listing.ownerName}</p>
            </div>
          </div>

          <h3 className="font-semibold text-brand-navy text-sm mt-5 mb-2">Statut actuel</h3>
          <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${listingStatusClass(listing.status)}`}>
            {listing.status}
          </span>

          <h3 className="font-semibold text-brand-navy text-sm mt-5 mb-2">Raison</h3>
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none"
          >
            <option>Informations incomplètes</option>
            <option>Photos insuffisantes</option>
            <option>Prix incohérent</option>
            <option>Numéro invalide</option>
          </select>
        </div>
      </div>
    </div>
  );
}
