-- Quick Analytics Fix - Add missing functions and columns
-- Run this in Supabase SQL Editor if you don't want to reset everything

-- Add missing columns to profiles table if they don't exist
DO $$
BEGIN
    -- Add user_level column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'user_level') THEN
        ALTER TABLE profiles ADD COLUMN user_level VARCHAR(20) DEFAULT 'standard';
    END IF;
    
    -- Add export_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'export_count') THEN
        ALTER TABLE profiles ADD COLUMN export_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add canvas_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'canvas_count') THEN
        ALTER TABLE profiles ADD COLUMN canvas_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add upload_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'upload_count') THEN
        ALTER TABLE profiles ADD COLUMN upload_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add level_manually_set column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'level_manually_set') THEN
        ALTER TABLE profiles ADD COLUMN level_manually_set BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Create global table if it doesn't exist
CREATE TABLE IF NOT EXISTS global (
    id SERIAL PRIMARY KEY,
    total_users INTEGER DEFAULT 0,
    total_exports INTEGER DEFAULT 0,
    total_canvases INTEGER DEFAULT 0,
    total_uploads INTEGER DEFAULT 0,
    dev_users INTEGER DEFAULT 0,
    beta_users INTEGER DEFAULT 0,
    standard_users INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert initial global record if none exists
INSERT INTO global (total_users, total_exports, total_canvases, total_uploads, dev_users, beta_users, standard_users)
SELECT 0, 0, 0, 0, 0, 0, 0
WHERE NOT EXISTS (SELECT 1 FROM global);

-- Function to recalculate and update global statistics
CREATE OR REPLACE FUNCTION update_global_stats()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE global SET
        total_users = (SELECT COUNT(*) FROM profiles WHERE user_level IS NOT NULL),
        total_exports = (SELECT COALESCE(SUM(export_count), 0) FROM profiles),
        total_canvases = (SELECT COALESCE(SUM(canvas_count), 0) FROM profiles),
        total_uploads = (SELECT COALESCE(SUM(upload_count), 0) FROM profiles),
        dev_users = (SELECT COUNT(*) FROM profiles WHERE user_level = 'dev'),
        beta_users = (SELECT COUNT(*) FROM profiles WHERE user_level = 'beta'),
        standard_users = (SELECT COUNT(*) FROM profiles WHERE user_level = 'standard'),
        updated_at = NOW()
    WHERE id = 1;
    
    -- If no global record exists, create one
    IF NOT FOUND THEN
        INSERT INTO global (
            total_users, total_exports, total_canvases, total_uploads,
            dev_users, beta_users, standard_users
        )
        SELECT
            (SELECT COUNT(*) FROM profiles WHERE user_level IS NOT NULL),
            (SELECT COALESCE(SUM(export_count), 0) FROM profiles),
            (SELECT COALESCE(SUM(canvas_count), 0) FROM profiles),
            (SELECT COALESCE(SUM(upload_count), 0) FROM profiles),
            (SELECT COUNT(*) FROM profiles WHERE user_level = 'dev'),
            (SELECT COUNT(*) FROM profiles WHERE user_level = 'beta'),
            (SELECT COUNT(*) FROM profiles WHERE user_level = 'standard');
    END IF;
END;
$$;

-- Function to increment export count
CREATE OR REPLACE FUNCTION increment_export_count(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles 
    SET export_count = export_count + 1,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Update global stats
    PERFORM update_global_stats();
END;
$$;

-- Function to increment canvas count
CREATE OR REPLACE FUNCTION increment_canvas_count(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles 
    SET canvas_count = canvas_count + 1,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Update global stats
    PERFORM update_global_stats();
END;
$$;

-- Function to increment upload count
CREATE OR REPLACE FUNCTION increment_upload_count(user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE profiles 
    SET upload_count = upload_count + 1,
        updated_at = NOW()
    WHERE id = user_id;
    
    -- Update global stats
    PERFORM update_global_stats();
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON global TO authenticated;
GRANT EXECUTE ON FUNCTION update_global_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_export_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_canvas_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_upload_count(UUID) TO authenticated;

-- Initialize global stats with current data
SELECT update_global_stats();

-- Set your user as dev (update with your actual email)
UPDATE profiles SET user_level = 'dev', level_manually_set = true 
WHERE id = (SELECT id FROM auth.users WHERE email = 'hello@candr.studio');

SELECT 'Quick fix completed successfully! Functions are now available.' as message; 