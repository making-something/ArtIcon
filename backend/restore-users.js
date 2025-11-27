// Restore Users from CSV
// This script imports participants from a CSV backup file

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const DB_FILE = 'articon.db';
const BACKUP_DIR = 'user-backups';

// Check if database exists
if (!fs.existsSync(DB_FILE)) {
  console.error(`❌ Error: Database file '${DB_FILE}' not found!`);
  process.exit(1);
}

// List available backups
console.log('📋 Available backups:\n');

if (!fs.existsSync(BACKUP_DIR)) {
  console.error(`❌ Error: Backup directory '${BACKUP_DIR}' not found!`);
  process.exit(1);
}

const backupFiles = fs.readdirSync(BACKUP_DIR)
  .filter(file => file.startsWith('users_backup_') && file.endsWith('.csv'))
  .map(file => ({
    name: file,
    path: path.join(BACKUP_DIR, file),
    time: fs.statSync(path.join(BACKUP_DIR, file)).mtime
  }))
  .sort((a, b) => b.time - a.time);

if (backupFiles.length === 0) {
  console.error('❌ No backup files found!');
  process.exit(1);
}

backupFiles.forEach((file, index) => {
  const size = (fs.statSync(file.path).size / 1024).toFixed(2);
  console.log(`${index + 1}. ${file.name}`);
  console.log(`   Date: ${file.time.toLocaleString()}`);
  console.log(`   Size: ${size} KB\n`);
});

// Get latest backup
const latestBackup = backupFiles[0];
console.log(`🔄 Latest backup: ${latestBackup.name}\n`);

// Ask for confirmation
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Do you want to restore from this backup? (yes/no): ', (answer) => {
  if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
    console.log('❌ Restore cancelled.');
    rl.close();
    process.exit(0);
  }

  rl.close();
  performRestore(latestBackup.path);
});

function performRestore(csvPath) {
  console.log('\n🔄 Starting restore...\n');

  // Read CSV file
  const csvContent = fs.readFileSync(csvPath, 'utf8');
  const lines = csvContent.split('\n').filter(line => line.trim());

  if (lines.length < 2) {
    console.error('❌ Error: CSV file is empty or invalid!');
    process.exit(1);
  }

  // Parse CSV
  function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && inQuotes && nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current);
    return values;
  }

  // Skip header
  const dataLines = lines.slice(1);
  console.log(`📊 Found ${dataLines.length} users in backup`);

  // Open database
  const db = new Database(DB_FILE);

  try {
    let imported = 0;
    let skipped = 0;
    let errors = 0;

    // Prepare insert statement
    const insertStmt = db.prepare(`
      INSERT OR IGNORE INTO participants (
        id, name, email, whatsapp_no, category, city,
        portfolio_url, portfolio_file_path, is_present,
        role, experience, organization, specialization, source,
        approval_status, approved_at, rejected_at, admin_notes,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Process each line
    dataLines.forEach((line, index) => {
      try {
        const values = parseCSVLine(line);
        
        // Convert empty strings to null
        const cleanValues = values.map(v => v === '' ? null : v);
        
        // Convert boolean
        if (cleanValues[8] !== null) {
          cleanValues[8] = cleanValues[8] === '1' || cleanValues[8] === 'true' ? 1 : 0;
        }
        
        // Convert experience to number
        if (cleanValues[10] !== null) {
          cleanValues[10] = parseInt(cleanValues[10]) || 0;
        }

        const result = insertStmt.run(...cleanValues);
        
        if (result.changes > 0) {
          imported++;
        } else {
          skipped++;
        }
      } catch (error) {
        errors++;
        console.error(`⚠️  Error on line ${index + 2}: ${error.message}`);
      }
    });

    console.log('\n✅ Restore complete!');
    console.log(`   ✅ Imported: ${imported} users`);
    console.log(`   ⏭️  Skipped: ${skipped} users (already exist)`);
    if (errors > 0) {
      console.log(`   ❌ Errors: ${errors} users`);
    }

  } catch (error) {
    console.error('❌ Error during restore:', error.message);
    process.exit(1);
  } finally {
    db.close();
  }
}

