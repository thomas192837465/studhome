export function BarChart({
  data,
  color = "#26A9E1",
  height = 120,
}: {
  data: { label: string; value: number }[];
  color?: string;
  height?: number;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center gap-1.5">
          <div
            className="w-full rounded-t-md"
            style={{ height: `${(d.value / max) * (height - 24)}px`, backgroundColor: color }}
          />
          <span className="text-[11px] text-gray-400">{d.label}</span>
        </div>
      ))}
    </div>
  );
}
