import express from "express";
import dotenv from "dotenv";
import apiRoutes from "./api-js/index.js";
import { connectMySQL } from "./config/mysql.js";
import cors from "cors";
import { walletMiddleware } from "./middleware/wallet.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = "0.0.0.0";

app.use(express.json());
app.use(walletMiddleware);

// Root health check
app.get("/", (req, res) => {
  res.send("Algorand backend is running 🚀");
});

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  credentials: true
}));

async function start() {
  try {
    // 1️⃣ Connect MySQL (optional for development)
    try {
      await connectMySQL();
    } catch (mysqlErr) {
      console.warn("⚠️ MySQL connection failed. Running with SQLite only.");
      console.warn("   Details:", mysqlErr.message);
    }

    // 2️⃣ Mount routes once
    app.use("/api", apiRoutes);

    // 3️⃣ Start server ONCE
    const server = app.listen(PORT, HOST, () => {
      console.log(`✅ Algorand backend running on http://127.0.0.1:${PORT}`);
    });

    // 4️⃣ Handle listen errors cleanly
    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} already in use`);
      } else {
        console.error("❌ Server error:", err);
      }
      process.exit(1);
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err);
    process.exit(1);
  }
}

start();
