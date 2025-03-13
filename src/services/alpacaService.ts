
// Alpaca API service for fetching real market data
const apiKey = 'PKKM3YOXZW9RGFKNRBKC';
const secretKey = 'SZhLbm93gJfmjiBq4PwbAD3QKnBKK6VThaX7WHDE';
const baseUrl = 'https://data.alpaca.markets/v2/stocks';
const symbol = 'SPY';

interface Quote {
  ap: number; // Ask price
  as: number; // Ask size
  ax: string; // Ask exchange
  bp: number; // Bid price
  bs: number; // Bid size
  bx: string; // Bid exchange
  c: string[]; // Conditions
  t: string; // Timestamp
  z: string; // Exchange
}

interface QuoteResponse {
  quote: Quote;
  symbol: string; // Stock symbol
}

export async function getRealTimePrice(): Promise<number | null> {
  try {
    const url = `${baseUrl}/${symbol}/quotes/latest`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': secretKey,
        'accept': 'application/json',
      }
    });

    if (!response.ok) {
      console.error('Error fetching price:', response.statusText);
      return null;
    }

    const data: QuoteResponse = await response.json();
    console.log(data);
    return data.quote.ap;
  } catch (error) {
    console.error('Failed to fetch SPY price:', error);
    return null;
  }
}

// Helper function to get a mock price if the API call fails
export function getFallbackPrice(lastPrice: number): number {
  // Small random adjustment to simulate market movement
  const change = (Math.random() * 0.2 - 0.1); 
  return parseFloat((lastPrice + change).toFixed(2));
}
