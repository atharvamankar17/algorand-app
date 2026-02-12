// api-js/analysis.js
import express from "express";
import { authMiddleware } from "../middleware/auth.js";
import { getSpendingReport } from "../analysis/spending.js";
import db from "../db/index.js";

const router = express.Router();

router.get("/spending", authMiddleware, getSpendingReport);

router.get("/net-balance", (req, res) => {
  const walletAddress = req.walletAddress || req.query?.walletAddress;

  if (!walletAddress) {
    return res.status(400).json({ error: "walletAddress or x-wallet-address is required" });
  }

  db.get(
    "SELECT COALESCE(SUM(amount), 0) AS totalSpent FROM payments WHERE from_address = ?",
    [walletAddress],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });

      const totalSpent = Number(row?.totalSpent || 0);
      return res.json({
        walletAddress,
        totalSpent,
        totalReceived: 0,
        netBalance: -totalSpent,
        avgDaily: 0,
        momChange: 0,
      });
    }
  );
});

router.get("/category-breakdown", (_req, res) => {
  res.json([]);
});

router.get("/trends", (_req, res) => {
  res.json([]);
});

router.get("/transactions", (req, res) => {
  const walletAddress = req.walletAddress || req.query?.walletAddress;

  if (!walletAddress) {
    return res.status(400).json({ error: "walletAddress or x-wallet-address is required" });
  }

  db.all(
    "SELECT id, amount, purpose, from_address FROM payments WHERE from_address = ? ORDER BY id DESC LIMIT 50",
    [walletAddress],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const items = (rows || []).map((row) => ({
        id: row.id,
        description: row.purpose || "Payment",
        amount: -Math.abs(Number(row.amount || 0)),
        type: "sent",
        category: "payment",
        date: new Date().toISOString(),
      }));
      return res.json({ items });
    }
  );
});

export default router;
