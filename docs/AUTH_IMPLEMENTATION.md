# Authentication Implementation Guide

## Overview

CupNote v6 uses Supabase for authentication, providing secure email/password authentication with session management.

## Architecture

### Technology Stack
- **Backend**: Supabase Auth (PostgreSQL-based)
- **Client**: @supabase/supabase-js
- **Storage**: AsyncStorage for session persistence
- **State**: Zustand for auth state management

### File Structure
```
src/
├── screens/auth/         # Authentication screens
│   ├── LoginScreen.tsx
│   ├── SignupScreen.tsx
│   └── ForgotPasswordScreen.tsx
├── lib/supabase.ts      # Supabase client and services
├── config/env.ts        # Environment configuration
└── App.tsx              # Auth flow integration
```

## Implementation Details

### 1. Supabase Configuration

**File**: `/src/lib/supabase-config.ts`
```typescript
export const supabaseConfig = createSupabaseConfig();
```

Configuration includes:
- URL and anonymous key from environment
- Session persistence with AsyncStorage
- Auto token refresh
- Rate limiting and security settings

### 2. Authentication Service

**File**: `/src/lib/supabase.ts`
```typescript
export class AuthService {
  static async signIn(email: string, password: string)
  static async signUp(email: string, password: string, name?: string)
  static async signOut()
  static async resetPasswordForEmail(email: string)
  static async getCurrentUser()
  static async getSession()
}
```

### 3. Authentication Screens

#### Login Screen
- Email/password input with validation
- Remember me option
- Password visibility toggle
- Links to signup and password reset

#### Signup Screen
- Name, email, password fields
- Password strength indicator
- Terms acceptance checkbox
- Email confirmation required

#### Password Reset Screen
- Email input for reset link
- Success state with instructions
- Resend email option

### 4. App Integration

**File**: `/App.tsx`
```typescript
const [isAuthenticated, setIsAuthenticated] = useState(false);

useEffect(() => {
  checkAuth();
  const { data: authListener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setIsAuthenticated(!!session);
    }
  );
  return () => authListener?.subscription.unsubscribe();
}, []);
```

## Security Features

### Password Requirements
- Minimum 8 characters
- Must contain uppercase letter
- Must contain lowercase letter
- Must contain number

### Email Verification
- Required for new accounts
- Confirmation email sent on signup
- User must verify before first login

### Session Management
- Automatic token refresh
- Secure storage in AsyncStorage
- Session timeout after 24 hours
- Refresh threshold: 5 minutes

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  avatar TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### User Stats Table
```sql
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  stats_data JSONB,
  last_updated TIMESTAMP
);
```

## Testing

### Test Scripts
1. **Authentication Test**: `/scripts/test-auth.js`
   - Tests signup, login, password reset
   - Validates error handling
   - Checks session management

2. **Database Connection Test**: `/scripts/test-supabase-connection.js`
   - Verifies table existence
   - Tests CRUD operations
   - Validates permissions

### Manual Testing
1. **Signup Flow**:
   - Enter valid email and password
   - Check email for confirmation
   - Verify account activation

2. **Login Flow**:
   - Enter registered credentials
   - Test remember me functionality
   - Verify session persistence

3. **Password Reset**:
   - Request reset email
   - Check email delivery
   - Test reset link functionality

## Environment Configuration

### Development Setup
**File**: `/src/config/env.ts`
```typescript
export const ENV = {
  EXPO_PUBLIC_SUPABASE_URL: 'https://your-project.supabase.co',
  EXPO_PUBLIC_SUPABASE_ANON_KEY: 'your-anon-key',
  // ... other settings
};
```

### Production Setup
- Use environment variables
- Enable email confirmation
- Configure rate limiting
- Set appropriate session timeouts

## Common Issues & Solutions

### Issue 1: Email Confirmation Required
**Solution**: 
- For development, disable in Supabase dashboard
- For production, ensure email service is configured

### Issue 2: Environment Variables Not Loading
**Solution**:
- Currently using hardcoded values in `/src/config/env.ts`
- Will migrate to proper env loading in future

### Issue 3: Session Not Persisting
**Solution**:
- Verify AsyncStorage is working
- Check session refresh settings
- Ensure auth listener is active

## Next Steps

1. **Store Integration**:
   - Connect RecordStore to Supabase
   - Connect AchievementStore to Supabase
   - Implement data sync

2. **Enhanced Features**:
   - Social login (Google, Apple)
   - Two-factor authentication
   - Account deletion

3. **Performance**:
   - Optimize auth checks
   - Implement caching
   - Reduce API calls

## API Reference

### Sign Up
```typescript
const { data, error } = await AuthService.signUp(
  email,
  password,
  name
);
```

### Sign In
```typescript
const { data, error } = await AuthService.signIn(
  email,
  password
);
```

### Sign Out
```typescript
await AuthService.signOut();
```

### Password Reset
```typescript
await AuthService.resetPasswordForEmail(email);
```

### Get Current User
```typescript
const user = await AuthService.getCurrentUser();
```

## Security Best Practices

1. **Never expose service keys** in client code
2. **Always validate input** on both client and server
3. **Use HTTPS** for all API calls
4. **Implement rate limiting** to prevent abuse
5. **Regular security audits** of authentication flow
6. **Monitor failed login attempts** for suspicious activity
7. **Keep dependencies updated** for security patches