"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const quotesController_1 = __importDefault(require("../controllers/quotesController"));
const averageController_1 = __importDefault(require("../controllers/averageController"));
const slippageController_1 = __importDefault(require("../controllers/slippageController"));
const router = (0, express_1.Router)();
router.get("/quotes", quotesController_1.default);
router.get("/average", averageController_1.default);
router.get("/slippage", slippageController_1.default);
exports.default = router;
