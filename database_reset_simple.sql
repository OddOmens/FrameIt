-- FrameIt Simplified Database Reset Script
-- This script creates only two tables: profiles and global

-- Drop old analytics tables if they exist
DROP TABLE IF EXISTS user_events CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS daily_metrics CASCADE;

-- Drop global table if it exists to recreate it fresh
DROP TABLE IF EXISTS global CASCADE;

-- Create global table for aggregate statistics
CREATE TABLE global (
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

-- Insert initial global record
INSERT INTO global (total_users, total_exports, total_canvases, total_uploads, dev_users, beta_users, standard_users)
VALUES (0, 0, 0, 0, 0, 0, 0);

-- Make sure profiles table has all the columns we need
-- Add any missing columns to profiles table if they don't exist
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_level ON profiles(user_level);
CREATE INDEX IF NOT EXISTS idx_profiles_export_count ON profiles(export_count);
CREATE INDEX IF NOT EXISTS idx_profiles_canvas_count ON profiles(canvas_count);
CREATE INDEX IF NOT EXISTS idx_profiles_upload_count ON profiles(upload_count);

-- Enable RLS (Row Level Security) on global table
ALTER TABLE global ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for global table (read-only for authenticated users)
DROP POLICY IF EXISTS "Authenticated users can view global stats" ON global;
CREATE POLICY "Authenticated users can view global stats" ON global
    FOR SELECT USING (auth.role() = 'authenticated');

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

-- Create trigger function for automatic global stats updates
CREATE OR REPLACE FUNCTION trigger_update_global_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    -- Update global stats whenever profiles table changes
    PERFORM update_global_stats();
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers to automatically update global stats
DROP TRIGGER IF EXISTS profiles_update_global_trigger ON profiles;
CREATE TRIGGER profiles_update_global_trigger
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_update_global_stats();

-- Initialize global stats with current data
SELECT update_global_stats();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON global TO authenticated;
GRANT EXECUTE ON FUNCTION update_global_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_export_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_canvas_count(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION increment_upload_count(UUID) TO authenticated;

-- Set your user as dev (update with your actual email)
-- Uncomment and update the email below:
-- UPDATE profiles SET user_level = 'dev', level_manually_set = true WHERE id = (SELECT id FROM auth.users WHERE email = 'hello@candr.studio');

-- Verify the setup
SELECT 'Profiles count:' as info, COUNT(*) as value FROM profiles
UNION ALL
SELECT 'Global records:' as info, COUNT(*) as value FROM global
UNION ALL
SELECT 'Dev users:' as info, COUNT(*) as value FROM profiles WHERE user_level = 'dev'; 