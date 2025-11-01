// services/AverageService.ts
import QuoteService from "./quotesServices";

interface AverageDTO {
  average_buy_price: number;
  average_sell_price: number;
}

export class AverageService {
  async getAverage(region: string): Promise<AverageDTO> {
    const quotes = await QuoteService.getQuotes(region);
    const validQuotes = quotes.filter(
      (q) => q.buy_price > 0 && q.sell_price > 0
    );

    if (validQuotes.length === 0) {
      throw new Error("No valid quotes available");
    }

    const totalBuy = validQuotes.reduce((sum, q) => sum + q.buy_price, 0);
    const totalSell = validQuotes.reduce((sum, q) => sum + q.sell_price, 0);

    return {
      average_buy_price: parseFloat((totalBuy / validQuotes.length).toFixed(2)),
      average_sell_price: parseFloat(
        (totalSell / validQuotes.length).toFixed(2)
      ),
    };
  }
}

export default new AverageService();
