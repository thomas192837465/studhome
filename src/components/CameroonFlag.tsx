export function CameroonFlag({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 3 2" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect width="1" height="2" fill="#007A5E" />
      <rect x="1" width="1" height="2" fill="#CE1126" />
      <rect x="2" width="1" height="2" fill="#FCD116" />
      <path d="M1.5 0.7l0.12 0.37h0.39l-0.31 0.23 0.12 0.37-0.32-0.23-0.32 0.23 0.12-0.37-0.31-0.23h0.39z" fill="#CE1126" />
    </svg>
  );
}
