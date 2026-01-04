import { PolymarketExchange } from '../src/exchanges/Polymarket';
import { KalshiExchange } from '../src/exchanges/Kalshi';
import { UnifiedMarket } from '../src/types';

interface UnifiedEvent {
    title: string;
    url: string;
    volume24h: number; // Aggregated
    markets: UnifiedMarket[];
}

const groupMarketsByEvent = (markets: UnifiedMarket[]): UnifiedEvent[] => {
    const eventsMap = new Map<string, UnifiedEvent>();

    for (const m of markets) {
        if (!eventsMap.has(m.url)) {
            eventsMap.set(m.url, {
                title: m.title,
                url: m.url,
                volume24h: 0,
                markets: []
            });
        }
        const event = eventsMap.get(m.url)!;
        event.volume24h += m.volume24h;
        event.markets.push(m);
    }

    return Array.from(eventsMap.values());
};

const main = async () => {
    const query = process.argv[2] || 'Fed';
    console.log(`Searching for Events matching "${query}"...\n`);

    // 1. Polymarket
    const polymarket = new PolymarketExchange();
    // Polymarket returns many sub-markets per event
    const polyMarkets = await polymarket.searchMarkets(query, { sort: 'volume' });
    const polyEvents = groupMarketsByEvent(polyMarkets);

    console.log(`--- Polymarket Events (${polyEvents.length}) ---`);
    polyEvents
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 5)
        .forEach(e => {
            console.log(`${e.title} (Vol24h: $${e.volume24h.toLocaleString()})`);
            console.log(`   -> ${e.markets.length} sub-markets`);
        });

    console.log('');

    // 2. Kalshi
    const kalshi = new KalshiExchange();
    const kalshiMarkets = await kalshi.searchMarkets(query);
    const kalshiEvents = groupMarketsByEvent(kalshiMarkets);

    console.log(`--- Kalshi Events (${kalshiEvents.length}) ---`);
    kalshiEvents
        .sort((a, b) => b.volume24h - a.volume24h)
        .slice(0, 5)
        .forEach(e => {
            console.log(`${e.title} (Vol24h: $${e.volume24h.toLocaleString()})`);
            console.log(`   -> ${e.markets.length} sub-markets`);
        });
};

main();
