import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { getConfiguredAppUrl } from "@/lib/app-url";

const appUrl = getConfiguredAppUrl();

export const metadata: Metadata = {
  title: "Contrakt | Client Contracts for Service Teams",
  description: "Create, send, review, and track client contracts with approval links, signatures, and audit-ready records.",
  metadataBase: new URL(appUrl),
  applicationName: "Contrakt",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Contrakt | Client Contracts for Service Teams",
    description: "Create, send, review, and track client contracts with approval links, signatures, and audit-ready records.",
    url: appUrl,
    siteName: "Contrakt",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contrakt | Client Contracts for Service Teams",
    description: "Create, send, review, and track client contracts with approval links, signatures, and audit-ready records.",
  },
};

const googleAnalyticsId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#f8fafc" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700&display=swap" rel="stylesheet" />
        {googleAnalyticsId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${googleAnalyticsId}');`}
            </Script>
          </>
        ) : null}
      </head>
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}