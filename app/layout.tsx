import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Tiro_Devanagari_Hindi } from "next/font/google";
import "./globals.css";
import { MotionProvider } from "@/components/motion/MotionProvider";
import { ConciergeProvider } from "@/components/concierge/ConciergeContext";

const cormorantGaramond = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
  preload: true,
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const tiroDevanagari = Tiro_Devanagari_Hindi({
  subsets: ["devanagari", "latin"],
  weight: ["400"],
  variable: "--font-devanagari",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "The Wedding Dreams — A Complete Event Solution",
  description:
    "An ultra-luxury, concierge-led Indian wedding planning and curated venue & vendor showcase across Delhi NCR, Jaipur, Udaipur, and Goa.",
  openGraph: {
    title: "The Wedding Dreams — A Complete Event Solution",
    description:
      "Curated heritage palaces, bespoke couture, and one dedicated concierge team orchestrating every Indian wedding celebration.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Wedding Dreams — A Complete Event Solution",
    description:
      "Ultra-luxury, concierge-led Indian wedding planning and verified venue & vendor discovery.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorantGaramond.variable} ${jost.variable} ${tiroDevanagari.variable}`}
    >
      <body
        suppressHydrationWarning
        className="bg-ivory text-ink font-sans antialiased selection:bg-lotus-soft selection:text-ink"
      >
        <MotionProvider>
          <ConciergeProvider>{children}</ConciergeProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
