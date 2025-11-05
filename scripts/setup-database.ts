import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error(
    "❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env file",
  );
  process.exit(1);
}

console.log("🔧 Connecting to Supabase...");
console.log(`📍 URL: ${supabaseUrl}\n`);

async function setupDatabase() {
  console.log("=".repeat(60));
  console.log("🚀 ARTICON HACKATHON - DATABASE SETUP");
  console.log("=".repeat(60) + "\n");

  try {
    // Read the SQL schema file
    const schemaPath = path.join(__dirname, "..", "supabase-schema.sql");

    if (!fs.existsSync(schemaPath)) {
      console.error("❌ supabase-schema.sql not found!");
      process.exit(1);
    }

    const schema = fs.readFileSync(schemaPath, "utf-8");
    console.log("✅ SQL schema file loaded successfully\n");

    console.log("📋 INSTRUCTIONS TO COMPLETE SETUP:\n");
    console.log("Since Supabase client doesn't support raw SQL execution,");
    console.log("please follow these steps:\n");

    console.log("1️⃣  Go to your Supabase Dashboard:");
    console.log(
      "   👉 https://supabase.com/dashboard/project/lsbajnqeseemdbckkzva",
    );
    console.log("   OR");
    console.log("   👉 https://lsbajnqeseemdbckkzva.supabase.co\n");

    console.log('2️⃣  Click on "SQL Editor" in the left sidebar\n');

    console.log('3️⃣  Click "New Query" button\n');

    console.log("4️⃣  Copy the SQL from: articon2/supabase-schema.sql");
    console.log("   File location: " + schemaPath + "\n");

    console.log("5️⃣  Paste it into the SQL Editor\n");

    console.log('6️⃣  Click "Run" button (or press Cmd/Ctrl + Enter)\n');

    console.log(
      "7️⃣  Wait for the query to complete (should take ~5 seconds)\n",
    );

    console.log("✨ WHAT THIS WILL CREATE:\n");
    console.log("   📊 8 Tables:");
    console.log("      • participants - Registration data");
    console.log("      • tasks - Category-based tasks");
    console.log("      • submissions - Participant submissions");
    console.log("      • judges - Judge accounts");
    console.log("      • admins - Admin accounts");
    console.log("      • winners - Winner announcements");
    console.log("      • notifications - Notification queue");
    console.log("      • event_settings - Event configuration\n");

    console.log("   🔐 Row Level Security (RLS) policies");
    console.log("   📈 Database indexes for performance");
    console.log("   🔄 Auto-update triggers");
    console.log("   📊 Statistics views");
    console.log("   ⚙️  Default event settings\n");

    console.log("=".repeat(60));
    console.log("⏳ Waiting for you to complete the setup...");
    console.log("=".repeat(60) + "\n");

    console.log(
      "💡 TIP: Keep this terminal open and press Enter after running the SQL\n",
    );

    // Wait for user input
    await new Promise((resolve) => {
      process.stdin.once("data", resolve);
    });

    console.log("\n🔍 Verifying database setup...\n");

    // Verify tables
    await verifySetup();
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

async function verifySetup() {
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

  const tables = [
    { name: "participants", description: "Participant registrations" },
    { name: "tasks", description: "Tasks by category" },
    { name: "submissions", description: "Task submissions" },
    { name: "judges", description: "Judge accounts" },
    { name: "admins", description: "Admin accounts" },
    { name: "winners", description: "Winner announcements" },
    { name: "notifications", description: "Notification queue" },
    { name: "event_settings", description: "Event configuration" },
  ];

  let allSuccess = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table.name)
        .select("*")
        .limit(1);

      if (error) {
        console.log(`❌ ${table.name.padEnd(20)} - NOT FOUND`);
        console.log(`   Error: ${error.message}\n`);
        allSuccess = false;
      } else {
        console.log(`✅ ${table.name.padEnd(20)} - OK (${table.description})`);
      }
    } catch (err: any) {
      console.log(`❌ ${table.name.padEnd(20)} - ERROR: ${err.message}`);
      allSuccess = false;
    }
  }

  console.log("\n" + "=".repeat(60));

  if (allSuccess) {
    console.log("🎉 DATABASE SETUP COMPLETE!");
    console.log("=".repeat(60) + "\n");

    console.log("✅ All tables created successfully!\n");

    console.log("🚀 NEXT STEPS:\n");
    console.log("1. Create your first admin account:");
    console.log("   pnpm run create-admin\n");
    console.log("2. Start the development server:");
    console.log("   pnpm dev\n");
    console.log("3. Test the API:");
    console.log("   curl http://localhost:8000/health\n");
  } else {
    console.log("⚠️  SETUP INCOMPLETE");
    console.log("=".repeat(60) + "\n");
    console.log("Some tables were not created. Please:");
    console.log("1. Check the SQL Editor for any errors");
    console.log("2. Make sure you ran the ENTIRE supabase-schema.sql file");
    console.log("3. Try running this script again: pnpm run setup-db\n");
  }
}

// Run the setup
setupDatabase().catch((error) => {
  console.error("❌ Fatal error:", error);
  process.exit(1);
});
