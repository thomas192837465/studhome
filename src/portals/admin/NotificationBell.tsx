import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, ClipboardList, AlertTriangle, Star } from "lucide-react";
import { useAdminPortal } from "../../context/AdminPortalContext";
import { useListings } from "../../context/ListingsContext";
import { useReviews } from "../../context/ReviewsContext";

function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return "à l'instant";
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days} j`;
}

export function NotificationBell({ base }: { base: string }) {
  const { signalements } = useAdminPortal();
  const { listings } = useListings();
  const { reviews } = useReviews();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const pendingListings = listings
    .filter((l) => l.status === "En attente")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  const openSignalements = signalements.filter((s) => s.statut !== "Résolu");
  const pendingReviews = reviews
    .filter((r) => r.status === "En attente")
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const items = [
    ...pendingListings.map((l) => ({
      key: `listing-${l.id}`,
      icon: ClipboardList,
      tone: "text-brand-blue bg-brand-blue-light",
      text: `Nouvelle annonce à vérifier : ${l.title}`,
      time: timeAgo(l.createdAt),
      onClick: () => navigate(`${base}/annonces/${l.id}`),
    })),
    ...pendingReviews.map((r) => ({
      key: `review-${r.id}`,
      icon: Star,
      tone: "text-brand-orange bg-brand-orange-light",
      text: `Nouvel avis de ${r.authorName} à modérer`,
      time: timeAgo(r.createdAt),
      onClick: () => navigate(`${base}/avis`),
    })),
    ...openSignalements.map((s) => ({
      key: `signalement-${s.id}`,
      icon: AlertTriangle,
      tone: "text-red-500 bg-red-50",
      text: `Signalement : ${s.raison} — ${s.logement}`,
      time: s.date,
      onClick: () => navigate(`${base}/signalements`),
    })),
  ];

  const total = items.length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-50"
      >
        <Bell size={18} className="text-gray-500" />
        {total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="font-semibold text-brand-navy text-sm">Notifications</p>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-400">Rien de nouveau pour l'instant.</p>
            ) : (
              items.slice(0, 10).map((item) => (
                <button
                  key={item.key}
                  onClick={() => {
                    setOpen(false);
                    item.onClick();
                  }}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-50 last:border-0"
                >
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.tone}`}>
                    <item.icon size={15} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm text-brand-navy leading-snug">{item.text}</span>
                    <span className="block text-xs text-gray-400 mt-0.5">{item.time}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
