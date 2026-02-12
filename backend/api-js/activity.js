import express from "express";
import db from "../db/index.js";

const router = express.Router();

router.get("/feed", (req, res) => {
  const walletAddress = req.walletAddress || req.query?.walletAddress;
  const limit = Number(req.query?.limit || 20);

  if (!walletAddress) {
    return res.status(400).json({ error: "walletAddress or x-wallet-address is required" });
  }

  db.all(
    "SELECT id, amount, purpose FROM payments WHERE from_address = ? ORDER BY id DESC LIMIT ?",
    [walletAddress, limit],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const activity = (rows || []).map((row) => ({
        id: row.id,
        type: "sent",
        amount: Number(row.amount || 0),
        description: row.purpose || "Payment",
        category: "payment",
        timestamp: new Date().toISOString(),
      }));
      return res.json(activity);
    }
  );
});

export default router;

