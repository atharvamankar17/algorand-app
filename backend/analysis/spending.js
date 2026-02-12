// analysis/spending.js
import { getPool } from "../config/mysql.js";

export async function getSpendingReport(req, res) {
  try {
    const pool = getPool();
    const userId = req.user.id;

    const [rows] = await pool.query(
      "SELECT COALESCE(SUM(amount), 0) AS total FROM expenses WHERE paid_by = ?",
      [userId]
    );

    res.json({ total: rows[0].total });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
