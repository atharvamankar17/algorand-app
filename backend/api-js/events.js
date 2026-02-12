// api-js/events.js
import express from "express";
import db from "../db/index.js";
import { transferTicket } from "../config/algorand.js";

const router = express.Router();

// GET /api/events
router.get("/", (req, res) => {
  db.all("SELECT id, event_name, asa_id, price, owner FROM tickets", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const events = (rows || []).map((row) => ({
      ...row,
      title: row.event_name,
      eventTitle: row.event_name,
      asaId: row.asa_id,
    }));
    res.json(events);
  });
});

// POST /api/events/:eventId/tickets/buy
router.post("/:eventId/tickets/buy", async (req, res) => {
  try {
    const { eventId } = req.params;
    const buyerAddress = req.walletAddress || req.body?.buyerAddress;

    if (!buyerAddress) {
      return res.status(400).json({ error: "Buyer wallet address is required." });
    }

    // Find ASA id for this event
    db.get("SELECT asa_id FROM tickets WHERE id = ?", [eventId], async (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Event not found" });

      const asaId = row.asa_id;

      // transferTicket will throw if buyer not opted-in; frontend should handle opt-in
      await transferTicket(asaId, buyerAddress);

      db.run("UPDATE tickets SET owner = ? WHERE id = ?", [buyerAddress, eventId]);

      res.json({ success: true, asaId });
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Buy failed", details: err.message });
  }
});

export default router;
