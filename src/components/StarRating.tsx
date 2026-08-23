import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faStar as faStarSolid } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarRegular } from "@fortawesome/free-regular-svg-icons";

export function StarRating({
  value,
  onChange,
  size = "h-4 w-4",
}: {
  value: number;
  onChange?: (n: number) => void;
  size?: string;
}) {
  const interactive = !!onChange;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(n)}
          className={interactive ? "cursor-pointer" : "cursor-default"}
        >
          <FontAwesomeIcon
            icon={n <= value ? faStarSolid : faStarRegular}
            className={`${size} ${n <= value ? "text-brand-orange" : "text-gray-300"}`}
          />
        </button>
      ))}
    </div>
  );
}
