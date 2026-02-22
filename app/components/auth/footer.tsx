import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function AuthFooter() {
  const { t } = useTranslation("common");

  return (
    <>
      <div className="tea-line tea-line-bottom tea-page-padding-sm" />
      <footer className="tea-page-padding-sm flex items-center justify-between py-6">
        <p className="tea-caps-10-wide text-tea-faint">{t("siteName")}</p>
        <Link href="/" className="tea-link text-[10px]">
          &larr; {t("home")}
        </Link>
      </footer>
    </>
  );
}
