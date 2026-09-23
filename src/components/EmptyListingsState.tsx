import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import { useApp } from "../context/AppContext";

function NoListingsIllustration() {
  return (
    <svg viewBox="0 0 240 180" className="mx-auto h-40 w-auto" aria-hidden="true">
      <circle cx="120" cy="95" r="78" fill="var(--color-brand-blue-light)" />
      <circle cx="184" cy="46" r="16" fill="var(--color-brand-orange-light)" />
      <circle cx="40" cy="130" r="11" fill="var(--color-brand-orange-light)" />
      <path
        d="M70 108 L118 66 L166 108 V150 A6 6 0 0 1 160 156 H76 A6 6 0 0 1 70 150 Z"
        fill="white"
        stroke="var(--color-brand-navy)"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <rect x="102" y="120" width="32" height="36" rx="2" fill="var(--color-brand-blue-light)" stroke="var(--color-brand-navy)" strokeWidth="2.5" />
      <path d="M62 112 L118 60 L174 112" fill="none" stroke="var(--color-brand-navy)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      <g transform="translate(140 96)">
        <circle cx="26" cy="26" r="24" fill="white" stroke="var(--color-brand-orange-dark)" strokeWidth="5" />
        <line x1="43" y1="43" x2="60" y2="60" stroke="var(--color-brand-orange-dark)" strokeWidth="6" strokeLinecap="round" />
        <line x1="17" y1="26" x2="35" y2="26" stroke="var(--color-brand-orange-dark)" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="26" y1="17" x2="26" y2="35" stroke="var(--color-brand-orange-dark)" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      </g>
    </svg>
  );
}

export function EmptyListingsState({ city }: { city: string }) {
  const { isAuthenticated, user } = useApp();
  const [email, setEmail] = useState("");
  const [count, setCount] = useState(0);
  const [subscribed, setSubscribed] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isAuthenticated && user.email) setEmail(user.email);
  }, [isAuthenticated, user.email]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { count: c } = await supabase
          .from("city_alerts")
          .select("id", { count: "exact", head: true })
          .eq("city", city);
        if (!cancelled) setCount(c ?? 0);
      } catch {
        // Non-critical stat — leave the count at 0 on failure.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [city]);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError("");
    setSending(true);
    try {
      const { error: insertError } = await supabase
        .from("city_alerts")
        .insert({ city, email: email.trim().toLowerCase() });
      if (insertError && !insertError.message.includes("duplicate")) throw insertError;
      setSubscribed(true);
      setCount((c) => c + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Impossible d'activer l'alerte, réessayez.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="py-12 text-center">
      <NoListingsIllustration />
      <h3 className="mt-4 font-display text-xl font-bold text-brand-navy">
        Oups, aucun logement disponible ici pour le moment.
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
        De nouveaux logements sont ajoutés régulièrement. Soyez le premier informé dès qu'un logement est disponible
        à {city}.
      </p>

      <div className="mx-auto mt-5 max-w-sm">
        {subscribed ? (
          <p className="flex items-center justify-center gap-1.5 rounded-xl bg-brand-green-light py-3 text-sm font-medium text-green-700">
            <Check size={16} /> Vous serez prévenu(e) dès qu'un logement sera publié à {city}.
          </p>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Votre email"
              required
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
            <button
              type="submit"
              disabled={sending}
              className="flex items-center justify-center gap-2 rounded-xl bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60 shrink-0"
            >
              <Bell size={15} /> {sending ? "..." : "Me prévenir"}
            </button>
          </form>
        )}
        {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
        {!subscribed && count > 0 && (
          <p className="mt-2.5 text-xs text-gray-400">
            {count} étudiant{count > 1 ? "s" : ""} {count > 1 ? "ont" : "a"} déjà activé une alerte pour cette ville.
          </p>
        )}
      </div>

      <div className="mx-auto mt-8 max-w-md border-t border-gray-100 pt-6">
        <p className="text-xs text-gray-400 mb-3">ou</p>
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-gray-50 px-5 py-4 sm:flex-row sm:text-left">
          <p className="flex-1 text-sm text-gray-600">
            <span className="font-semibold text-brand-navy">Vous êtes propriétaire à {city} ?</span> Publiez votre
            logement gratuitement et touchez des étudiants de votre région.
          </p>
          <Link
            to="/proprietaire/inscription"
            className="shrink-0 rounded-xl bg-brand-navy px-4 py-2 text-sm font-semibold text-white hover:bg-brand-navy/90 transition-colors"
          >
            Publier un logement →
          </Link>
        </div>
      </div>
    </div>
  );
}
