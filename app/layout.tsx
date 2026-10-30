import { LOCALE_COOKIE, toLocale } from "@/i18n/locale";
import {
  APP_ICON_ALT,
  AUTHOR_NAME,
  DEFAULT_SEO_DESCRIPTION,
  DEFAULT_SEO_TITLE,
  SITE_NAME,
  SITE_URL,
  SOCIAL_IMAGE_URL,
} from "@/lib/site";
import "@fontsource/lxgw-wenkai-tc/400.css";
import "@fontsource/noto-sans-sc/300.css";
import "@fontsource/noto-sans-sc/400.css";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import type { CSSProperties, ReactNode } from "react";
import { Toaster } from "sonner";
import { SealCarveFilter } from "./components/brand/seal-mark";
import "./fonts/marks.css";
import "./globals.css";
import LocaleProvider from "./providers/locale-provider";
import { ThemeProvider } from "./providers/theme-provider";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_SEO_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_SEO_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: AUTHOR_NAME, url: SITE_URL }],
  creator: AUTHOR_NAME,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    images: [
      {
        url: SOCIAL_IMAGE_URL,
        width: 512,
        height: 512,
        alt: APP_ICON_ALT,
      },
    ],
  },
  twitter: {
    card: "summary",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    shortcut: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  category: "productivity",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <SealCarveFilter />
        <LocaleProvider locale={locale}>
          <ThemeProvider>
            <div className="paper">{children}</div>
            <Toaster
              position="bottom-center"
              style={{ "--width": "26rem" } as CSSProperties}
              toastOptions={{
                unstyled: true,
                classNames: {
                  toast:
                    "flex w-full items-center gap-3 rounded-lg border border-rule bg-surface px-4 py-3 font-sans text-sm shadow-(--lift)",
                  error: "text-danger",
                  content: "min-w-0 flex-1",
                },
              }}
            />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
