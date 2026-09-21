import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://daymark-daily.vercel.app"),
  title: { default: "Daymark — A private daily journal", template: "%s · Daymark" },
  description: "Daymark is a private daily journal for your words, photos, small promises, and the patterns that make a life.",
  keywords: ["daily journal", "private journal", "photo journal", "weekly review", "habit tracker", "daily reflection"],
  applicationName: "Daymark",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon.svg" },
  openGraph: { type: "website", siteName: "Daymark", title: "Daymark — A private daily journal", description: "A calmer way to keep your days." },
  twitter: { card: "summary", title: "Daymark — A private daily journal", description: "A calmer way to keep your days." },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
