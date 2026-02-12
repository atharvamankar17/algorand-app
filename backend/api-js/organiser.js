// api-js/organiser.js
import express from "express";
import db from "../db/index.js";
import { createTicketASA } from "../config/algorand.js";

const router = express.Router();

// GET /api/organiser/events - Get all events created by organiser
router.get("/events", (req, res) => {
  const organiserAddress = req.walletAddress || req.body?.organiserAddress;

  if (!organiserAddress) {
    return res.status(400).json({ error: "Organiser wallet address is required." });
  }

  db.all(
    "SELECT id, event_name, description, date, location, capacity, ticket_price, asa_id, owner FROM tickets WHERE owner = ?",
    [organiserAddress],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const events = (rows || []).map((row) => ({
        ...row,
        title: row.event_name,
        price: row.ticket_price,
        asaId: row.asa_id,
      }));
      res.json(events);
    }
  );
});

// POST /api/organiser/events/create - Create a new event
router.post("/events/create", async (req, res) => {
  try {
    const { eventName, description, date, location, capacity, ticketPrice, image } = req.body;
    const organiserAddress = req.walletAddress || req.body?.organiserAddress;

    if (!organiserAddress) {
      return res.status(400).json({ error: "Organiser wallet address is required." });
    }

    if (!eventName || !date || !capacity || !ticketPrice) {
      return res.status(400).json({ error: "Missing required fields: eventName, date, capacity, ticketPrice" });
    }

    // Create ASA for this event's tickets
    const asaId = await createTicketASA(eventName, capacity);

    // Insert event into database
    db.run(
      `INSERT INTO tickets (event_name, description, date, location, capacity, ticket_price, asa_id, owner, image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [eventName, description || null, date, location || null, capacity, ticketPrice, asaId, organiserAddress, image || null],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          success: true,
          eventId: this.lastID,
          asaId,
          message: "Event created successfully",
        });
      }
    );
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Event creation failed", details: err.message });
  }
});

// GET /api/organiser/events/:eventId - Get event details
router.get("/events/:eventId", (req, res) => {
  const { eventId } = req.params;

  db.get(
    "SELECT id, event_name, description, date, location, capacity, ticket_price, asa_id, owner FROM tickets WHERE id = ?",
    [eventId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Event not found" });

      res.json({
        ...row,
        title: row.event_name,
        price: row.ticket_price,
        asaId: row.asa_id,
      });
    }
  );
});

// PUT /api/organiser/events/:eventId - Update event details
router.put("/events/:eventId", (req, res) => {
  try {
    const { eventId } = req.params;
    const organiserAddress = req.walletAddress || req.body?.organiserAddress;
    const { eventName, description, date, location, capacity, ticketPrice, image } = req.body;

    if (!organiserAddress) {
      return res.status(400).json({ error: "Organiser wallet address is required." });
    }

    // Verify ownership
    db.get("SELECT owner FROM tickets WHERE id = ?", [eventId], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Event not found" });
      if (row.owner !== organiserAddress) {
        return res.status(403).json({ error: "Unauthorized: You don't own this event" });
      }

      db.run(
        `UPDATE tickets SET event_name = ?, description = ?, date = ?, location = ?, capacity = ?, ticket_price = ?, image = ? WHERE id = ?`,
        [eventName, description, date, location, capacity, ticketPrice, image, eventId],
        (err) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json({ success: true, message: "Event updated successfully" });
        }
      );
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Update failed", details: err.message });
  }
});

// DELETE /api/organiser/events/:eventId - Delete event
router.delete("/events/:eventId", (req, res) => {
  try {
    const { eventId } = req.params;
    const organiserAddress = req.walletAddress || req.body?.organiserAddress;

    if (!organiserAddress) {
      return res.status(400).json({ error: "Organiser wallet address is required." });
    }

    // Verify ownership
    db.get("SELECT owner FROM tickets WHERE id = ?", [eventId], (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!row) return res.status(404).json({ error: "Event not found" });
      if (row.owner !== organiserAddress) {
        return res.status(403).json({ error: "Unauthorized: You don't own this event" });
      }

      db.run("DELETE FROM tickets WHERE id = ?", [eventId], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Event deleted successfully" });
      });
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "Deletion failed", details: err.message });
  }
});

// GET /api/organiser/events/:eventId/attendees - Get event attendees
router.get("/events/:eventId/attendees", (req, res) => {
  const { eventId } = req.params;
  const organiserAddress = req.walletAddress || req.body?.organiserAddress;

  if (!organiserAddress) {
    return res.status(400).json({ error: "Organiser wallet address is required." });
  }

  // Verify ownership
  db.get("SELECT owner FROM tickets WHERE id = ?", [eventId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: "Event not found" });
    if (row.owner !== organiserAddress) {
      return res.status(403).json({ error: "Unauthorized: You don't own this event" });
    }

    // Get attend info (would need additional schema to track actual attendees)
    db.all(
      "SELECT owner FROM tickets WHERE id = ? AND owner IS NOT NULL",
      [eventId],
      (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({
          eventId,
          attendeeCount: rows?.length || 0,
          attendees: rows || [],
        });
      }
    );
  });
});

// GET /api/organiser/stats - Get organiser statistics
router.get("/stats", (req, res) => {
  const organiserAddress = req.walletAddress || req.body?.organiserAddress;

  if (!organiserAddress) {
    return res.status(400).json({ error: "Organiser wallet address is required." });
  }

  db.all(
    "SELECT COUNT(*) as totalEvents, SUM(capacity) as totalCapacity FROM tickets WHERE owner = ?",
    [organiserAddress],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });

      const stats = rows?.[0] || { totalEvents: 0, totalCapacity: 0 };
      res.json(stats);
    }
  );
});

export default router;
