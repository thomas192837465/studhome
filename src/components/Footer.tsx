import { Link } from "react-router-dom";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="bg-brand-navy text-gray-300 mt-auto">
      <div className="mx-auto max-w-7xl px-6 lg:px-10 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <Logo />
          <p className="mt-4 text-sm text-gray-400 max-w-xs">
            Plateforme de référence
            <br />
            pour le logement étudiant en Afrique.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Navigation</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/home" className="hover:text-white">Accueil</Link></li>
            <li><Link to="/logements" className="hover:text-white">Logements</Link></li>
            <li><Link to="/favoris" className="hover:text-white">Favoris</Link></li>
            <li><Link to="/a-propos" className="hover:text-white">A propos</Link></li>
            <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Ressources</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/a-propos" className="hover:text-white">Comment ça marche ?</Link></li>
            <li><Link to="/contact" className="hover:text-white">Aide &amp; FAQ</Link></li>
            <li><Link to="/a-propos" className="hover:text-white">Condition d'utilisation</Link></li>
            <li><Link to="/a-propos" className="hover:text-white">Politique de confidentialité</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Besoin d'aide ?</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/contact" className="hover:text-white">WhatsApp</Link></li>
          </ul>
          <h4 className="text-white font-semibold mb-4 mt-6">Propriétaire ?</h4>
          <ul className="space-y-2.5 text-sm">
            <li><Link to="/proprietaire" className="hover:text-white">Publier un logement</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-5 flex flex-col sm:flex-row justify-between gap-2 text-xs text-gray-500">
          <p>2026 StudHome. Tous droits réservés.</p>
          <p>Made with love.</p>
        </div>
      </div>
    </footer>
  );
}
