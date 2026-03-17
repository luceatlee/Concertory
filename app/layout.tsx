import type { Metadata } from "next";
import { Bebas_Neue, Cormorant_Garamond, Inter, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import Script from "next/script";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-display",
  subsets: ["latin"],
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  subsets: ["latin"],
});

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-en",
  subsets: ["latin"],
});

const notoSansKR = Noto_Sans_KR({
  weight: ["300", "400", "500", "700"],
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CONCERTORY",
  description: "K-POP 콘서트 무대 아카이빙 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${bebasNeue.variable} ${cormorantGaramond.variable} ${inter.variable} ${notoSansKR.variable}`}
      >
        <Header />
        {children}
        <Footer />
        <Analytics />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-T5BL59SYTY"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T5BL59SYTY');
          `}
        </Script>
      </body>
    </html>
  );
}