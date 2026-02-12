import express from "express";

const router = express.Router();

router.post("/notify", (req, res) => {
  const { groupName, message } = req.body;

  // For hackathon MVP: just simulate notification
  console.log(`📢 Group ${groupName}: ${message}`);

  res.json({ notified: true });
});

export default router;
