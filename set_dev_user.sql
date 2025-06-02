-- Set user as dev level
-- Run this in Supabase SQL Editor after running the main database setup

-- Update or insert profile for hello@candr.studio
INSERT INTO profiles (id, email, user_level, level_manually_set)
SELECT 
    id, 
    email, 
    'dev',
    true
FROM auth.users 
WHERE email = 'hello@candr.studio'
ON CONFLICT (id) 
DO UPDATE SET 
    user_level = 'dev',
    level_manually_set = true,
    updated_at = NOW();

-- Update global stats to reflect the change
SELECT update_global_stats();

-- Verify the change
SELECT email, user_level, level_manually_set FROM profiles 
JOIN auth.users ON profiles.id = auth.users.id 
WHERE email = 'hello@candr.studio'; 