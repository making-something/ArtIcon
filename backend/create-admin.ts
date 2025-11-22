import { databaseService } from './src/services/database.service';
import bcrypt from 'bcryptjs';

async function createAdmin() {
  try {
    const adminData = {
      email: 'admin@multiicon.in',
      password_hash: await bcrypt.hash('admin123', 10),
    };

    const admin = await databaseService.createAdmin(adminData);
    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@multiicon.in');
    console.log('Password: admin123');
    console.log('Admin ID:', admin.id);
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create admin:', error);
    process.exit(1);
  }
}

createAdmin();