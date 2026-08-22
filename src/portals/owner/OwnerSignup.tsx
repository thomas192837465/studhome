import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Lock, MessageSquare, PartyPopper, Check } from "lucide-react";
import { OwnerPublicHeader } from "./OwnerPublicHeader";
import { Footer } from "../../components/Footer";
import { CameroonFlag } from "../../components/CameroonFlag";
import { useOwner } from "../../context/OwnerContext";

type Step = 1 | 2 | 3;

export function OwnerSignup() {
  const navigate = useNavigate();
  const { login } = useOwner();
  const [step, setStep] = useState<Step>(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+237 699 999 999");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [seconds, setSeconds] = useState(28);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step !== 2) return;
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, seconds]);

  const rules = [
    { label: "8 caractères minimum", ok: password.length >= 8 },
    { label: "Au moins une lettre", ok: /[a-zA-Z]/.test(password) },
    { label: "Au moins un chiffre", ok: /[0-9]/.test(password) },
  ];

  const handleStep1 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleCodeChange = (i: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;
    const next = [...code];
    next[i] = value;
    setCode(next);
    if (value && i < 5) inputsRef.current[i + 1]?.focus();
  };

  const handleStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(3);
  };

  const finish = () => {
    login({ fullName: fullName || "Dalia Abena", phone });
    navigate("/proprietaire/publier");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <OwnerPublicHeader />
      <main className="flex-1 mx-auto max-w-2xl w-full px-4 sm:px-6 py-14">
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <span
              key={s}
              className={`h-1.5 w-14 rounded-full ${s <= step ? "bg-brand-blue" : "bg-gray-200"}`}
            />
          ))}
        </div>

        {step === 1 && (
          <div className="rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-sm">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
              <Lock size={24} />
            </div>
            <h2 className="font-display text-xl font-bold text-brand-navy text-center">
              Créer un compte propriétaire
            </h2>
            <p className="mt-1 text-center text-sm text-gray-400">Étape 1 sur 2</p>

            <form onSubmit={handleStep1} className="mt-6 space-y-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-navy">Nom complet</span>
                <input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ex : Jean Paul Mbarga"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-navy">Téléphone WhatsApp</span>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-3 focus-within:ring-2 focus-within:ring-brand-blue/30">
                  <CameroonFlag className="h-3.5 w-5 rounded-sm shrink-0" />
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                    required
                    className="w-full text-sm focus:outline-none"
                  />
                </div>
              </label>
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-brand-navy">Mot de passe</span>
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  type="password"
                  required
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                />
              </label>
              <ul className="space-y-1">
                {rules.map((r) => (
                  <li
                    key={r.label}
                    className={`flex items-center gap-1.5 text-xs ${r.ok ? "text-brand-green" : "text-gray-400"}`}
                  >
                    <Check size={13} /> {r.label}
                  </li>
                ))}
              </ul>
              <button
                type="submit"
                className="w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
              >
                Continuer
              </button>
              <p className="text-center text-sm text-gray-500">
                Déjà un compte ?{" "}
                <Link to="/proprietaire/connexion" className="font-semibold text-brand-blue">
                  Se connecter
                </Link>
              </p>
            </form>
          </div>
        )}

        {step === 2 && (
          <div className="rounded-3xl border border-gray-100 p-8 sm:p-10 shadow-sm text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-blue-light text-brand-blue">
              <MessageSquare size={24} />
            </div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Vérification de votre numéro</h2>
            <p className="mt-2 text-sm text-gray-500">
              Entrez le code à 6 chiffres envoyé sur votre WhatsApp ou par SMS au
              <br />
              <span className="font-semibold text-brand-navy">{phone}</span>
            </p>

            <form onSubmit={handleStep2}>
              <div className="mt-6 flex justify-center gap-2">
                {code.map((c, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputsRef.current[i] = el;
                    }}
                    value={c}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    maxLength={1}
                    inputMode="numeric"
                    className="h-12 w-11 rounded-xl border border-gray-200 text-center text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-brand-blue/30"
                  />
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-400">
                {seconds > 0 ? (
                  `Renvoyer le code dans ${seconds}s`
                ) : (
                  <button type="button" onClick={() => setSeconds(28)} className="font-semibold text-brand-blue">
                    Renvoyer le code
                  </button>
                )}
              </p>
              <button
                type="submit"
                className="mt-6 w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
              >
                Vérifier et continuer
              </button>
            </form>
          </div>
        )}

        {step === 3 && (
          <div className="rounded-3xl border border-gray-100 p-10 shadow-sm text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-brand-green-light text-brand-green">
              <PartyPopper size={30} />
            </div>
            <h2 className="font-display text-xl font-bold text-brand-navy">Compte créé avec succès !</h2>
            <p className="mt-2 text-sm text-gray-500">
              Vous pouvez maintenant publier votre premier logement et recevoir des demandes d'étudiants.
            </p>
            <button
              onClick={finish}
              className="mt-7 w-full rounded-xl bg-brand-blue py-3 font-semibold text-white hover:bg-brand-blue-dark transition-colors"
            >
              Publier mon logement
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
