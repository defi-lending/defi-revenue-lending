import { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method !== "POST") throw new Error("This is a POST request");

    const stripeKey = req.body.stripeKey;
    if (!stripeKey) throw new Error("No stripe key provided");
    const report = await axios.get(
      `https://revenue-based-loan-nft.herokuapp.com/borrowers/${stripeKey}/stripe_reports`
    );

    const data = report.data;
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
}
