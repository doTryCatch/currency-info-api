"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const quotesServices_1 = __importDefault(require("../services/quotesServices"));
const QuoteController = async (req, res) => {
    try {
        const region = req.query.region;
        if (!req.query.region) {
            return res.status(400).json({ error: "Region query parameter is required" });
        }
        const result = await quotesServices_1.default.getQuotes(region);
        res.status(200).json(result);
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(error.message);
        }
        else {
            console.error("Unexpected error", error);
        }
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.default = QuoteController;
