export function WatermarkedImage({
  src,
  alt,
  className = "",
  imgClassName = "h-full w-full object-cover",
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <img src={src} alt={alt} className={imgClassName} />
      <div className="pointer-events-none absolute inset-0 flex select-none items-center justify-center overflow-hidden">
        <span
          className="whitespace-nowrap text-lg font-display font-bold text-white/35"
          style={{ transform: "rotate(-25deg)", textShadow: "0 1px 3px rgba(0,0,0,0.35)" }}
        >
          StudHome
        </span>
      </div>
    </div>
  );
}
