// Test Supabase connection and check tables
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔗 Testing Supabase connection...');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseAnonKey?.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('\n📊 Checking tables...\n');

  // Test each table
  const tables = [
    'users',
    'tasting_records', 
    'achievements',
    'user_achievements',
    'drafts',
    'user_stats',
    'coffee_database',
    'user_preferences'
  ];

  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table}: Not found or error - ${error.message}`);
      } else {
        console.log(`✅ ${table}: Exists (count query successful)`);
      }
    } catch (err) {
      console.log(`❌ ${table}: Error - ${err.message}`);
    }
  }

  console.log('\n📝 Recommendation:');
  console.log('=================');
  console.log('Based on the results above:');
  console.log('- If most tables are missing: Run the migrations');
  console.log('- If tables exist but with errors: Schema might be outdated');
  console.log('- If all tables exist: You\'re ready to go!\n');
}

testConnection();