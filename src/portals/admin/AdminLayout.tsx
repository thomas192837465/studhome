import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Home,
  ClipboardList,
  Users,
  GraduationCap,
  CreditCard,
  Bell,
  MessageSquare,
  UserCog,
  ShieldCheck,
  FileClock,
  BarChart3,
  Settings,
  ChevronDown,
} from "lucide-react";
import { useAdminPortal } from "../../context/AdminPortalContext";
import { useListings } from "../../context/ListingsContext";
import { NotificationBell } from "./NotificationBell";

export function AdminLayout() {
  const { session, signalements, logout } = useAdminPortal();
  const { listings } = useListings();
  const navigate = useNavigate();
  const isSuper = session?.role === "Super Admin";
  const base = isSuper ? "/superadmin" : "/admin";

  const pendingCount = listings.filter((l) => l.status === "En attente").length;
  const signalementsCount = signalements.filter((s) => s.statut !== "Résolu").length;

  const navItems = [
    { to: `${base}/tableau-de-bord`, label: "Dashboard", icon: Home, end: true },
    { to: `${base}/annonces`, label: "Annonces", icon: ClipboardList, badge: pendingCount },
    { to: `${base}/proprietaires`, label: "Propriétaires", icon: Users },
    { to: `${base}/etudiants`, label: "Étudiants", icon: GraduationCap },
    { to: `${base}/paiements`, label: "Paiements", icon: CreditCard },
    { to: `${base}/signalements`, label: "Signalements", icon: Bell, badge: signalementsCount },
    { to: `${base}/messages`, label: "Messages", icon: MessageSquare },
    ...(isSuper
      ? [
          { to: `${base}/administrateurs`, label: "Administrateurs", icon: UserCog },
          { to: `${base}/roles`, label: "Rôles & Permissions", icon: ShieldCheck },
          { to: `${base}/logs`, label: "Logs d'activité", icon: FileClock },
        ]
      : []),
    { to: `${base}/statistiques`, label: "Statistiques", icon: BarChart3 },
    { to: `${base}/parametres`, label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 shrink-0 bg-brand-navy text-gray-300 flex flex-col">
        <div className="h-[70px] flex items-center px-6 border-b border-white/10">
          <span className="font-display font-bold text-xl text-white flex items-center gap-2">
            <span className="text-brand-orange">Stud</span>
            <span className="text-brand-blue -ml-1.5">Home</span>
          </span>
        </div>
        {session && (
          <div className="flex items-center gap-3 px-5 py-4 border-b border-white/10">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 font-bold text-white">
              {session.name.charAt(0)}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{session.name}</p>
              <p className="text-xs text-gray-400">{session.role}</p>
            </div>
          </div>
        )}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon, end, badge }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? "bg-brand-blue text-white" : "text-gray-300 hover:bg-white/5"
                }`
              }
            >
              <span className="flex items-center gap-3">
                <Icon size={17} />
                {label}
              </span>
              {!!badge && (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => {
              logout();
              navigate(`${base}/connexion`);
            }}
            className="w-full rounded-xl px-3.5 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 text-left"
          >
            Déconnexion
          </button>
        </div>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="h-[70px] bg-white border-b border-gray-100 flex items-center justify-end gap-4 px-6">
          <NotificationBell base={base} />
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue text-sm font-bold">
              {session?.name.charAt(0)}
            </span>
            <span className="text-sm font-medium text-brand-navy">{session?.name}</span>
            <ChevronDown size={14} className="text-gray-400" />
          </div>
        </header>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
