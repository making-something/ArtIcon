// Check Database Contents
// This script shows what's actually in the database

const Database = require('better-sqlite3');
const fs = require('fs');

const DB_FILE = 'articon.db';
const WAL_FILE = 'articon.db-wal';
const SHM_FILE = 'articon.db-shm';

console.log('🔍 Checking database contents...\n');

// Check file sizes
console.log('📊 File sizes:');
if (fs.existsSync(DB_FILE)) {
  const dbSize = fs.statSync(DB_FILE).size;
  console.log(`   Main DB: ${(dbSize / 1024).toFixed(2)} KB`);
} else {
  console.log('   Main DB: NOT FOUND');
}

if (fs.existsSync(WAL_FILE)) {
  const walSize = fs.statSync(WAL_FILE).size;
  console.log(`   WAL file: ${(walSize / 1024).toFixed(2)} KB ⚠️  (has uncommitted data)`);
} else {
  console.log(`   WAL file: none`);
}

if (fs.existsSync(SHM_FILE)) {
  const shmSize = fs.statSync(SHM_FILE).size;
  console.log(`   SHM file: ${(shmSize / 1024).toFixed(2)} KB`);
} else {
  console.log(`   SHM file: none`);
}

console.log('');

// Open database
const db = new Database(DB_FILE);

try {
  // Get all participants
  const participants = db.prepare(`
    SELECT id, name, email, approval_status, created_at
    FROM participants
    ORDER BY created_at ASC
  `).all();

  console.log(`👥 Total participants: ${participants.length}\n`);

  if (participants.length > 0) {
    console.log('📋 All participants:');
    participants.forEach((p, index) => {
      const date = new Date(p.created_at).toLocaleString();
      console.log(`   ${index + 1}. ${p.name} (${p.email})`);
      console.log(`      Status: ${p.approval_status || 'pending'}`);
      console.log(`      Created: ${date}`);
      console.log('');
    });
  } else {
    console.log('⚠️  No participants found in database!');
    console.log('   This means the database is empty or data is only in WAL file.');
  }

  // Check admins
  const admins = db.prepare(`
    SELECT id, email, created_at
    FROM admins
    ORDER BY created_at ASC
  `).all();

  if (admins.length > 0) {
    console.log(`\n🔐 Admins: ${admins.length}`);
    admins.forEach((a, index) => {
      console.log(`   ${index + 1}. ${a.email}`);
    });
  }

} catch (error) {
  console.error('❌ Error reading database:', error.message);
} finally {
  db.close();
}

console.log('\n💡 Next steps:');
if (fs.existsSync(WAL_FILE) && fs.statSync(WAL_FILE).size > 0) {
  console.log('   ⚠️  WAL file has data! Run: npm run checkpoint');
  console.log('   This will merge WAL data into main database file.');
} else {
  console.log('   ✅ No WAL data to checkpoint');
}

