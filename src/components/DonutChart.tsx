export function DonutChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 100 100" width="120" height="120">
        <g transform="rotate(-90 50 50)">
          {data.map((d) => {
            const fraction = d.value / total;
            const dash = fraction * circumference;
            const circle = (
              <circle
                key={d.label}
                cx="50"
                cy="50"
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth="16"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return circle;
          })}
        </g>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="text-gray-600">{d.label}</span>
            <span className="font-semibold text-brand-navy">{d.value}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
