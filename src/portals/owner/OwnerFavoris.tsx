import { Heart } from "lucide-react";

export function OwnerFavoris() {
  return (
    <div className="p-6 sm:p-10">
      <h1 className="font-display text-2xl font-bold text-brand-navy mb-1">Favoris</h1>
      <p className="text-sm text-gray-500 mb-8">Les annonces d'autres propriétaires que vous avez sauvegardées.</p>
      <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center">
        <Heart className="mx-auto text-gray-300" size={40} />
        <p className="mt-3 text-gray-500">Vous n'avez pas encore de favoris.</p>
      </div>
    </div>
  );
}
