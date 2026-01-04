# pmxt

**The ccxt for prediction markets.** A unified API for accessing prediction market data across multiple exchanges.

## Why pmxt?

Different prediction market platforms have different APIs, data formats, and conventions. pmxt provides a single, consistent interface to work with all of them.

## Quick Example

Search for markets across Polymarket and Kalshi using the same API:

```typescript
import { PolymarketExchange, KalshiExchange } from 'pmxtjs';

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
```

## Installation

```bash
npm install pmxtjs
```

## Supported Exchanges

- Polymarket
- Kalshi

## Documentation

See the [API Reference](pmxt/API_REFERENCE.md) for detailed documentation and more examples.

## Examples

Check out the [examples](pmxt/examples/) directory for more use cases:
- Market search
- Order book data
- Historical prices
- Event price tracking
- Recent trades
