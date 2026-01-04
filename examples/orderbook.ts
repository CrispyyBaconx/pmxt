
import { PolymarketExchange } from '../src/exchanges/Polymarket';
import { KalshiExchange } from '../src/exchanges/Kalshi';
import { OrderBook } from '../src/types';

/**
 * Example: Get Order Book (Multi-Exchange)
 * 
 * This example fetches and compares order books from both Polymarket and Kalshi
 * for the "Kevin Warsh" Fed Chair nomination prediction.
 */

// Helper to display an order book
const displayOrderBook = (exchangeName: string, book: OrderBook) => {
    console.log(`\n-----------------------------------------`);
    console.log(`ORDER BOOK: ${exchangeName}`);
    console.log(`-----------------------------------------`);

    if (book.bids.length === 0 && book.asks.length === 0) {
        console.log("No orders found or market is closed.");
        return;
    }

    // Show Asks (Sellers) - Reverse to show highest price (lowest/best ask) at bottom
    console.log(`\n   --- ASKS (Sellers) ---`);
    const asks = book.asks.slice(0, 5).sort((a, b) => b.price - a.price); // Sort descending for display (high to low)
    asks.forEach(level => {
        console.log(`   Price: $${level.price.toFixed(2)} | Size: ${level.size.toLocaleString().padStart(8)}`);
    });

    // Show Bids (Buyers) - Descending (Highest/best buy first)
    console.log(`   --- BIDS (Buyers)  ---`);
    const bids = book.bids.slice(0, 5).sort((a, b) => b.price - a.price);
    bids.forEach(level => {
        console.log(`   Price: $${level.price.toFixed(2)} | Size: ${level.size.toLocaleString().padStart(8)}`);
    });
};

const main = async () => {
    console.log(`=== Multi-Exchange Order Book Fetcher ===`);
    console.log(`Target: "Kevin Warsh" -> Fed Chair Nomination\n`);

    // 1. Polymarket
    try {
        const polymarket = new PolymarketExchange();
        const polySlug = 'who-will-trump-nominate-as-fed-chair';

        console.log(`Fetching Polymarket data...`);
        const markets = await polymarket.getMarketsBySlug(polySlug);

        if (markets.length > 0) {
            const warshOutcome = markets[0].outcomes.find(o =>
                o.label.toLowerCase().includes('warsh') &&
                !o.label.toLowerCase().includes('not')
            );

            if (warshOutcome && warshOutcome.metadata?.clobTokenId) {
                const book = await polymarket.getOrderBook(warshOutcome.metadata.clobTokenId);
                displayOrderBook('Polymarket', book);
            } else {
                console.log("Polymarket: Outcome or Token ID not found.");
            }
        }
    } catch (e) {
        console.error("Polymarket Error:", e);
    }

    // 2. Kalshi
    try {
        const kalshi = new KalshiExchange();
        // Specifically for "Kevin Warsh" in the Fed Chair market.
        // Ticker derived from previous searches.
        const kalshiTicker = 'KXFEDCHAIRNOM-29';

        console.log(`\nFetching Kalshi data...`);
        // Verify event exists and find the specific market
        const markets = await kalshi.getMarketsBySlug(kalshiTicker);

        if (markets.length > 0) {
            // Find "Kevin Warsh" market within the event group
            const warshMarket = markets.find(m =>
                m.description.toLowerCase().includes('warsh') ||
                m.outcomes[0].label.toLowerCase().includes('warsh')
            );

            if (warshMarket) {
                console.log(`Found Market Ticker: ${warshMarket.id}`);
                const book = await kalshi.getOrderBook(warshMarket.id);
                displayOrderBook('Kalshi', book);
            } else {
                console.log("Kalshi: 'Kevin Warsh' market not found in event.");
            }
        } else {
            console.log("Kalshi: Event not found.");
        }

    } catch (e) {
        console.error("Kalshi Error:", e);
    }
};

main();
