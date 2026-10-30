import type { Metadata } from "next";
import DrinksClient from "./drinks-client";

export const metadata: Metadata = {
  title: "Drinks",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DrinksPage() {
  return <DrinksClient />;
}
