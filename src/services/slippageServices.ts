// services/SlippageService.ts
import QuoteService from "./quotesServices"; // Adjust path as needed
import AverageService from "./averageServices";

interface SlippageDTO {
  buy_price_slippage: number;
  sell_price_slippage: number;
  source: string;
}

export class SlippageService {
  async getSlippage(region: string): Promise<SlippageDTO[]> {
    const quotes = await QuoteService.getQuotes(region);
    const average = await AverageService.getAverage(region);

    const validQuotes = quotes.filter(
      (q) => q.buy_price > 0 && q.sell_price > 0,
    );

    if (validQuotes.length === 0) {
      throw new Error("No valid quotes available");
    }

    return validQuotes.map((q) => ({
      buy_price_slippage: parseFloat(
        (
          ((q.buy_price - average.average_buy_price) /
            average.average_buy_price) *
          100
        ).toFixed(2),
      ),
      sell_price_slippage: parseFloat(
        (
          ((q.sell_price - average.average_sell_price) /
            average.average_sell_price) *
          100
        ).toFixed(2),
      ),
      source: q.source,
    }));
  }
}

export default new SlippageService();
