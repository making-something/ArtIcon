import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addScoreColumn() {
  try {
    console.log('🔧 Adding score column to submissions table...');

    // Check if score column exists
    const { data: columns, error: checkError } = await supabase
      .from('submissions')
      .select('score')
      .limit(1);

    if (checkError && checkError.message.includes('column "score" does not exist')) {
      console.log('📋 Score column does not exist. Adding it...');

      // Add the score column using raw SQL
      const { error } = await supabase
        .rpc('exec', { sql: 'ALTER TABLE submissions ADD COLUMN score INTEGER CHECK (score >= 0 AND score <= 100)' });

      if (error) {
        // Try alternative approach if RPC doesn't work
        console.log('⚠️ RPC failed, trying direct SQL approach...');
        console.log('Please run this SQL manually in your Supabase SQL Editor:');
        console.log('ALTER TABLE submissions ADD COLUMN score INTEGER CHECK (score >= 0 AND score <= 100);');
        return;
      }

      console.log('✅ Score column added successfully!');
    } else if (checkError) {
      console.error('❌ Error checking score column:', checkError);
      return;
    } else {
      console.log('✅ Score column already exists!');
    }

    console.log('🎉 Migration completed!');

  } catch (error) {
    console.error('❌ Error during migration:', error);
  }
}

// Run the migration
addScoreColumn();