import Link from "next/link";
import TeaLeafMark from "../icons/tea-leaf-mark";
import ThemeToggle from "../theme-toggle";

export default function Nav() {
  return (
    <header className="tea-page-padding reveal flex items-center justify-between py-8">
      <div className="flex items-center gap-3">
        <TeaLeafMark />
        <span className="tea-text-primary text-sm font-medium tracking-[0.2em] uppercase">
          Boba Log
        </span>
      </div>
      <nav className="flex items-center gap-3" aria-label="Primary">
        <ThemeToggle />
        <Link href="/auth" className="tea-link">
          Sign In
        </Link>
      </nav>
    </header>
  );
}
