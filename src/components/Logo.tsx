export function Logo() {
  return (
    <span className="flex items-center gap-1.5 font-display font-bold text-xl sm:text-2xl select-none">
      <svg width="30" height="30" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M20 4L37 13L20 22L3 13L20 4Z"
          fill="#FAAE3F"
        />
        <path
          d="M9 17V27C9 27 13 32 20 32C27 32 31 27 31 27V17L20 22.5L9 17Z"
          fill="#26A9E1"
        />
      </svg>
      <span className="text-brand-orange">Stud</span>
      <span className="text-brand-blue -ml-1.5">Home</span>
    </span>
  );
}
