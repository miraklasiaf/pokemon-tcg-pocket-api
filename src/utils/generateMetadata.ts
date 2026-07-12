import type { Metadata } from 'next';

async function generateMetadata(): Promise<Metadata> {
  return {
    metadataBase: new URL('https://ptcgp.miraklasiaf.com'),
    alternates: {
      canonical: '/'
    },
    title: {
      default: 'Pokemon TCG Pocket Card Database',
      template: '%s / PTCGP Database'
    },
    description:
      'An open-source dataset and browsable web app for Pokémon TCG Pocket cards — search, filter, and explore every card by set, rarity, and pack.',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      }
    }
  };
}

export default generateMetadata;
