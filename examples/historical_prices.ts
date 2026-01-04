
import { PolymarketExchange } from '../src/exchanges/Polymarket';
import { KalshiExchange } from '../src/exchanges/Kalshi';
import { CandleInterval } from '../src/types';

/**
 * START HERE
 * 
 * This example fetches historical price data for a specific EVENT.
 * 
 * NOTE: 
 * An "Event" (e.g. "Who will be Fed Chair?") contains multiple "Markets" or "Outcomes" 
 * (e.g. "Kevin Warsh", "Marc Rowan", "Scott Bessent").
 * 
 * Price history is tracked at the MARKET/OUTCOME level.
 */

const main = async () => {
    // 1. Define the Event Slugs (Hardcoded for simplicity)
    const polySlug = 'who-will-trump-nominate-as-fed-chair';
    const kalshiTicker = 'KXFEDCHAIRNOM-29';

    console.log(`=== Historical Price Fetcher ===\n`);
    console.log(`Target Event: Fed Chair Nomination (Kevin Warsh - YES)`);

    // ---------------------------------------------------------
    // Polymarket
    // ---------------------------------------------------------
    const polymarket = new PolymarketExchange();
    console.log('\n--- Polymarket ---');
    try {
        const polyMarkets = await polymarket.getMarketsBySlug(polySlug);

        if (polyMarkets.length > 0) {
            const eventMarket = polyMarkets[0];

            // Find "Kevin Warsh" outcome
            const warshOutcome = eventMarket.outcomes.find(o =>
                o.label.toLowerCase().includes('warsh') &&
                !o.label.toLowerCase().includes('not') // Ensure it's YES
            );

            if (!warshOutcome) {
                console.log("Could not find 'Kevin Warsh' outcome in Polymarket event.");
            } else {
                console.log(`Target Outcome: ${warshOutcome.label}`);
                console.log(`Current Price: ${(warshOutcome.price * 100).toFixed(1)}%`);

                const clobTokenId = warshOutcome.metadata?.clobTokenId;

                if (clobTokenId) {
                    console.log(`Fetching 1-hour history for "${warshOutcome.label}"...`);
                    console.log(`Token ID: ${clobTokenId}`);

                    const history = await polymarket.getMarketHistory(clobTokenId, {
                        resolution: '1h',
                        limit: 20,
                        start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
                    });

                    console.log(`Received ${history.length} data points.`);
                    history.forEach(point => {
                        const date = new Date(point.timestamp).toLocaleString();
                        console.log(`   ${date} | Price: $${point.close.toFixed(3)}`);
                    });
                } else {
                    console.log('No Token ID found, cannot fetch history.');
                }
            }
        }
    } catch (e) {
        console.error("Polymarket Error:", e);
    }

    // ---------------------------------------------------------
    // Kalshi
    // ---------------------------------------------------------
    const kalshi = new KalshiExchange();
    console.log('\n--- Kalshi ---');
    try {
        // First get the event to find the markets
        const kalshiMarkets = await kalshi.getMarketsBySlug(kalshiTicker);

        if (kalshiMarkets.length > 0) {
            // Find the market where the subtitle/title includes Warsh
            // Kalshi often has subtitles like "Kevin Warsh"
            const warshMarket = kalshiMarkets.find(m =>
                m.description.toLowerCase().includes('warsh') ||
                m.outcomes[0].label.toLowerCase().includes('warsh')
            );

            if (!warshMarket) {
                console.log("Could not find 'Kevin Warsh' market in Kalshi event.");
            } else {
                console.log(`Target Market: ${warshMarket.title} (${warshMarket.description})`);
                console.log(`Ticker: ${warshMarket.id}`);
                console.log(`Current Price: ${(warshMarket.outcomes[0].price * 100).toFixed(1)}%`);

                console.log(`Fetching 1-hour history...`);

                const history = await kalshi.getMarketHistory(warshMarket.id, {
                    resolution: '1h',
                    limit: 10
                });

                history.forEach(candle => {
                    const date = new Date(candle.timestamp).toLocaleString();
                    console.log(`   ${date} | Price: $${candle.close.toFixed(2)}`);
                });
            }
        }
    } catch (e) {
        console.error("Kalshi Error:", e);
    }
};

main();
