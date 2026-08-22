import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, Users, Clock, PlayCircle, UserPlus2, X } from "lucide-react";
import { OwnerPublicHeader } from "./OwnerPublicHeader";
import { Footer } from "../../components/Footer";
import { useOwner } from "../../context/OwnerContext";
import loginBedroom from "../../assets/images/login-bedroom.jpg";

const checklist = [
  "Publication 100% gratuite",
  "Étudiants ciblés et sérieux",
  "Contact direct via WhatsApp",
  "Logements vérifiés par notre équipe",
  "Zéro commission",
];

export function OwnerLanding() {
  const { isOwnerAuthenticated } = useOwner();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  const handlePublish = () => {
    if (isOwnerAuthenticated) {
      navigate("/proprietaire/publier");
    } else {
      setShowModal(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <OwnerPublicHeader />
      <main className="flex-1">
        <section className="mx-auto max-w-7xl px-6 lg:px-10 py-16 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold leading-tight text-brand-navy">
              Publiez votre logement étudiant <span className="text-brand-blue">gratuitement.</span>
            </h1>
            <p className="mt-4 text-gray-500 max-w-md">
              Recevez des demandes d'étudiants sérieux partout au Cameroun.
            </p>
            <ul className="mt-6 space-y-2.5">
              {checklist.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-gray-700">
                  <ShieldCheck size={16} className="text-brand-green" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <button
                onClick={handlePublish}
                className="flex items-center gap-2 rounded-full bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
              >
                <UserPlus2 size={17} /> Publier mon logement
              </button>
              <button className="flex items-center gap-2 rounded-full border border-brand-blue/30 px-6 py-3 font-semibold text-brand-blue hover:bg-brand-blue-light transition-colors">
                <PlayCircle size={17} /> Comment ça marche ?
              </button>
            </div>

            <div className="mt-10 grid grid-cols-3 gap-4 max-w-lg rounded-2xl bg-gray-50 p-5">
              <Stat icon={ShieldCheck} value="+5 000" label="Logements publiés" />
              <Stat icon={Users} value="+20 000" label="Étudiants actifs" />
              <Stat icon={Clock} value="Moins de 24h" label="Délai de validation" />
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden aspect-[4/3]">
            <img src={loginBedroom} alt="Logement étudiant" className="h-full w-full object-cover" />
          </div>
        </section>
      </main>
      <Footer />

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
            <button
              onClick={() => setShowModal(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={16} />
            </button>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue">
              <UserPlus2 size={28} />
            </div>
            <h3 className="font-display text-xl font-bold text-brand-navy">Bienvenue sur StudHome 👋</h3>
            <p className="mt-2 text-sm text-gray-500">
              Pour publier votre logement, vous devez disposer d'un compte.
            </p>
            <Link
              to="/proprietaire/connexion"
              className="mt-5 block w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
            >
              Se connecter
            </Link>
            <p className="mt-4 text-xs text-gray-400">Vous n'avez pas encore de compte ?</p>
            <Link
              to="/proprietaire/inscription"
              className="mt-2 flex items-center justify-center gap-2 w-full rounded-xl border border-brand-blue/30 py-3 font-semibold text-brand-blue hover:bg-brand-blue-light transition-colors"
            >
              <UserPlus2 size={16} /> Créer un compte propriétaire
            </Link>
            <button
              onClick={() => setShowModal(false)}
              className="mt-4 text-sm font-medium text-gray-400 hover:text-gray-600"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: typeof ShieldCheck; value: string; label: string }) {
  return (
    <div>
      <Icon size={18} className="text-brand-blue mb-1.5" />
      <p className="font-display font-bold text-brand-navy leading-tight">{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
