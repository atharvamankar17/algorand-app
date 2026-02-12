import sqlite3 from "sqlite3";

const db = new sqlite3.Database("database.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS tickets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_name TEXT,
    asa_id INTEGER,
    price INTEGER,
    owner TEXT
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_address TEXT,
    amount INTEGER,
    purpose TEXT
  )
`);

export default db;
