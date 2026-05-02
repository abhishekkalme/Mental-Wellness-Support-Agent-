import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "MindCare AI | Your Personal Wellness Agent",
  description: "An AI-powered mental wellness platform for emotional support, journaling, and mood tracking.",
  openGraph: {
    title: "MindCare AI",
    description: "Your safe space for mental wellness and AI-guided emotional support.",
    url: "https://mindcare.ai",
    siteName: "MindCare AI",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "MindCare AI",
    description: "Your personal AI wellness agent.",
    images: ["/og-image.png"],
  },
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${nunito.variable} antialiased selection:bg-primary/30 min-h-screen flex flex-col`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
