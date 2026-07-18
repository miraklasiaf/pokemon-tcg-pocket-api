import CardGrid from '@/components/CardGrid';
import generateMetadata from '@/utils/generateMetadata';
import { readAllCards } from '@/lib/scraper';

/* eslint-disable react-refresh/only-export-components */
export const metadata = await generateMetadata();

export default async function Home() {
  const cards = await readAllCards();

  if (cards.length === 0) {
    return (
      <div className="binder-page">
        <div className="binder-empty">
          <h2>This binder is empty</h2>
        </div>
      </div>
    );
  }

  return <CardGrid cards={cards} />;
}
