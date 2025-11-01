"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const slippageServices_1 = __importDefault(require("../services/slippageServices"));
const SlippageController = async (req, res) => {
    try {
        const result = await slippageServices_1.default.getSlippage(req.query.region);
        res.status(200).json(result);
    }
    catch (error) {
        res.status(500).json({ error: "Internal Server Error" });
    }
};
exports.default = SlippageController;
