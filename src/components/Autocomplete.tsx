import { useEffect, useRef, useState } from "react";

export function Autocomplete({
  value,
  onChange,
  options,
  placeholder,
  className,
  onSelect,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  onSelect?: (v: string) => void;
  onBlur?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const filtered = value
    ? options.filter((o) => o.toLowerCase().includes(value.toLowerCase())).slice(0, 8)
    : options.slice(0, 8);

  const choose = (opt: string) => {
    onChange(opt);
    onSelect?.(opt);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
          setHighlight(0);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => Math.min(h + 1, filtered.length - 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => Math.max(h - 1, 0));
          } else if (e.key === "Enter") {
            e.preventDefault();
            if (filtered[highlight]) choose(filtered[highlight]);
            else if (value.trim()) choose(value.trim());
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        onBlur={() => onBlur?.()}
        placeholder={placeholder}
        autoComplete="off"
        className={className}
      />
      {open && filtered.length > 0 && (
        <div className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg">
          {filtered.map((opt, i) => (
            <button
              type="button"
              key={opt}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => choose(opt)}
              className={`block w-full px-4 py-2 text-left text-sm ${i === highlight ? "bg-brand-blue-light text-brand-blue" : "hover:bg-gray-50"}`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
