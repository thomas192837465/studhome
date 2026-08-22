export function MapPreview({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 200" className={className} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="200" fill="#EAF7FD" />
      {[30, 90, 150, 210, 270, 330, 390].map((x) => (
        <line key={`v${x}`} x1={x} y1="0" x2={x} y2="200" stroke="#cfe9f5" strokeWidth="2" />
      ))}
      {[20, 60, 100, 140, 180].map((y) => (
        <line key={`h${y}`} x1="0" y1={y} x2="400" y2={y} stroke="#cfe9f5" strokeWidth="2" />
      ))}
      <path d="M0 120 L120 110 L180 130 L260 100 L400 115" stroke="#bfe3f2" strokeWidth="10" fill="none" />
      <path d="M60 0 L80 60 L70 140 L90 200" stroke="#bfe3f2" strokeWidth="8" fill="none" />
      <rect x="140" y="60" width="34" height="26" rx="3" fill="#d7ecf6" />
      <rect x="230" y="130" width="28" height="22" rx="3" fill="#d7ecf6" />
      <rect x="300" y="40" width="30" height="24" rx="3" fill="#d7ecf6" />
      <g transform="translate(200,100)">
        <circle r="14" fill="#26A9E1" opacity="0.18" />
        <path
          d="M0 -16c-7 0-12 5.3-12 12 0 8.7 12 20 12 20s12-11.3 12-20c0-6.7-5-12-12-12z"
          fill="#26A9E1"
        />
        <circle cy="-4" r="4.2" fill="#fff" />
      </g>
    </svg>
  );
}
