import { Request, Response } from "express";
import QuoteServices from "../services/quotesServices";
const QuoteController = (req: Request, res: Response) => {
  try {
    const result = QuoteServices.getQuotes(req.query.region as string);
    res.status(200).json(result);
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unexpected error", error);
    }

    res.status(500).json({ error: "Internal Server Error" });
  }
};
export default QuoteController;
