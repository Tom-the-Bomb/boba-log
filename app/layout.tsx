import type { Metadata } from "next";
import { Bricolage_Grotesque, Sora } from "next/font/google";
import "./globals.css";
import UserProvider from "./providers/user-provider";
import { ThemeProvider } from "./providers/theme-provider";

const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Boba Tracker",
  description: "Track boba shop drinks with daily trends",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${bricolage.variable} ${sora.variable} antialiased`}>
        <ThemeProvider>
          <UserProvider>{children}</UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
