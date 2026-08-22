import type { LucideIcon } from "lucide-react";

export function AdminPlaceholder({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="p-6 sm:p-10">
      <h1 className="font-display text-2xl font-bold text-brand-navy mb-1">{title}</h1>
      <p className="text-sm text-gray-500 mb-8">{description}</p>
      <div className="rounded-2xl border border-dashed border-gray-200 py-24 text-center">
        <Icon className="mx-auto text-gray-300" size={40} />
        <p className="mt-3 text-gray-500">Module en cours de construction.</p>
      </div>
    </div>
  );
}
