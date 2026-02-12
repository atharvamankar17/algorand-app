import express from "express";
import db from "../db/index.js";

const router = express.Router();

router.post("/record", (req, res) => {
  const fromAddress = req.walletAddress || req.body?.fromAddress;
  const { amount, purpose } = req.body;

  if (!fromAddress) {
    return res.status(400).json({ error: "fromAddress or x-wallet-address is required" });
  }

  db.run(
    "INSERT INTO payments (from_address, amount, purpose) VALUES (?, ?, ?)",
    [fromAddress, amount, purpose]
  );

  res.json({ recorded: true });
});

export default router;
