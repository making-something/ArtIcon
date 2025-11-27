// Backup Users to CSV
// This script exports all participants to a CSV file for backup

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

// Configuration
const DB_FILE = 'articon.db';
const BACKUP_DIR = 'user-backups';
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const CSV_FILE = path.join(BACKUP_DIR, `users_backup_${timestamp}.csv`);

// Create backup directory if it doesn't exist
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  console.log(`📁 Created backup directory: ${BACKUP_DIR}`);
}

// Check if database exists
if (!fs.existsSync(DB_FILE)) {
  console.error(`❌ Error: Database file '${DB_FILE}' not found!`);
  process.exit(1);
}

console.log('📦 Starting user backup to CSV...\n');

// Open database
const db = new Database(DB_FILE, { readonly: true });

try {
  // Get all participants
  const participants = db.prepare(`
    SELECT 
      id,
      name,
      email,
      whatsapp_no,
      category,
      city,
      portfolio_url,
      portfolio_file_path,
      is_present,
      role,
      experience,
      organization,
      specialization,
      source,
      approval_status,
      approved_at,
      rejected_at,
      admin_notes,
      created_at,
      updated_at
    FROM participants
    ORDER BY created_at DESC
  `).all();

  if (participants.length === 0) {
    console.log('⚠️  No participants found in database');
    process.exit(0);
  }

  console.log(`👥 Found ${participants.length} participants`);

  // CSV Headers
  const headers = [
    'ID',
    'Name',
    'Email',
    'WhatsApp',
    'Category',
    'City',
    'Portfolio URL',
    'Portfolio File',
    'Is Present',
    'Role',
    'Experience',
    'Organization',
    'Specialization',
    'Source',
    'Approval Status',
    'Approved At',
    'Rejected At',
    'Admin Notes',
    'Created At',
    'Updated At'
  ];

  // Escape CSV field (handle commas, quotes, newlines)
  function escapeCSV(field) {
    if (field === null || field === undefined) return '';
    const str = String(field);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  }

  // Build CSV content
  let csvContent = headers.join(',') + '\n';

  participants.forEach(participant => {
    const row = [
      participant.id,
      participant.name,
      participant.email,
      participant.whatsapp_no,
      participant.category,
      participant.city,
      participant.portfolio_url,
      participant.portfolio_file_path,
      participant.is_present,
      participant.role,
      participant.experience,
      participant.organization,
      participant.specialization,
      participant.source,
      participant.approval_status,
      participant.approved_at,
      participant.rejected_at,
      participant.admin_notes,
      participant.created_at,
      participant.updated_at
    ].map(escapeCSV);

    csvContent += row.join(',') + '\n';
  });

  // Write CSV file
  fs.writeFileSync(CSV_FILE, csvContent, 'utf8');

  console.log(`✅ Backup created successfully!`);
  console.log(`📄 File: ${CSV_FILE}`);
  
  // Show file size
  const stats = fs.statSync(CSV_FILE);
  console.log(`📊 Size: ${(stats.size / 1024).toFixed(2)} KB`);

  // Show breakdown by status
  const approved = participants.filter(p => p.approval_status === 'approved').length;
  const pending = participants.filter(p => p.approval_status === 'pending').length;
  const rejected = participants.filter(p => p.approval_status === 'rejected').length;

  console.log('\n📊 Backup Summary:');
  console.log(`   Total Users: ${participants.length}`);
  console.log(`   ✅ Approved: ${approved}`);
  console.log(`   ⏳ Pending: ${pending}`);
  console.log(`   ❌ Rejected: ${rejected}`);

  // Keep only last 20 backups
  const backupFiles = fs.readdirSync(BACKUP_DIR)
    .filter(file => file.startsWith('users_backup_') && file.endsWith('.csv'))
    .map(file => ({
      name: file,
      path: path.join(BACKUP_DIR, file),
      time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);

  if (backupFiles.length > 20) {
    console.log(`\n🧹 Cleaning old backups (keeping last 20)...`);
    backupFiles.slice(20).forEach(file => {
      fs.unlinkSync(file.path);
      console.log(`   Deleted: ${file.name}`);
    });
  }

  console.log('\n✅ Backup complete!');

} catch (error) {
  console.error('❌ Error during backup:', error.message);
  process.exit(1);
} finally {
  db.close();
}

