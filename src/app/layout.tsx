import type { Metadata } from "next";
import Script from "next/script";
import { Roboto, Roboto_Slab } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SITE_NAME, SITE_URL } from "@/lib/seo";
import "./globals.css";

// Match the live site's typography: Roboto for body/UI, Roboto Slab for
// secondary headings.
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-roboto",
  display: "swap",
});
const robotoSlab = Roboto_Slab({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto-slab",
  display: "swap",
});

// metadataBase makes all relative canonical/OG URLs absolute. title.template
// gives every page the "<page> | RuralHQ" suffix without repeating it.
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Connecting Rural New Zealand`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "RuralHQ is the directory and information hub for rural New Zealand — find businesses, deals, events and jobs by category and region.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;

  return (
    <html
      lang="en"
      className={`h-full antialiased ${roboto.variable} ${robotoSlab.variable}`}
    >
      <body className="flex min-h-full flex-col bg-white text-body">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />

        {/* Load the AdSense library once, after hydration, when configured. */}
        {adsenseClient ? (
          <Script
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          />
        ) : null}
      </body>
    </html>
  );
}
