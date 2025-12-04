import db from './src/config/database';
import bcrypt from 'bcryptjs';

async function updateAdminPassword() {
  try {
    const adminEmail = 'admin@multiicon.in';
    const newPassword = 'onlyforyou';

    const newHash = await bcrypt.hash(newPassword, 10);

    const stmt = db.prepare(`
      UPDATE admins
      SET password_hash = ?, updated_at = datetime('now')
      WHERE email = ?
    `);

    const result = stmt.run(newHash, adminEmail);

    if (result.changes === 0) {
      console.log('❌ No admin found with email:', adminEmail);
      process.exit(1);
    }

    console.log('✅ Admin password updated successfully!');
    console.log('Email:', adminEmail);
    console.log('New Password:', newPassword);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to update admin password:', error);
    process.exit(1);
  }
}

updateAdminPassword();
