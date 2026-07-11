import CardGrid from '../components/CardGrid';
import { readAllCards } from '../lib/scraper';

export default async function Home() {
  const cards = await readAllCards();

  if (cards.length === 0) {
    return (
      <div className="binder-page">
        <div className="binder-empty">
          <h2>This binder is empty</h2>
          <p>
            No cards have been scraped yet. From your local machine, run the scraper for
            an expansion, then commit and push the results:
          </p>
          <p>
            <code>npm run scrape -- B2b</code>
          </p>
          <p>
            <code>git add -A && git commit -m &quot;Add cards&quot; && git push</code>
          </p>
        </div>
      </div>
    );
  }

  return <CardGrid cards={cards} />;
}
