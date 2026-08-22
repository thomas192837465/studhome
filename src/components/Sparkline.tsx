export function Sparkline({
  data,
  color = "#26A9E1",
  height = 80,
  className = "",
}: {
  data: number[];
  color?: string;
  height?: number;
  className?: string;
}) {
  const w = 300;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = w / (data.length - 1 || 1);

  const points = data.map((v, i) => {
    const x = i * step;
    const y = height - ((v - min) / range) * (height - 10) - 5;
    return `${x},${y}`;
  });

  const areaPath = `M0,${height} L${points.join(" L")} L${w},${height} Z`;
  const linePath = `M${points.join(" L")}`;

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className={className} preserveAspectRatio="none">
      <defs>
        <linearGradient id="sparkline-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkline-fill)" />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
