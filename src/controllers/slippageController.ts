import { Request, Response } from "express";

import slippageServices from "../services/slippageServices";
const SlippageController = async (req: Request, res: Response) => {
  try {
    if (!req.query.region) {
      return res
        .status(400)
        .json({ error: "Region query parameter is required" });
    }
    const result = await slippageServices.getSlippage(
      req.query.region as "ARS" | "BRL",
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("SlippageController Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export default SlippageController;
