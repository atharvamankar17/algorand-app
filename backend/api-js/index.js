import express from "express";
import ticketRoutes from "./tickets.js";
import paymentRoutes from "./payments.js";
import groupRoutes from "./groups.js";
import analysisRoutes from "./analysis.js";
import eventRoutes from "./events.js";
import activityRoutes from "./activity.js";
import organiserRoutes from "./organiser.js";

const router = express.Router();

router.use("/analysis", analysisRoutes);
router.use("/tickets", ticketRoutes);
router.use("/payments", paymentRoutes);
router.use("/groups", groupRoutes);
router.use("/events", eventRoutes);
router.use("/activity", activityRoutes);
router.use("/organiser", organiserRoutes);

export default router;
