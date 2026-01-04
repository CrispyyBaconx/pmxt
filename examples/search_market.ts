import { PolymarketExchange } from '../src/exchanges/Polymarket';
import { KalshiExchange } from '../src/exchanges/Kalshi';

const main = async () => {
    const query = process.argv[2] || 'Fed';
    console.log(`Searching for "${query}"...\n`);

    // Polymarket
    const polymarket = new PolymarketExchange();
    const polyResults = await polymarket.searchMarkets(query, { sort: 'volume' });

    console.log(`--- Polymarket Found ${polyResults.length} ---`);
    polyResults.slice(0, 10).forEach(m => {
        const label = m.outcomes[0]?.label || 'Unknown';
        console.log(`[${m.id}] ${m.title} - ${label} (Vol24h: $${m.volume24h.toLocaleString()})`);
    });

    // Kalshi
    const kalshi = new KalshiExchange();
    const kalshiResults = await kalshi.searchMarkets(query);

    console.log(`\n--- Kalshi Found ${kalshiResults.length} ---`);
    kalshiResults.slice(0, 10).forEach(m => {
        const label = m.outcomes[0]?.label || 'Unknown';
        console.log(`[${m.id}] ${m.title} - ${label} (Vol24h: $${m.volume24h.toLocaleString()})`);
    });
};

main();
