// The real protection is baked into the image pixels themselves at upload
// time (see resizeImage.ts) so it survives right-click-save. This CSS
// overlay just mirrors that same triangle layout on screen, and is the
// only watermark shown for photos uploaded before that change existed.
const WATERMARK_POSITIONS = [
  { top: "25%", left: "22%" },
  { top: "40%", left: "78%" },
  { top: "78%", left: "50%" },
];

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
      <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
        {WATERMARK_POSITIONS.map((pos, i) => (
          <span
            key={i}
            className="absolute whitespace-nowrap text-base font-display font-bold text-white/35"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -50%) rotate(-22.5deg)",
              textShadow: "0 1px 3px rgba(0,0,0,0.35)",
            }}
          >
            StudHome
          </span>
        ))}
      </div>
    </div>
  );
}
