import Link from "next/link";
import TeaCupMark from "./components/tea-cup-mark";
import TeaLeafMark from "./components/tea-leaf-mark";
import ThemeToggle from "./components/theme-toggle";

export default function Home() {
  return (
    <div className="tea-grid-bg relative flex min-h-screen flex-col">
      <header className="tea-page-padding reveal flex items-center justify-between py-8">
        <div className="flex items-center gap-3">
          <TeaLeafMark />
          <span className="tea-text-primary text-sm font-medium tracking-[0.2em] uppercase">
            Boba Tracker
          </span>
        </div>
        <nav className="flex items-center gap-3" aria-label="Primary">
          <ThemeToggle />
          <Link href="/auth" className="tea-link">
            Sign In
          </Link>
        </nav>
      </header>

      <div className="tea-line tea-page-padding" />

      <main className="tea-page-padding flex flex-1 flex-col items-start justify-center py-20">
        <div className="w-full max-w-3xl">
          <p className="reveal reveal-d1 tea-text-accent text-xs tracking-[0.35em] uppercase">
            Track &middot; Discover &middot; Savor
          </p>

          <h1 className="reveal reveal-d2 font-display tea-text-primary mt-8 text-5xl leading-[1.08] font-medium sm:text-6xl lg:text-7xl">
            Your tea,
            <br />
            <span className="tea-text-accent">your ritual.</span>
          </h1>

          <p className="reveal reveal-d3 tea-text-secondary mt-8 max-w-lg text-base leading-relaxed sm:text-lg">
            A quiet space to log your favorite tea shops, track every drink, and
            find the patterns in what you love.
          </p>

          <div className="reveal reveal-d4 mt-12 flex items-center gap-8">
            <Link
              href="/auth"
              className="tea-cta inline-block rounded-none px-8 py-3.5 text-xs tracking-[0.2em] uppercase"
            >
              Get Started
            </Link>
            <Link
              href="https://github.com/Tom-the-Bomb/boba-tracker"
              target="_blank"
              className="group tea-text-muted tea-hover-text-primary flex items-center gap-2 text-xs tracking-[0.15em] uppercase transition-colors duration-300"
            >
              Learn more
              <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </Link>
          </div>
        </div>

        <div className="reveal reveal-d5 absolute right-12 bottom-24 hidden lg:block xl:right-24">
          <TeaCupMark />
        </div>
      </main>

      <div className="tea-line tea-line-bottom tea-page-padding" />
      <footer className="tea-page-padding reveal reveal-d5 flex items-center justify-between py-8">
        <p className="tea-text-muted text-[10px] tracking-[0.25em] uppercase">
          For tea lovers
        </p>
        <p className="tea-text-muted text-[10px] tracking-[0.25em] uppercase">
          2026
        </p>
      </footer>
    </div>
  );
}
