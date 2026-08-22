import { useState } from "react";
import { useOwner } from "../../context/OwnerContext";
import { CameroonFlag } from "../../components/CameroonFlag";

export function OwnerProfile() {
  const { ownerUser } = useOwner();
  const [form, setForm] = useState(ownerUser);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 sm:p-10 max-w-lg">
      <h1 className="font-display text-2xl font-bold text-brand-navy mb-1">Profil</h1>
      <p className="text-sm text-gray-500 mb-8">Gérez vos informations propriétaire.</p>

      <div className="mx-auto w-fit mb-6">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue text-2xl font-bold">
          {form.fullName.charAt(0)}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-navy">Nom complet</span>
          <input
            value={form.fullName}
            onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-brand-navy">Téléphone WhatsApp</span>
          <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 focus-within:ring-2 focus-within:ring-brand-blue/30">
            <CameroonFlag className="h-3.5 w-5 rounded-sm shrink-0" />
            <input
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              className="w-full text-sm focus:outline-none"
            />
          </div>
        </label>
        <button
          type="submit"
          className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
        >
          Enregistrer
        </button>
        {saved && <p className="text-center text-sm font-medium text-brand-green">Modifications enregistrées ✓</p>}
      </form>
    </div>
  );
}
