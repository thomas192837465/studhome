import { useEffect, useState } from "react";
import { Plus, Trash2, X, Mail } from "lucide-react";
import { useAdminPortal } from "../../context/AdminPortalContext";
import { supabase } from "../../lib/supabase";

interface AdminRow {
  id: string;
  name: string;
  email: string;
  role: "admin" | "superadmin";
  createdAt: string;
}

export function Administrateurs() {
  const { session, logAction } = useAdminPortal();
  const [admins, setAdmins] = useState<AdminRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "superadmin">("admin");
  const [sending, setSending] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [revokingId, setRevokingId] = useState<string | null>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, role, created_at")
      .in("role", ["admin", "superadmin"])
      .order("created_at", { ascending: false });
    setAdmins(
      (data ?? []).map((row) => ({
        id: row.id,
        name: `${row.first_name} ${row.last_name}`.trim() || row.email || "Sans nom",
        email: row.email ?? "",
        role: row.role,
        createdAt: row.created_at,
      })),
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setSending(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Session expirée, reconnectez-vous.");

      const res = await fetch("/api/admin/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email, fullName, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de l'invitation");

      await logAction("Invitation administrateur", email, `Rôle : ${role === "superadmin" ? "Super Admin" : "Admin"}`);
      setFormSuccess("Invitation envoyée par email.");
      setFullName("");
      setEmail("");
      setRole("admin");
      await fetchAdmins();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Échec de l'invitation");
    } finally {
      setSending(false);
    }
  };

  const handleRevoke = async (admin: AdminRow) => {
    if (admin.id === session?.id) return;
    if (!window.confirm(`Révoquer l'accès de ${admin.name} ?`)) return;
    setRevokingId(admin.id);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error("Session expirée, reconnectez-vous.");

      const res = await fetch("/api/admin/revoke", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId: admin.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Échec de la révocation");

      await logAction("Révocation administrateur", admin.email);
      await fetchAdmins();
    } catch (err) {
      window.alert(err instanceof Error ? err.message : "Échec de la révocation");
    } finally {
      setRevokingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-brand-navy">Administrateurs</h1>
          <p className="mt-1 text-sm text-gray-500">Gérez les accès et permissions de votre équipe.</p>
        </div>
        <button
          onClick={() => {
            setShowAdd(true);
            setFormError("");
            setFormSuccess("");
          }}
          className="flex items-center gap-2 rounded-full bg-brand-blue px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-blue-dark transition-colors"
        >
          <Plus size={16} /> Ajouter un administrateur
        </button>
      </div>

      <div className="rounded-2xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[680px]">
          <thead>
            <tr className="text-left text-gray-500 border-b border-gray-100">
              <th className="px-5 py-3 font-semibold">Nom</th>
              <th className="px-5 py-3 font-semibold">Email</th>
              <th className="px-5 py-3 font-semibold">Rôle</th>
              <th className="px-5 py-3 font-semibold">Membre depuis</th>
              <th className="px-5 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  Chargement...
                </td>
              </tr>
            ) : admins.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                  Aucun administrateur pour l'instant.
                </td>
              </tr>
            ) : (
              admins.map((a) => (
                <tr key={a.id} className="border-b border-gray-50 last:border-0">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue text-xs font-bold">
                        {a.name.charAt(0)}
                      </span>
                      <span className="font-medium text-brand-navy">
                        {a.name} {a.id === session?.id && <span className="text-xs text-gray-400">(vous)</span>}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-gray-600">{a.email}</td>
                  <td className="px-5 py-3.5 text-gray-600">{a.role === "superadmin" ? "Super Admin" : "Admin"}</td>
                  <td className="px-5 py-3.5 text-gray-500">
                    {new Date(a.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-5 py-3.5">
                    {a.id !== session?.id && (
                      <button
                        onClick={() => handleRevoke(a)}
                        disabled={revokingId === a.id}
                        className="text-gray-400 hover:text-red-500 disabled:opacity-50"
                        title="Révoquer l'accès"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl">
            <button
              onClick={() => setShowAdd(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={16} />
            </button>
            <h3 className="font-display text-lg font-bold text-brand-navy mb-4">Ajouter un administrateur</h3>
            <form onSubmit={handleAdd} className="space-y-3">
              {formError && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">{formError}</p>
              )}
              {formSuccess && (
                <p className="flex items-center gap-1.5 rounded-lg bg-brand-green-light px-3 py-2 text-xs font-medium text-green-700">
                  <Mail size={13} /> {formSuccess}
                </p>
              )}
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nom complet"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as "admin" | "superadmin")}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:outline-none"
              >
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
              <button
                type="submit"
                disabled={sending}
                className="w-full rounded-xl bg-brand-blue py-2.5 font-semibold text-white hover:bg-brand-blue-dark transition-colors disabled:opacity-60"
              >
                {sending ? "Envoi..." : "Envoyer l'invitation"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
