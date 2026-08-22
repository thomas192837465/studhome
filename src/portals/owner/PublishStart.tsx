import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import loginBedroom from "../../assets/images/login-bedroom.jpg";

const checklist = [
  "Annonce gratuite",
  "Étudiants ciblés",
  "Contact direct via WhatsApp",
  "Logements vérifiés par notre équipe",
];

export function PublishStart() {
  const navigate = useNavigate();

  return (
    <div className="p-6 sm:p-10 max-w-3xl mx-auto">
      <div className="rounded-3xl border border-gray-100 p-8 sm:p-10 grid sm:grid-cols-2 gap-8 items-center shadow-sm">
        <div>
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-brand-navy">
            Publiez votre logement étudiant
          </h1>
          <p className="mt-3 text-sm text-gray-500">
            Trouvez rapidement des étudiants sérieux partout au Cameroun.
          </p>
          <ul className="mt-5 space-y-2">
            {checklist.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                <ShieldCheck size={16} className="text-brand-green shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <button
            onClick={() => navigate("/proprietaire/publier/etapes")}
            className="mt-7 flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
          >
            Commencer →
          </button>
        </div>
        <div className="rounded-2xl overflow-hidden aspect-[3/4]">
          <img src={loginBedroom} alt="Logement" className="h-full w-full object-cover" />
        </div>
      </div>
      <p className="mt-5 text-center text-xs text-gray-400">
        Toutes les annonces sont vérifiées par notre équipe avant publication afin de garantir des
        informations fiables. Délai moyen de validation : moins de 24 heures.
      </p>
    </div>
  );
}
