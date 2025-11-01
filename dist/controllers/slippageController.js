"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slippageServices_1 = __importDefault(require("../services/slippageServices"));
const SlippageController = async (req, res) => {
    try {
        if (!req.query.region) {
            return res
                .status(400)
                .json({ error: "Region query parameter is required" });
        }
        const result = await slippageServices_1.default.getSlippage(req.query.region);
        res.status(200).json(result);
    }
    catch (error) {
        console.error("SlippageController Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.default = SlippageController;
