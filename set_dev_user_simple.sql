-- Set hello@candr.studio as dev user
UPDATE profiles 
SET user_level = 'dev', level_manually_set = true 
WHERE id = (
    SELECT id 
    FROM auth.users 
    WHERE email = 'hello@candr.studio'
);

-- Verify the update worked
SELECT 
    u.email,
    p.user_level,
    p.level_manually_set,
    p.export_count,
    p.canvas_count,
    p.upload_count,
    p.created_at
FROM auth.users u
JOIN profiles p ON u.id = p.id
WHERE u.email = 'hello@candr.studio'; 