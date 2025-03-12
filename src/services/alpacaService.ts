
// Alpaca API service for fetching real market data
const apiKey = 'PKKM3YOXZW9RGFKNRBKC';
const secretKey = 'SZhLbm93gJfmjiBq4PwbAD3QKnBKK6VThaX7WHDE';
const baseUrl = 'https://data.alpaca.markets/v2/stocks';
const symbol = 'SPY';

interface QuoteData {
  symbol: string;
  last: {
    price: number;
    size: number;
    timestamp: number;
  };
  askprice?: number;
  asksize?: number;
  bidprice?: number;
  bidsize?: number;
  timestamp?: number;
}

export async function getRealTimePrice(): Promise<number | null> {
  try {
    const url = `${baseUrl}/${symbol}/quotes`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': secretKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('Error fetching price:', response.statusText);
      return null;
    }

    const data: QuoteData = await response.json();
    console.log(`Current price of ${symbol}: $${data.last.price}`);
    return data.last.price;
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
