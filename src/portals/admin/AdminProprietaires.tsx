import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { useBasePath } from "./adminUi";

interface OwnerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  createdAt: string;
}

export function AdminProprietaires() {
  const base = useBasePath(useLocation().pathname);
  const [owners, setOwners] = useState<OwnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchOwners = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, email, phone, city, created_at")
        .eq("role", "proprietaire")
        .order("created_at", { ascending: false });
      setOwners(
        (data ?? []).map((row) => ({
          id: row.id,
          name: `${row.first_name} ${row.last_name}`.trim() || row.email || "Sans nom",
          email: row.email ?? "",
          phone: row.phone,
          city: row.city,
          createdAt: row.created_at,
        })),
      );
      setLoading(false);
    };
    fetchOwners();
  }, []);

  const filtered = owners.filter((o) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return o.name.toLowerCase().includes(q) || o.email.toLowerCase().includes(q) || o.phone.includes(q);
  });

  return (
    <div className="p-6 sm:p-10">
      <h1 className="font-display text-2xl font-bold text-brand-navy mb-1">Propriétaires</h1>
      <p className="text-sm text-gray-500 mb-6">Gérez les comptes propriétaires de la plateforme.</p>

      <div className="mb-5 flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2.5 max-w-md">
        <Search size={16} className="text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email ou téléphone..."
          className="w-full text-sm focus:outline-none"
        />
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-5 py-3 font-semibold">Nom</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Téléphone</th>
              <th className="px-5 py-3 font-semibold">Ville</th>
              <th className="px-5 py-3 font-semibold">Membre depuis</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                  Chargement...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                  Aucun propriétaire trouvé.
                </td>
              </tr>
            ) : (
              filtered.map((o) => (
                <tr key={o.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                  <td className="px-5 py-3.5">
                    <Link to={`${base}/proprietaires/${o.id}`} className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue text-xs font-bold">
                        {o.name.charAt(0)}
                      </span>
                      <span className="font-medium text-brand-navy">{o.name}</span>
                    </Link>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{o.email}</td>
                  <td className="px-5 py-3.5 text-gray-600">{o.phone}</td>
                  <td className="px-5 py-3.5 text-gray-500">{o.city}</td>
                  <td className="px-5 py-3.5 text-gray-500">{new Date(o.createdAt).toLocaleDateString("fr-FR")}</td>
                  <td className="px-5 py-3.5">
                    <Link to={`${base}/proprietaires/${o.id}`} className="text-gray-400 hover:text-brand-blue">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
