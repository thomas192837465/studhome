export function Avatar({
  src,
  name,
  className = "h-10 w-10",
  textClassName = "text-sm",
}: {
  src?: string;
  name: string;
  className?: string;
  textClassName?: string;
}) {
  if (src) {
    return <img src={src} alt={name} className={`${className} rounded-full object-cover shrink-0`} />;
  }
  const letter = (name.trim().charAt(0) || "?").toUpperCase();
  return (
    <span
      className={`flex ${className} shrink-0 items-center justify-center rounded-full bg-brand-blue-light text-brand-blue font-bold ${textClassName}`}
    >
      {letter}
    </span>
  );
}
