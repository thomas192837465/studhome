import { useState } from "react";
import { Navigate } from "react-router-dom";
import { Copy, UserPlus, UserCheck, ShoppingCart, Info } from "lucide-react";
import { useApp } from "../context/AppContext";

const shareChannels = [
  { id: "whatsapp", label: "WhatsApp", color: "bg-green-500" },
  { id: "facebook", label: "Facebook", color: "bg-blue-600" },
  { id: "telegram", label: "Telegram", color: "bg-sky-500" },
];

export function Parrainage() {
  const { isAuthenticated, authLoading, user } = useApp();
  const [copied, setCopied] = useState(false);

  if (authLoading) return null;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  const handleCopy = () => {
    navigator.clipboard?.writeText(user.referralCode).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
      <div className="rounded-3xl bg-brand-orange p-8 sm:p-10 text-center text-white">
        <h1 className="font-display text-2xl sm:text-3xl font-bold">Invitez vos amis et gagnez des crédits !</h1>
        <p className="mt-2 text-white/90 max-w-md mx-auto text-sm">
          Vous gagnez des crédits à chaque premier achat de votre filleul.
        </p>

        <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-md mx-auto">
          <div className="rounded-2xl bg-white/15 backdrop-blur px-4 py-5">
            <p className="text-sm text-white/80">Vous gagnez</p>
            <p className="font-display text-2xl font-bold">5 crédits</p>
          </div>
          <div className="rounded-2xl bg-white/15 backdrop-blur px-4 py-5">
            <p className="text-sm text-white/80">Votre filleul gagne</p>
            <p className="font-display text-2xl font-bold">5 crédits</p>
          </div>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 p-6 sm:p-8">
        <h2 className="font-semibold text-brand-navy mb-5">Comment ça marche ?</h2>
        <div className="space-y-4">
          <Step icon={UserPlus} title="Invitez vos amis" text="Partagez votre code de parrainage avec vos amis." />
          <Step icon={UserCheck} title="Votre ami s'inscrit" text="Il crée un compte StudHome avec votre code." />
          <Step icon={ShoppingCart} title="Premier achat" text="Il achète un pack de crédits pour débloquer une annonce." />
        </div>

        <div className="mt-8 grid sm:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">Votre code de parrainage</p>
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3">
              <span className="flex-1 font-display font-bold text-brand-navy tracking-wide">
                {user.referralCode}
              </span>
              <button onClick={handleCopy} className="text-gray-400 hover:text-brand-blue">
                <Copy size={16} />
              </button>
            </div>
            {copied && <p className="mt-1 text-xs text-brand-green">Code copié !</p>}
            <p className="mt-1.5 text-xs text-gray-400">Copiez ce code et partagez-le avec vos amis.</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-500 mb-2">Partager votre code</p>
            <div className="flex items-center gap-3">
              {shareChannels.map((c) => (
                <button
                  key={c.id}
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-white text-xs font-bold ${c.color}`}
                  title={c.label}
                >
                  {c.label.charAt(0)}
                </button>
              ))}
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-400">
                •••
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-start gap-2.5 rounded-xl bg-brand-blue-light px-4 py-3.5 text-xs text-gray-600">
        <Info size={16} className="mt-0.5 shrink-0 text-brand-blue" />
        Les crédits reçus n'expirent jamais et peuvent être utilisés pour débloquer des contacts.
      </div>
    </div>
  );
}

function Step({ icon: Icon, title, text }: { icon: typeof UserPlus; title: string; text: string }) {
  return (
    <div className="flex items-start gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
        <Icon size={17} />
      </span>
      <div>
        <p className="font-semibold text-brand-navy text-sm">{title}</p>
        <p className="text-sm text-gray-500">{text}</p>
      </div>
    </div>
  );
}
