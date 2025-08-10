# CupNote v6 Development Testing Guide

## Current Status ✅

The authentication system is fully implemented and working:

1. **Login Screen** - `/src/screens/auth/LoginScreen.tsx`
2. **Signup Screen** - `/src/screens/auth/SignupScreen.tsx`
3. **Forgot Password Screen** - `/src/screens/auth/ForgotPasswordScreen.tsx`
4. **App.tsx** - Integrated with auth flow

## Supabase Configuration

- **URL**: https://jflohrifzegmuaukfvyh.supabase.co
- **Configuration**: Email confirmation is enabled for security

## Testing the App

### 1. Start the App
```bash
# Start Metro bundler
npx react-native start --reset-cache

# Run iOS app
npx react-native run-ios --simulator="iPhone 15 Pro"
```

### 2. Test Authentication Flow

#### Sign Up Flow:
1. Launch the app - you'll see the Home screen with "시작하기" button
2. Tap "시작하기" to go to Login screen
3. Tap "회원가입" link at the bottom
4. Fill in the sign-up form:
   - Name: Your name or nickname
   - Email: valid email address
   - Password: Must be 8+ characters with uppercase, lowercase, and numbers
   - Confirm Password: Must match
   - Accept terms and conditions
5. Tap "계정 만들기"
6. Check your email for confirmation link

#### Login Flow:
1. From Login screen, enter:
   - Email: your registered email
   - Password: your password
2. Optional: Check "로그인 상태 유지" for persistent session
3. Tap "로그인"

#### Password Reset Flow:
1. From Login screen, tap "비밀번호 찾기"
2. Enter your email address
3. Tap "재설정 링크 보내기"
4. Check your email for reset link

## Known Issues & Solutions

### Email Confirmation Required
Supabase has email confirmation enabled. For testing:

**Option 1: Use the Supabase Dashboard**
1. Go to https://jflohrifzegmuaukfvyh.supabase.co
2. Authentication > Users
3. Create user manually or confirm existing users

**Option 2: Create Test User via SQL**
Run this in Supabase SQL Editor:
```sql
-- See scripts/create-test-user.sql for full SQL
```

**Option 3: Disable Email Confirmation (Development Only)**
1. Go to Supabase Dashboard
2. Authentication > Providers > Email
3. Uncheck "Enable email confirmations"

## Testing Scripts

### Test Authentication
```bash
node scripts/test-auth.js
```
This tests all auth functions: signup, login, password reset, etc.

### Test Database Connection
```bash
node scripts/test-supabase-connection.js
```
This verifies all tables are present and accessible.

## Next Steps

After authentication is working:

1. **Connect Stores to Supabase**
   - Update RecordStore to use Supabase
   - Update AchievementStore to use Supabase
   - Add sync functionality

2. **Test Data Flow**
   - Create tasting records
   - Save drafts
   - Unlock achievements
   - Test offline mode

3. **Performance Optimization**
   - Bundle size optimization
   - Image optimization
   - Cache management

## Development Tips

### Quick App Reload
While the app is running, press `r` in the Metro terminal to reload.

### Clear All Data
```bash
# Clear AsyncStorage
npx react-native run-ios --simulator="iPhone 15 Pro" --reset-cache

# Clear Metro cache
watchman watch-del-all
npx react-native start --reset-cache
```

### View Logs
```bash
# iOS Simulator logs
npx react-native log-ios

# Metro bundler logs
# Check the terminal running Metro
```

## Environment Variables

Environment variables are configured in:
- `/src/config/env.ts` - Hardcoded for now
- `.env.local` - For reference (not auto-loaded yet)

To update credentials, edit `/src/config/env.ts` directly.

## Support

For issues:
1. Check Metro bundler output for errors
2. Verify Supabase credentials in `/src/config/env.ts`
3. Ensure tables exist: `node scripts/test-supabase-connection.js`
4. Test auth directly: `node scripts/test-auth.js`