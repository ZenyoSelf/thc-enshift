import sqlite3 from 'sqlite3';
import { Database } from 'sqlite3';
import path from 'path';

export class DB {
  private static instance: Database;

  static getInstance(): Database {
    if (!DB.instance) {
      DB.instance = new sqlite3.Database(
        path.join(__dirname, '..', '..', 'auth.db'),
        (err) => {
          if (err) {
            console.error('Database connection error:', err);
          } else {
            console.log('Connected to SQLite database');
            DB.initTables();
          }
        }
      );
    }
    return DB.instance;
  }

  private static initTables() {
    const db = DB.getInstance();

    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        firstName TEXT,
        lastName TEXT,
        reset_token TEXT,
        reset_token_expiry INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
  }

  static close() {
    if (DB.instance) {
      DB.instance.close((err) => {
        if (err) {
          console.error('Error closing database:', err);
        } else {
          console.log('Database connection closed');
        }
      });
    }
  }
}