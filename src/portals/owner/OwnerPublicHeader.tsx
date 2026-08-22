import { Link, NavLink } from "react-router-dom";
import { Logo } from "../../components/Logo";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors hover:text-brand-blue ${isActive ? "text-brand-blue" : "text-gray-700"}`;

export function OwnerPublicHeader() {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-[70px] flex items-center justify-between gap-4">
        <Link to="/proprietaire">
          <Logo />
        </Link>
        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/home" className={navLinkClass}>
            Accueil
          </NavLink>
          <NavLink to="/logements" className={navLinkClass}>
            Logements
          </NavLink>
          <NavLink to="/proprietaire" end className={navLinkClass}>
            Comment ça marche ?
          </NavLink>
          <NavLink to="/a-propos" className={navLinkClass}>
            A propos
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>
        <Link
          to="/proprietaire/connexion"
          className="rounded-full border border-gray-300 px-5 py-2 text-sm font-semibold text-brand-navy hover:border-gray-400 transition-colors"
        >
          Connexion
        </Link>
      </div>
    </header>
  );
}
