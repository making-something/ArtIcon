import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path - store in project root for easy access
const dbPath = path.join(process.cwd(), 'articon.db');

// Ensure database directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create database connection with optimal settings
const database = new Database(dbPath, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : undefined,
}) as any;

// Configure SQLite for performance and concurrency
database.pragma('journal_mode = WAL');
database.pragma('synchronous = NORMAL');
database.pragma('cache_size = 1000000');
database.pragma('temp_store = memory');
database.pragma('mmap_size = 268435456'); // 256MB
database.pragma('foreign_keys = ON');

// Enable query optimizer
database.pragma('optimize');

// Graceful shutdown
process.on('exit', () => {
  database.close();
});

process.on('SIGINT', () => {
  database.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  database.close();
  process.exit(0);
});

export default database;