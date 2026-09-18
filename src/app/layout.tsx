import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import { CustomCursor } from "@/components/animation/CustomCursor";
import { PageTransition } from "@/components/animation/PageTransition";
import { Preloader } from "@/components/animation/Preloader";
import { SmoothScroll } from "@/components/animation/SmoothScroll";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { siteConfig } from "@/config/site";
import "./globals.css";

// Cormorant Garamond was dropped: Chrome detached its French accents from their letters
const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    template: `%s | ${siteConfig.name}`,
    default: `${siteConfig.name} | Musée d’art à New York`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    siteName: siteConfig.name,
    locale: "fr_FR",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    // Without it Google shows a thumbnail at most, which wastes a catalogue of paintings in the results
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="fr" className={`${display.variable} ${sans.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <noscript>
          <style>{"[data-text-reveal]{visibility:visible}[data-image-reveal]{clip-path:none}[data-preloader]{display:none}"}</style>
        </noscript>
        <Preloader />
        <PageTransition />
        <SmoothScroll />
        <CustomCursor />
        <a
          href="#contenu"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-ink focus:px-5 focus:py-2 focus:text-paper"
        >
          Aller au contenu
        </a>
        <Header />
        <main id="contenu" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
