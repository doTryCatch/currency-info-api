import { Router } from "express";
import quotesController from "../controllers/quotesController";
import averageController from "../controllers/averageController";
import slippageController from "../controllers/slippageController";
const router = Router();
router.get("/quotes", quotesController);
router.get("/average", averageController);
router.get("/slippage", slippageController);

export default router;
