// Checkpoint WAL to Main Database
// This script forces SQLite to write all WAL data to the main database file

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_FILE = 'articon.db';
const WAL_FILE = 'articon.db-wal';
const SHM_FILE = 'articon.db-shm';

console.log('💾 Checkpointing WAL to main database...\n');

// Check if database exists
if (!fs.existsSync(DB_FILE)) {
  console.error(`❌ Error: Database file '${DB_FILE}' not found!`);
  process.exit(1);
}

// Get file sizes before checkpoint
const dbSizeBefore = fs.statSync(DB_FILE).size;
const walSizeBefore = fs.existsSync(WAL_FILE) ? fs.statSync(WAL_FILE).size : 0;
const shmSizeBefore = fs.existsSync(SHM_FILE) ? fs.statSync(SHM_FILE).size : 0;

console.log('📊 Before checkpoint:');
console.log(`   Database: ${(dbSizeBefore / 1024).toFixed(2)} KB`);
console.log(`   WAL file: ${(walSizeBefore / 1024).toFixed(2)} KB`);
console.log(`   SHM file: ${(shmSizeBefore / 1024).toFixed(2)} KB`);
console.log('');

// Open database
const db = new Database(DB_FILE);

try {
  // Get user count before checkpoint
  const userCountBefore = db.prepare('SELECT COUNT(*) as count FROM participants').get();
  console.log(`👥 Users in database: ${userCountBefore.count}`);
  console.log('');

  // Perform checkpoint - TRUNCATE mode writes all WAL data to main file and truncates WAL
  console.log('🔄 Running WAL checkpoint (TRUNCATE mode)...');
  const result = db.pragma('wal_checkpoint(TRUNCATE)');
  console.log('✅ Checkpoint complete');
  console.log('');

  // Verify user count after checkpoint
  const userCountAfter = db.prepare('SELECT COUNT(*) as count FROM participants').get();
  
  if (userCountBefore.count !== userCountAfter.count) {
    console.error('❌ ERROR: User count changed during checkpoint!');
    console.error(`   Before: ${userCountBefore.count}`);
    console.error(`   After: ${userCountAfter.count}`);
    process.exit(1);
  }

  // Get file sizes after checkpoint
  const dbSizeAfter = fs.statSync(DB_FILE).size;
  const walSizeAfter = fs.existsSync(WAL_FILE) ? fs.statSync(WAL_FILE).size : 0;
  const shmSizeAfter = fs.existsSync(SHM_FILE) ? fs.statSync(SHM_FILE).size : 0;

  console.log('📊 After checkpoint:');
  console.log(`   Database: ${(dbSizeAfter / 1024).toFixed(2)} KB (${dbSizeAfter > dbSizeBefore ? '+' : ''}${((dbSizeAfter - dbSizeBefore) / 1024).toFixed(2)} KB)`);
  console.log(`   WAL file: ${(walSizeAfter / 1024).toFixed(2)} KB (${walSizeAfter > walSizeBefore ? '+' : ''}${((walSizeAfter - walSizeBefore) / 1024).toFixed(2)} KB)`);
  console.log(`   SHM file: ${(shmSizeAfter / 1024).toFixed(2)} KB`);
  console.log('');

  // Optimize database
  console.log('🔧 Optimizing database...');
  db.pragma('optimize');
  console.log('✅ Optimization complete');
  console.log('');

  console.log('✅ All data is now in the main database file!');
  console.log('');
  console.log('📋 Next steps:');
  console.log('   1. Commit the database: git add backend/articon.db');
  console.log('   2. Push to production: git push origin main');
  console.log('   3. On production, pull: git pull origin main');
  console.log('');

} catch (error) {
  console.error('❌ Error during checkpoint:', error.message);
  process.exit(1);
} finally {
  db.close();
}

