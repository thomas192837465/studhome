import { useState } from "react";
import { X, ShieldCheck } from "lucide-react";

function WhatsAppIcon({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16 3C9 3 3.3 8.7 3.3 15.7c0 2.5.7 4.8 1.9 6.8L3 29l6.7-2.1c1.9 1.1 4.1 1.7 6.3 1.7 7 0 12.7-5.7 12.7-12.7C28.7 8.7 23 3 16 3z"
        fill="#25D366"
      />
      <path
        d="M22.4 19.1c-.3-.2-1.8-.9-2.1-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.6-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6.1-.1.3-.4.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5-.1-.1-.7-1.6-.9-2.2-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1.1 2.8 1.2 3c.1.2 2.2 3.3 5.2 4.6.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.2-.6-.4z"
        fill="#fff"
      />
    </svg>
  );
}

export function WhatsAppWidget() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 left-5 z-30 flex items-center gap-3 rounded-full bg-white pl-2 pr-4 py-2 shadow-[0_4px_20px_rgba(0,0,0,0.12)] hover:shadow-[0_6px_24px_rgba(0,0,0,0.16)] transition-shadow"
      >
        <span className="relative h-9 w-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
          <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-brand-green border-2 border-white" />
        </span>
        <span className="text-left leading-tight">
          <span className="block text-sm font-bold text-brand-navy">Besoin d'aide ?</span>
          <span className="block text-xs font-medium text-brand-green">Discutez avec nous</span>
        </span>
        <WhatsAppIcon />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 text-center shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
            >
              <X size={16} />
            </button>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center">
              <WhatsAppIcon size={56} />
            </div>
            <h3 className="font-display text-xl font-bold text-brand-navy">
              Discussion avec notre équipe
            </h3>
            <p className="mt-2 text-sm text-gray-500">
              Vous allez être redirigé vers WhatsApp pour discuter avec notre équipe support.
            </p>
            <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-brand-green-light px-4 py-3 text-left">
              <ShieldCheck size={18} className="mt-0.5 shrink-0 text-brand-green" />
              <p className="text-xs text-gray-600">
                Vos informations sont sécurisées et la conservation est confidentielle.
              </p>
            </div>
            <a
              href="https://wa.me/999999999"
              target="_blank"
              rel="noreferrer"
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-green py-3 font-semibold text-white hover:bg-green-700 transition-colors"
            >
              Continuer sur WhatsApp
            </a>
            <button
              onClick={() => setOpen(false)}
              className="mt-3 w-full rounded-xl border border-gray-200 py-3 font-semibold text-brand-navy hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </>
  );
}
