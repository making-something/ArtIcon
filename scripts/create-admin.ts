import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as readline from 'readline';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
}

async function createAdmin() {
  console.log('='.repeat(60));
  console.log('🔐 CREATE ADMIN ACCOUNT');
  console.log('='.repeat(60) + '\n');

  try {
    // Get admin email
    const email = await question('Enter admin email: ');

    if (!email || !email.includes('@')) {
      console.error('\n❌ Invalid email address');
      rl.close();
      process.exit(1);
    }

    // Check if admin already exists
    const { data: existingAdmin } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .single();

    if (existingAdmin) {
      console.error('\n❌ Admin with this email already exists');
      rl.close();
      process.exit(1);
    }

    // Get password
    const password = await question('Enter admin password (min 8 characters): ');

    if (!password || password.length < 8) {
      console.error('\n❌ Password must be at least 8 characters long');
      rl.close();
      process.exit(1);
    }

    // Confirm password
    const confirmPassword = await question('Confirm password: ');

    if (password !== confirmPassword) {
      console.error('\n❌ Passwords do not match');
      rl.close();
      process.exit(1);
    }

    console.log('\n⏳ Creating admin account...\n');

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create admin
    const { data: admin, error } = await supabase
      .from('admins')
      .insert({
        email,
        password_hash: passwordHash,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating admin:', error.message);
      rl.close();
      process.exit(1);
    }

    console.log('✅ Admin account created successfully!\n');
    console.log('📋 Admin Details:');
    console.log('   Email:', email);
    console.log('   ID:', admin.id);
    console.log('   Created:', new Date(admin.created_at).toLocaleString());
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SETUP COMPLETE!');
    console.log('='.repeat(60) + '\n');

    console.log('🚀 Next Steps:\n');
    console.log('1. Start the development server:');
    console.log('   pnpm dev\n');
    console.log('2. Login to admin panel:');
    console.log('   POST http://localhost:8000/api/admin/login');
    console.log('   Body: { "email": "' + email + '", "password": "your_password" }\n');
    console.log('3. Test API health:');
    console.log('   curl http://localhost:8000/health\n');

    rl.close();
  } catch (error: any) {
    console.error('\n❌ Error:', error.message);
    rl.close();
    process.exit(1);
  }
}

// Run the script
createAdmin().catch((error) => {
  console.error('❌ Fatal error:', error);
  rl.close();
  process.exit(1);
});
