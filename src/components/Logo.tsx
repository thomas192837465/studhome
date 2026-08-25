import logoImg from "../assets/images/logo.png";

export function Logo({ className = "h-8 sm:h-9" }: { className?: string }) {
  return <img src={logoImg} alt="StudHome" className={`${className} w-auto select-none`} />;
}
