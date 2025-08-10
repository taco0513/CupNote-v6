#!/usr/bin/env node

/**
 * Test Supabase authentication functionality
 * Tests login, signup, and password reset
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Use the env config
const supabaseUrl = 'https://jflohrifzegmuaukfvyh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmbG9ocmlmemVnbXVhdWtmdnloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NjcxNTYsImV4cCI6MjA3MDI0MzE1Nn0.KF5oriksR25BxrqWdbAIXaOwKAry63A_N1-yNatpdYA';

if (!supabaseUrl || !supabaseAnonKey || 
    supabaseUrl === 'your-supabase-url-here' || 
    supabaseAnonKey === 'your-supabase-anon-key-here') {
  console.error('❌ Supabase credentials not configured in environment variables');
  process.exit(1);
}

console.log('🔧 Initializing Supabase client...');
console.log('📍 URL:', supabaseUrl);
console.log('🔑 Key:', supabaseAnonKey.substring(0, 20) + '...');

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test user credentials
const testEmail = `test_${Date.now()}@cupnote.com`;
const testPassword = 'TestPassword123!';
const testName = 'Test User';

async function runAuthTests() {
  console.log('\n🧪 Running authentication tests...\n');

  // Test 1: Sign Up
  console.log('1️⃣  Testing Sign Up...');
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: { name: testName },
      }
    });

    if (signUpError) {
      console.error('   ❌ Sign up failed:', signUpError.message);
    } else {
      console.log('   ✅ Sign up successful!');
      console.log('   📧 Email:', signUpData.user?.email);
      console.log('   🆔 User ID:', signUpData.user?.id);
      console.log('   📝 Note: Email confirmation may be required');
    }
  } catch (error) {
    console.error('   ❌ Sign up error:', error.message);
  }

  // Test 2: Sign In
  console.log('\n2️⃣  Testing Sign In...');
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });

    if (signInError) {
      console.error('   ❌ Sign in failed:', signInError.message);
      if (signInError.message.includes('Email not confirmed')) {
        console.log('   ℹ️  Email confirmation is required before signing in');
      }
    } else {
      console.log('   ✅ Sign in successful!');
      console.log('   🔐 Session token:', signInData.session?.access_token?.substring(0, 20) + '...');
    }
  } catch (error) {
    console.error('   ❌ Sign in error:', error.message);
  }

  // Test 3: Get Current User
  console.log('\n3️⃣  Testing Get Current User...');
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('   ❌ Get user failed:', userError.message);
    } else if (user) {
      console.log('   ✅ Current user retrieved!');
      console.log('   📧 Email:', user.email);
      console.log('   🆔 ID:', user.id);
    } else {
      console.log('   ℹ️  No user currently signed in');
    }
  } catch (error) {
    console.error('   ❌ Get user error:', error.message);
  }

  // Test 4: Password Reset
  console.log('\n4️⃣  Testing Password Reset Email...');
  try {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(testEmail, {
      redirectTo: 'cupnote://reset-password',
    });

    if (resetError) {
      console.error('   ❌ Password reset failed:', resetError.message);
    } else {
      console.log('   ✅ Password reset email sent!');
      console.log('   📧 Check email:', testEmail);
    }
  } catch (error) {
    console.error('   ❌ Password reset error:', error.message);
  }

  // Test 5: Sign Out
  console.log('\n5️⃣  Testing Sign Out...');
  try {
    const { error: signOutError } = await supabase.auth.signOut();
    
    if (signOutError) {
      console.error('   ❌ Sign out failed:', signOutError.message);
    } else {
      console.log('   ✅ Sign out successful!');
    }
  } catch (error) {
    console.error('   ❌ Sign out error:', error.message);
  }

  // Test 6: Test with invalid credentials
  console.log('\n6️⃣  Testing Invalid Login (Expected to fail)...');
  try {
    const { error: invalidError } = await supabase.auth.signInWithPassword({
      email: 'invalid@test.com',
      password: 'wrongpassword',
    });

    if (invalidError) {
      console.log('   ✅ Invalid login correctly rejected:', invalidError.message);
    } else {
      console.error('   ❌ Invalid login should have failed but succeeded');
    }
  } catch (error) {
    console.log('   ✅ Invalid login correctly rejected:', error.message);
  }

  console.log('\n✨ Authentication tests complete!\n');
  
  // Summary
  console.log('📊 Test Summary:');
  console.log('   • Sign Up: Creates new user account');
  console.log('   • Sign In: Authenticates existing user');
  console.log('   • Get User: Retrieves current session');
  console.log('   • Password Reset: Sends reset email');
  console.log('   • Sign Out: Clears session');
  console.log('   • Invalid Login: Security check');
  
  console.log('\n💡 Next Steps:');
  console.log('   1. Check if email confirmation is enabled in Supabase dashboard');
  console.log('   2. Test the authentication screens in the app');
  console.log('   3. Verify user data is stored in the users table');
}

// Run the tests
runAuthTests().catch(console.error);