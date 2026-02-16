import { FOOTER_TAGLINE, FOOTER_YEAR } from "@/lib/site";

export default function Footer() {
  return (
    <footer className="tea-page-padding reveal reveal-d5 flex items-center justify-between py-5 sm:py-8">
      <p className="tea-text-muted tea-caps-10 sm:tracking-[0.25em]">
        {FOOTER_TAGLINE}
      </p>
      <p className="tea-text-muted tea-caps-10 sm:tracking-[0.25em]">
        {FOOTER_YEAR}
      </p>
    </footer>
  );
}
