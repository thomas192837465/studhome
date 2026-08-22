export function AProposPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-3xl font-bold text-brand-navy mb-4">A propos de StudHome</h1>
      <p className="text-gray-600 leading-relaxed">
        StudHome est la plateforme de référence pour le logement étudiant en Afrique. Nous connectons les
        étudiants à des logements vérifiés, sécurisés et abordables partout au Cameroun : recherchez,
        contactez le propriétaire via WhatsApp, visitez, et emménagez en toute confiance.
      </p>
      <div className="mt-8 grid sm:grid-cols-3 gap-6 text-sm">
        <div className="rounded-xl bg-brand-blue-light p-5">
          <p className="font-semibold text-brand-navy mb-1">Logements vérifiés</p>
          <p className="text-gray-500">Chaque annonce est contrôlée par notre équipe avant publication.</p>
        </div>
        <div className="rounded-xl bg-brand-orange-light p-5">
          <p className="font-semibold text-brand-navy mb-1">Zéro commission</p>
          <p className="text-gray-500">Les loyers affichés sont les tarifs réels fixés par les bailleurs.</p>
        </div>
        <div className="rounded-xl bg-brand-green-light p-5">
          <p className="font-semibold text-brand-navy mb-1">Support réactif</p>
          <p className="text-gray-500">Une équipe disponible pour vous accompagner à chaque étape.</p>
        </div>
      </div>
    </div>
  );
}

export function ContactPage() {
  return (
    <div className="mx-auto max-w-xl px-6 py-16 text-center">
      <h1 className="font-display text-3xl font-bold text-brand-navy mb-4">Contact</h1>
      <p className="text-gray-600 mb-8">
        Une question, un problème avec une annonce ? Notre équipe vous répond rapidement sur WhatsApp.
      </p>
      <a
        href="https://wa.me/999999999"
        target="_blank"
        rel="noreferrer"
        className="inline-block rounded-full bg-brand-green px-6 py-3 font-semibold text-white hover:bg-green-700 transition-colors"
      >
        Discuter sur WhatsApp
      </a>
    </div>
  );
}
