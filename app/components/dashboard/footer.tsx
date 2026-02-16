import { FOOTER_TAGLINE, FOOTER_YEAR } from "@/lib/site";

export default function Footer() {
  return (
    <>
      <div className="tea-line tea-line-bottom tea-page-padding" />
      <footer className="tea-page-padding flex items-center justify-between py-8">
        <p className="tea-text-muted tea-caps-10-wide">{FOOTER_TAGLINE}</p>
        <p className="tea-text-muted tea-caps-10-wide">{FOOTER_YEAR}</p>
      </footer>
    </>
  );
}
