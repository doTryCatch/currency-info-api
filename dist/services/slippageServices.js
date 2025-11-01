"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlippageService = void 0;
// services/SlippageService.ts
const quotesServices_1 = __importDefault(require("./quotesServices")); // Adjust path as needed
const averageServices_1 = __importDefault(require("./averageServices"));
class SlippageService {
    async getSlippage(region) {
        const quotes = await quotesServices_1.default.getQuotes(region);
        const average = await averageServices_1.default.getAverage(region);
        const validQuotes = quotes.filter((q) => q.buy_price > 0 && q.sell_price > 0);
        if (validQuotes.length === 0) {
            throw new Error("No valid quotes available");
        }
        return validQuotes.map((q) => ({
            buy_price_slippage: parseFloat((((q.buy_price - average.average_buy_price) /
                average.average_buy_price) *
                100).toFixed(2)),
            sell_price_slippage: parseFloat((((q.sell_price - average.average_sell_price) /
                average.average_sell_price) *
                100).toFixed(2)),
            source: q.source,
        }));
    }
}
exports.SlippageService = SlippageService;
exports.default = new SlippageService();
