import '@/styles/globals.css';

import { Geist, Geist_Mono } from 'next/font/google';

import { TradeListProvider } from '@/context/TradeListContext';
import generateMetadata from '@/utils/generateMetadata';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
});

/* eslint-disable react-refresh/only-export-components */
export const metadata = await generateMetadata();

export default function RootLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body
        className="flex min-h-full flex-col"
        suppressHydrationWarning
      >
        <TradeListProvider>
          <div className="flex-1">{children}</div>
        </TradeListProvider>
        <footer className="border-t border-gray-200 px-4 py-6 text-center text-xs text-gray-500">
          <p>
            Built by{' '}
            <a
              href="https://github.com/miraklasiaf"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-gray-700 hover:underline"
            >
              miraklasiaf
            </a>
          </p>
          <p className="mx-auto mt-2 max-w-2xl">
            Pokémon TCG Pocket card images, names, and text are property of The Pokémon
            Company, DeNA Co., Ltd., and Creatures Inc. This is an unofficial, fan-made
            site with no affiliation to or endorsement from those companies.
          </p>
        </footer>
      </body>
    </html>
  );
}
