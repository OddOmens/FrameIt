# Fix Supabase Auth Warning: Leaked Password Protection

## The Warning
"Leaked password protection is currently disabled"

## How to Fix

### Option 1: Via Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings**
3. Look for **Security** settings
4. Enable **"Leaked Password Protection"**

### Option 2: Via Supabase CLI
```bash
# Update your auth config
supabase auth update --leaked-password-protection=true
```

### Option 3: Via API
```javascript
// In your Supabase configuration
const supabase = createClient(url, key, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
    // Enable leaked password protection
    leakedPasswordProtection: true
  }
})
```

## What This Does
- Checks passwords against known leaked password databases
- Prevents users from using commonly compromised passwords
- Improves overall security of your application

## Impact
- Users with leaked passwords will be prompted to change them
- New signups with leaked passwords will be rejected
- Existing users may need to update their passwords 