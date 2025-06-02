-- Set User as Dev Level
-- Replace 'your-email@example.com' with your actual email address

-- Method 1: Set user as dev by email
UPDATE profiles 
SET user_level = 'dev' 
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'your-email@example.com'
);

-- Method 2: If you want to set the first user as dev (useful for testing)
-- UPDATE profiles 
-- SET user_level = 'dev' 
-- WHERE id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);

-- Method 3: Set all existing users as dev (useful for development/testing)
-- UPDATE profiles SET user_level = 'dev';

-- Verify the update worked
SELECT 
    u.email,
    p.user_level,
    p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE p.user_level = 'dev'; 