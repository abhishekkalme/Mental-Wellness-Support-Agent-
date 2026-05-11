import type { Metadata } from 'next';
import { Inter, Nunito } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3000'),
  title: 'MindCare AI | Your Personal Wellness Agent',
  description:
    'An AI-powered mental wellness platform for emotional support, journaling, and mood tracking.',
  openGraph: {
    title: 'MindCare AI',
    description: 'Your safe space for mental wellness and AI-guided emotional support.',
    url: 'https://mindcare.ai',
    siteName: 'MindCare AI',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MindCare AI',
    description: 'Your personal AI wellness agent.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${nunito.variable} antialiased selection:bg-primary/30 min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:bg-[#E2FF6F] focus:text-black focus:px-6 focus:py-3 focus:rounded-xl focus:font-bold focus:text-sm focus:shadow-xl"
        >
          Skip to main content
        </a>
        <ErrorBoundary>
          <Providers>{children}</Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
