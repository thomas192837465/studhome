import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { ArrowLeft, Mail, Phone, GraduationCap, Heart, Lock, Coins } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useBasePath } from "./adminUi";
import { rowToTransaction, type TransactionRow } from "../../lib/transactionMapper";
import type { Transaction } from "../../data/types";

interface StudentProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  university: string;
  credits: number;
  createdAt: string;
}

export function AdminEtudiantDetail() {
  const { id } = useParams();
  const base = useBasePath(useLocation().pathname);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [favoritesCount, setFavoritesCount] = useState(0);
  const [unlockedCount, setUnlockedCount] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const fetchAll = async () => {
      setLoading(true);
      const [profileRes, favRes, unlockRes, txRes] = await Promise.all([
        supabase
          .from("profiles")
          .select("id, first_name, last_name, email, phone, city, university, credits, created_at")
          .eq("id", id)
          .maybeSingle(),
        supabase.from("favorites").select("listing_id", { count: "exact", head: true }).eq("user_id", id),
        supabase.from("unlocked_listings").select("listing_id", { count: "exact", head: true }).eq("user_id", id),
        supabase
          .from("credit_transactions")
          .select("*")
          .eq("user_id", id)
          .order("created_at", { ascending: false })
          .limit(10),
      ]);

      if (profileRes.data) {
        const data = profileRes.data;
        setProfile({
          id: data.id,
          name: `${data.first_name} ${data.last_name}`.trim() || data.email || "Sans nom",
          email: data.email ?? "",
          phone: data.phone,
          city: data.city,
          university: data.university,
          credits: data.credits,
          createdAt: data.created_at,
        });
      }
      setFavoritesCount(favRes.count ?? 0);
      setUnlockedCount(unlockRes.count ?? 0);
      setTransactions(((txRes.data ?? []) as TransactionRow[]).map(rowToTransaction));
      setLoading(false);
    };
    fetchAll();
  }, [id]);

  if (loading) return <div className="p-10 text-center text-gray-400">Chargement...</div>;

  if (!profile) {
    return (
      <div className="p-10 text-center text-gray-500">
        Étudiant introuvable.{" "}
        <Link to={`${base}/etudiants`} className="text-brand-blue font-semibold">
          Retour à la liste
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-4xl">
      <Link to={`${base}/etudiants`} className="inline-flex items-center gap-2 text-sm font-medium text-brand-navy mb-5">
        <ArrowLeft size={16} /> Retour aux étudiants
      </Link>

      <div className="rounded-2xl border border-gray-100 p-6 flex flex-wrap items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-green-light text-green-700 text-xl font-bold">
            {profile.name.charAt(0)}
          </span>
          <div>
            <h1 className="font-display text-lg font-bold text-brand-navy">{profile.name}</h1>
            <p className="text-xs text-gray-400">
              Membre depuis le {new Date(profile.createdAt).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 text-sm text-gray-600">
          <span className="flex items-center gap-1.5">
            <Mail size={14} className="text-gray-400" /> {profile.email || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <Phone size={14} className="text-gray-400" /> {profile.phone || "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <GraduationCap size={14} className="text-gray-400" /> {profile.university || "—"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-100 p-4 text-center">
          <Coins size={18} className="mx-auto text-brand-orange mb-1.5" />
          <p className="text-lg font-bold text-brand-navy">{profile.credits}</p>
          <p className="text-xs text-gray-500">Crédits</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 text-center">
          <Heart size={18} className="mx-auto text-brand-blue mb-1.5" />
          <p className="text-lg font-bold text-brand-navy">{favoritesCount}</p>
          <p className="text-xs text-gray-500">Favoris</p>
        </div>
        <div className="rounded-xl border border-gray-100 p-4 text-center">
          <Lock size={18} className="mx-auto text-brand-green mb-1.5" />
          <p className="text-lg font-bold text-brand-navy">{unlockedCount}</p>
          <p className="text-xs text-gray-500">Annonces débloquées</p>
        </div>
      </div>

      <h2 className="font-display text-lg font-bold text-brand-navy mt-8 mb-3">Transactions récentes</h2>
      {transactions.length === 0 ? (
        <p className="text-sm text-gray-400">Aucune transaction.</p>
      ) : (
        <div className="rounded-2xl border border-gray-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Type</th>
                <th className="px-5 py-3 font-semibold">Description</th>
                <th className="px-5 py-3 font-semibold">Crédits</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3.5 text-gray-500">{t.date}</td>
                  <td className="px-5 py-3.5 text-gray-600">{t.type}</td>
                  <td className="px-5 py-3.5 text-gray-600">{t.description}</td>
                  <td className={`px-5 py-3.5 font-medium ${t.credits < 0 ? "text-red-500" : "text-green-600"}`}>
                    {t.credits > 0 ? "+" : ""}
                    {t.credits}
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{t.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
