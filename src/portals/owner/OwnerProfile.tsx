import { useEffect, useRef, useState } from "react";
import { Camera } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { useOwner } from "../../context/OwnerContext";
import { CameroonFlag } from "../../components/CameroonFlag";
import { Avatar } from "../../components/Avatar";
import { resizeImageFile } from "../../lib/resizeImage";

export function OwnerProfile() {
  const { ownerUser, authLoading, updateOwnerUser } = useOwner();
  const [form, setForm] = useState(ownerUser);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!authLoading) setForm(ownerUser);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOwnerUser(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const resized = await resizeImageFile(file, 400, 0.85);
    setForm((f) => ({ ...f, avatar: resized }));
    updateOwnerUser({ avatar: resized });
    e.target.value = "";
  };

  return (
    <div className="p-6 sm:p-10 max-w-lg">
      <h1 className="font-display text-2xl font-bold text-brand-navy mb-1">Profil</h1>
      <p className="text-sm text-gray-500 mb-8">Gérez vos informations propriétaire.</p>

      <div className="relative mx-auto w-fit mb-6">
        <Avatar src={form.avatar} name={form.fullName} className="h-20 w-20" textClassName="text-2xl" />
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-brand-blue text-white hover:bg-brand-blue-dark transition-colors"
        >
          <Camera size={13} />
        </button>
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
        {saved && (
          <p className="flex items-center justify-center gap-1.5 text-center text-sm font-medium text-brand-green">
            <FontAwesomeIcon icon={faCircleCheck} className="h-4 w-4" /> Modifications enregistrées
          </p>
        )}
      </form>
    </div>
  );
}
