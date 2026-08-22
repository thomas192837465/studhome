import { useNavigate } from "react-router-dom";
import { ClipboardCheck, CheckCircle2 } from "lucide-react";
import { useOwner } from "../../context/OwnerContext";

const nextSteps = [
  "Nous vérifions vos informations et vos photos",
  "Nous vous contactons en cas de besoin",
  "Votre annonce sera publiée une fois validée",
  "Vous recevrez une notification par email et SMS",
];

export function PublishSuccess() {
  const navigate = useNavigate();
  const { resetDraft } = useOwner();

  return (
    <div className="p-6 sm:p-10 max-w-lg mx-auto text-center">
      <div className="rounded-3xl border border-gray-100 p-10 shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
          <ClipboardCheck size={30} />
        </div>
        <h1 className="font-display text-xl font-bold text-brand-navy">Votre annonce a bien été soumise !</h1>
        <p className="mt-2 text-sm text-gray-500">Notre équipe vérifie actuellement les informations fournies.</p>

        <div className="mt-5 rounded-xl bg-brand-blue-light px-4 py-3 text-sm font-medium text-brand-navy">
          Votre logement sera publié sous 24 heures après validation.
        </div>

        <div className="mt-5 rounded-xl bg-gray-50 p-5 text-left">
          <p className="font-semibold text-brand-navy text-sm mb-3">Que se passe-t-il ensuite ?</p>
          <ul className="space-y-2">
            {nextSteps.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle2 size={15} className="text-brand-green mt-0.5 shrink-0" /> {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-6 flex flex-col gap-3">
          <button
            onClick={() => navigate("/proprietaire/annonces")}
            className="rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
          >
            Voir mes annonces
          </button>
          <button
            onClick={() => {
              resetDraft();
              navigate("/proprietaire/publier");
            }}
            className="rounded-xl border border-gray-200 py-3 font-semibold text-brand-navy hover:bg-gray-50 transition-colors"
          >
            Ajouter un autre logement
          </button>
        </div>
      </div>
    </div>
  );
}
