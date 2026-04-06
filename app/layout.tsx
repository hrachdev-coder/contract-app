import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";

export const metadata: Metadata = {
  title: "Client Contracts",
  description: "Create, send, and manage client contracts with ease",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Sora:wght@500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-gray-50">
        {children}
      </body>
      {googleAnalyticsId ? <GoogleAnalytics gaId={googleAnalyticsId} /> : null}
    </html>
  );
}