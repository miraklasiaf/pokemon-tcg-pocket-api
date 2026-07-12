import CardGrid from '@/components/CardGrid';
import { readAllCards } from '@/lib/scraper';

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
