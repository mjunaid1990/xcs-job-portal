import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { CurrencyProvider } from "@/components/providers/currency-provider";
import { adminService } from "@/server/services/admin.service";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WorkWasl · Milestone Escrow Freelance Marketplace",
    template: "%s · WorkWasl",
  },
  description:
    "Hire world-class freelance specialists and get paid with milestone-based escrow protection and audited double-entry accounting.",
  metadataBase: new URL(process.env.APP_URL || "https://workwasl.com"),
  keywords: [
    "freelance marketplace",
    "hire developers",
    "milestone escrow",
    "contract work",
    "freelance platform",
    "secure payments",
  ],
  authors: [{ name: "WorkWasl Team" }],
  openGraph: {
    title: "WorkWasl · Production-Grade Freelance Marketplace",
    description:
      "Milestone-based escrow, double-entry financial ledger auditing, and verifiable freelance contracts.",
    siteName: "WorkWasl",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WorkWasl Freelance Marketplace",
    description:
      "Milestone-based escrow, double-entry financial ledger auditing, and verifiable freelance contracts.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [nonceHeader, currencyConfig] = await Promise.all([
    headers(),
    adminService.getPlatformCurrency(),
  ]);
  const nonce = nonceHeader.get("x-nonce") ?? undefined;

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        data-nonce={nonce}
      >
        <CurrencyProvider currency={currencyConfig.currency} symbol={currencyConfig.symbol}>
          {children}
        </CurrencyProvider>
        <CookieBanner />
        <Toaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
