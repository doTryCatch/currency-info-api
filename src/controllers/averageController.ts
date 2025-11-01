import { Request, Response } from "express";
import AverageService from "../services/averageServices";
const AverageController = async (req: Request, res: Response) => {
  try {
    if (!req.query.region) {
      return res
        .status(400)
        .json({ error: "Region query parameter is required" });
    }
    const result = await AverageService.getAverage(
      req.query.region as "ARS" | "BRL",
    );
    res.status(200).json(result);
  } catch (error) {
    console.error("AverageController Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export default AverageController;
