// config/mysql.js
import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

let pool;

export async function connectMySQL() {
  if (pool) return pool;

  pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "127.0.0.1",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "algorand_app",
    waitForConnections: true,
    connectionLimit: 10
  });

  await pool.query("SELECT 1");
  console.log("✅ MySQL connected");

  return pool;
}

export function getPool() {
  if (!pool) {
    throw new Error("MySQL not initialized. Call connectMySQL() first.");
  }
  return pool;
}
