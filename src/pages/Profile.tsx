import { useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { User as UserIcon, Camera } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { useApp } from "../context/AppContext";
import { Avatar } from "../components/Avatar";
import { resizeImageFile } from "../lib/resizeImage";

export function Profile() {
  const { isAuthenticated, user, credits, updateUser } = useApp();
  const [form, setForm] = useState(user);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  const handleChange = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImageFile(file, 400, 0.85);
    setForm((f) => ({ ...f, avatar: resized }));
    updateUser({ avatar: resized });
    e.target.value = "";
  };

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-10 py-10">
      <div className="flex items-center gap-3 mb-2">
        <UserIcon className="text-brand-blue" size={26} />
        <h1 className="font-display text-2xl font-bold text-brand-navy">Mon compte</h1>
      </div>
      <p className="text-gray-500 mb-8">Gérez vos informations personnelles et préférences.</p>

      <div className="grid lg:grid-cols-[240px_1fr] gap-10">
        <div>
          <div className="relative w-fit">
            <Avatar src={form.avatar} name={form.firstName} className="h-28 w-28" textClassName="text-3xl" />
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand-blue text-white hover:bg-brand-blue-dark transition-colors"
            >
              <Camera size={14} />
            </button>
          </div>
          <p className="mt-3 font-semibold text-brand-blue">{user.role}</p>

          <hr className="my-5 border-gray-100" />

          <p className="text-sm text-gray-500">Solde actuel</p>
          <p className="font-display text-3xl font-bold text-brand-orange">{credits} crédits</p>
          <Link
            to="/credits/achat"
            className="mt-3 inline-block rounded-full bg-brand-orange px-5 py-2 text-sm font-semibold text-white hover:bg-brand-orange-dark transition-colors"
          >
            Acheter des crédits
          </Link>

          <hr className="my-5 border-gray-100" />

          <div className="rounded-xl bg-brand-blue-light p-4 text-sm">
            <p className="text-gray-500">Université</p>
            <p className="font-semibold text-brand-navy">{user.university}</p>
            <p className="mt-3 text-gray-500">Localisation</p>
            <p className="font-semibold text-brand-navy">{user.city}, Cameroun</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div className="grid sm:grid-cols-2 gap-5">
            <Field label="Prénom" value={form.firstName} onChange={handleChange("firstName")} />
            <Field label="Nom" value={form.lastName} onChange={handleChange("lastName")} />
            <Field label="Email" type="email" value={form.email} onChange={handleChange("email")} />
            <Field label="Téléphone" value={form.phone} onChange={handleChange("phone")} />
            <Field label="Ville" value={form.city} onChange={handleChange("city")} />
            <Field label="Université" value={form.university} onChange={handleChange("university")} />
          </div>
          <label className="block">
            <span className="mb-1.5 block text-sm text-gray-500">Bio</span>
            <textarea
              value={form.bio}
              onChange={handleChange("bio")}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
            />
          </label>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              className="rounded-xl bg-brand-blue px-6 py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
            >
              Enregistrer les modifications
            </button>
            <button
              type="button"
              onClick={() => setForm(user)}
              className="rounded-xl border border-gray-200 px-6 py-3 font-semibold text-gray-400"
            >
              Annuler
            </button>
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-medium text-brand-green">
                <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" /> Modifications enregistrées
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm text-gray-500">{label}</span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
      />
    </label>
  );
}
