import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Heart, ChevronDown, ChevronUp, User, CreditCard, Clock, Shield, LogOut } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCoins } from "@fortawesome/free-solid-svg-icons";
import { Logo } from "./Logo";
import { CameroonFlag } from "./CameroonFlag";
import { Avatar } from "./Avatar";
import { useApp } from "../context/AppContext";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium transition-colors hover:text-brand-blue ${
    isActive ? "text-brand-blue" : "text-gray-700"
  }`;

export function Header() {
  const { isAuthenticated, user, credits, favorites, logout } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10 h-[70px] flex items-center justify-between gap-4">
        <Link to="/home" className="shrink-0">
          <Logo />
        </Link>

        <nav className="hidden md:flex items-center gap-7">
          <NavLink to="/home" end className={navLinkClass}>
            Accueil
          </NavLink>
          <NavLink to="/logements" className={navLinkClass}>
            Logements
          </NavLink>
          {!isAuthenticated && (
            <NavLink to="/favoris" className={navLinkClass}>
              Favoris
            </NavLink>
          )}
          <NavLink to="/a-propos" className={navLinkClass}>
            A propos
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>

        <div className="flex items-center gap-2.5 sm:gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/favoris"
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-brand-blue/40 text-brand-blue px-3 py-1.5 text-sm font-semibold hover:bg-brand-blue-light transition-colors"
              >
                <Heart size={16} />
                {favorites.length}
              </Link>
              <Link
                to="/credits/achat"
                className="hidden sm:flex items-center gap-1.5 rounded-full border border-brand-orange/40 bg-brand-orange-light text-brand-orange-dark px-3 py-1.5 text-sm font-semibold hover:bg-brand-orange/10 transition-colors"
              >
                <FontAwesomeIcon icon={faCoins} className="h-3.5 w-3.5" />
                {credits} crédits
              </Link>

              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-1.5 rounded-full pl-0.5 pr-1.5 py-0.5 hover:bg-gray-50"
                >
                  <Avatar src={user.avatar} name={user.firstName} className="h-9 w-9" />
                  {menuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100">
                      <Avatar src={user.avatar} name={user.firstName} className="h-11 w-11" />
                      <div>
                        <p className="font-semibold text-brand-navy leading-tight">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                      </div>
                    </div>
                    <div className="py-2">
                      <MenuItem
                        icon={<User size={18} />}
                        label="Mon compte"
                        to="/profil"
                        active
                        onClick={() => setMenuOpen(false)}
                      />
                      <MenuItem
                        icon={<CreditCard size={18} />}
                        label="Achat de crédits"
                        to="/credits/achat"
                        onClick={() => setMenuOpen(false)}
                      />
                      <MenuItem
                        icon={<Clock size={18} />}
                        label="Historique de crédits"
                        to="/credits/historique"
                        onClick={() => setMenuOpen(false)}
                      />
                      <MenuItem
                        icon={<Shield size={18} />}
                        label="Sécurité"
                        to="/profil"
                        onClick={() => setMenuOpen(false)}
                      />
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={18} />
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                to="/connexion"
                className="rounded-full border border-gray-300 px-4 py-2 text-sm font-semibold text-brand-navy hover:border-gray-400 transition-colors"
              >
                Se connecter
              </Link>
              <Link
                to="/connexion?tab=inscription"
                className="rounded-full bg-brand-orange px-4 py-2 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-colors"
              >
                S'inscrire
              </Link>
            </>
          )}
          <button className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600">
            <CameroonFlag className="h-3.5 w-5 rounded-sm overflow-hidden" />
            <ChevronDown size={14} />
          </button>
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  icon,
  label,
  to,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  to: string;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
        active ? "text-brand-blue font-medium" : "text-gray-700"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}
