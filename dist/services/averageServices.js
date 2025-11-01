"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AverageService = void 0;
// services/AverageService.ts
const quotesServices_1 = __importDefault(require("./quotesServices"));
class AverageService {
    async getAverage(region) {
        const quotes = await quotesServices_1.default.getQuotes(region);
        const validQuotes = quotes.filter((q) => q.buy_price > 0 && q.sell_price > 0);
        if (validQuotes.length === 0) {
            throw new Error("No valid quotes available");
        }
        const totalBuy = validQuotes.reduce((sum, q) => sum + q.buy_price, 0);
        const totalSell = validQuotes.reduce((sum, q) => sum + q.sell_price, 0);
        return {
            average_buy_price: parseFloat((totalBuy / validQuotes.length).toFixed(2)),
            average_sell_price: parseFloat((totalSell / validQuotes.length).toFixed(2)),
        };
    }
}
exports.AverageService = AverageService;
exports.default = new AverageService();
