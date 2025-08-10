// Script to check current Supabase schema
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkSchema() {
  console.log('🔍 Checking current Supabase schema...\n');

  try {
    // Check for existing tables
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.log('❌ Error fetching tables:', tablesError.message);
      console.log('\n📋 This might mean the tables don\'t exist yet.');
      console.log('You should run the migrations to set up the schema.\n');
      return;
    }

    console.log('📊 Current tables in database:');
    if (tables && tables.length > 0) {
      tables.forEach(t => console.log(`  - ${t.table_name}`));
    } else {
      console.log('  No tables found');
    }

    // Check for users table structure
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(0);

    if (!usersError) {
      console.log('\n✅ users table exists');
    }

    // Check for tasting_records table
    const { data: records, error: recordsError } = await supabase
      .from('tasting_records')
      .select('*')
      .limit(0);

    if (!recordsError) {
      console.log('✅ tasting_records table exists');
    }

    // Check for achievements table
    const { data: achievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .limit(0);

    if (!achievementsError) {
      console.log('✅ achievements table exists');
    }

    // Check for drafts table
    const { data: drafts, error: draftsError } = await supabase
      .from('drafts')
      .select('*')
      .limit(0);

    if (!draftsError) {
      console.log('✅ drafts table exists');
    }

    console.log('\n📝 Schema Summary:');
    console.log('================');
    if (!usersError && !recordsError && !achievementsError && !draftsError) {
      console.log('✅ All core tables exist!');
      console.log('\n⚠️  However, we should verify the schema matches our latest migrations.');
      console.log('   If the tables are from an old schema, consider:');
      console.log('   1. Backing up any existing data');
      console.log('   2. Dropping the old tables');
      console.log('   3. Running the new migrations');
    } else {
      console.log('⚠️  Some tables are missing. You should run the migrations.');
    }

  } catch (error) {
    console.error('❌ Error checking schema:', error);
  }
}

checkSchema();