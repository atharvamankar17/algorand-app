CREATE DATABASE IF NOT EXISTS algorand_app;
USE algorand_app;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  address VARCHAR(100),
  name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  name VARCHAR(100),
  color VARCHAR(20) DEFAULT '#6C757D',
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS expenses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  paid_by INT NOT NULL,
  amount BIGINT NOT NULL,
  category_id INT,
  description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS expense_participants (
  expense_id INT,
  user_id INT,
  PRIMARY KEY (expense_id, user_id)
);

CREATE TABLE IF NOT EXISTS transfers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  from_user_id INT,
  to_user_id INT,
  amount BIGINT,
  note VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Seed dev user
INSERT IGNORE INTO users (id, name, address)
VALUES (1, 'Dev User', 'DEV_WALLET');

INSERT IGNORE INTO categories (id, user_id, name)
VALUES (1, 1, 'Uncategorized');
