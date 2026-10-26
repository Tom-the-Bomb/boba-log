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
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import type { ReactNode } from "react";
import { Toaster } from "sonner";
// Self-hosted, unicode-range sliced fonts: browsers fetch only the glyph
// slices a page uses, and builds never reach out to Google Fonts.
import "@fontsource/lxgw-wenkai-tc/400.css";
import "@fontsource/noto-sans-sc/300.css";
import "@fontsource/noto-sans-sc/400.css";
// The handful of Chinese glyphs English pages show (seal, scroll title,
// language toggle), so those pages skip the large CJK slices.
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
    url: SITE_URL,
    siteName: SITE_NAME,
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
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
    title: DEFAULT_SEO_TITLE,
    description: DEFAULT_SEO_DESCRIPTION,
    images: [SOCIAL_IMAGE_URL],
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

export const viewport: Viewport = {
  themeColor: "#f4f0e8",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  // The language is a cookie so the server renders the page in it.
  const locale = toLocale((await cookies()).get(LOCALE_COOKIE)?.value);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        {/* Roughens the seal's edges like a carved stone impression. */}
        <svg aria-hidden="true" width="0" height="0" className="absolute">
          <filter id="seal-carve">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.7"
              numOctaves="2"
              seed="3"
            />
            <feDisplacementMap in="SourceGraphic" scale="1.6" />
          </filter>
        </svg>
        <LocaleProvider locale={locale}>
          <ThemeProvider>
            {children}
            <Toaster
              position="bottom-center"
              toastOptions={{
                unstyled: true,
                classNames: {
                  toast:
                    "flex w-[min(26rem,calc(100vw-2rem))] items-center gap-3 rounded-lg border border-rule bg-surface px-4 py-3 text-sm text-text shadow-(--lift)",
                  error: "text-danger",
                  icon: "shrink-0",
                  // Custom toasts sit inside these; let them span the toast.
                  content: "min-w-0 flex-1",
                  title: "w-full",
                },
              }}
            />
          </ThemeProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
