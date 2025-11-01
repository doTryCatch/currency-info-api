import { Request, Response } from "express";
import QuoteServices from "../services/quotesServices";
const QuoteController = async (req: Request, res: Response) => {
  try {

    const region = req.query.region as "ARS" | "BRL";
     if(!req.query.region){
      return res.status(400).json({ error: "Region query parameter is required" });
    }
    const result = await QuoteServices.getQuotes(region);
    res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("QuoteController Error:", error);
      console.error("Unexpected error", error);
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};
export default QuoteController;
