import { Link, useLocation, useParams } from "react-router-dom";
import { CheckCircle2, Mail, MessageCircle } from "lucide-react";
import { useBasePath } from "./adminUi";
import { useListings } from "../../context/ListingsContext";

export function AnnoncePublieeConfirmation() {
  const { id } = useParams();
  const base = useBasePath(useLocation().pathname);
  const { getListing } = useListings();
  const listing = id ? getListing(id) : undefined;

  return (
    <div className="p-6 sm:p-10 max-w-md mx-auto text-center">
      <div className="rounded-3xl border border-gray-100 p-10 shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
          <CheckCircle2 size={30} />
        </div>
        <h1 className="font-display text-xl font-bold text-brand-navy">Annonce publiée avec succès !</h1>
        <p className="mt-2 text-sm text-gray-500">
          L'annonce{listing ? ` « ${listing.title} »` : ""} est maintenant visible par tous les étudiants.
        </p>

        <div className="mt-6 rounded-xl bg-gray-50 p-5 text-left">
          <p className="font-semibold text-brand-navy text-sm mb-3">Ce que le propriétaire va recevoir</p>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <MessageCircle size={15} className="text-brand-green shrink-0" /> Notification par SMS
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <Mail size={15} className="text-brand-green shrink-0" /> Email de confirmation
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <CheckCircle2 size={15} className="text-brand-green shrink-0" /> Son annonce sera visible immédiatement
            </li>
          </ul>
        </div>

        <Link
          to={`${base}/annonces`}
          className="mt-6 block rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
        >
          Retour à la liste des annonces
        </Link>
      </div>
    </div>
  );
}
