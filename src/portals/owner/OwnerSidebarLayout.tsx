import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Home, Heart, BarChart3, User, LogOut, Menu, X } from "lucide-react";
import { Logo } from "../../components/Logo";
import { Avatar } from "../../components/Avatar";
import { useOwner } from "../../context/OwnerContext";

const navItems = [
  { to: "/proprietaire/tableau-de-bord", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { to: "/proprietaire/annonces", label: "Mes annonces", icon: Home },
  { to: "/proprietaire/favoris", label: "Favoris", icon: Heart },
  { to: "/proprietaire/statistiques", label: "Statistiques", icon: BarChart3 },
  { to: "/proprietaire/profil", label: "Profil", icon: User },
];

export function OwnerSidebarLayout() {
  const { ownerUser, logout } = useOwner();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/proprietaire");
  };

  const sidebarContent = (
    <>
      <nav className="flex-1 px-3 py-5 space-y-1">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                isActive ? "bg-brand-blue-light text-brand-blue" : "text-gray-500 hover:bg-gray-50"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3.5 py-2.5">
          <Avatar src={ownerUser.avatar} name={ownerUser.fullName} className="h-9 w-9" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-navy truncate">{ownerUser.fullName}</p>
            <p className="text-xs text-gray-400">Propriétaire</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50"
        >
          <LogOut size={18} />
          Déconnexion
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Mobile top bar */}
      <div className="md:hidden h-[70px] flex items-center justify-between px-4 bg-white border-b border-gray-100">
        <Logo />
        <button
          onClick={() => setMobileOpen((o) => !o)}
          className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100"
          aria-label="Menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 flex flex-col">{sidebarContent}</div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-gray-100 flex-col">
        <div className="h-[70px] flex items-center px-6 border-b border-gray-100">
          <Logo />
        </div>
        {sidebarContent}
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
