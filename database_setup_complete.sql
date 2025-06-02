-- Complete FrameIt Analytics Database Setup
-- Run this in Supabase SQL Editor

-- 1. Create or update the profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    user_level VARCHAR(20) DEFAULT 'standard',
    level_manually_set BOOLEAN DEFAULT FALSE,
    export_count INTEGER DEFAULT 0,
    canvas_count INTEGER DEFAULT 0,
    upload_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create or update the global table
CREATE TABLE IF NOT EXISTS global (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total_users INTEGER DEFAULT 0,
    total_exports INTEGER DEFAULT 0,
    total_canvases INTEGER DEFAULT 0,
    total_uploads INTEGER DEFAULT 0,
    dev_users INTEGER DEFAULT 0,
    beta_users INTEGER DEFAULT 0,
    standard_users INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial row if it doesn't exist
INSERT INTO global (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- 3. Function to update global statistics
CREATE OR REPLACE FUNCTION update_global_stats()
RETURNS VOID AS $$
BEGIN
    UPDATE global SET
        total_users = (SELECT COUNT(*) FROM profiles),
        total_exports = (SELECT COALESCE(SUM(export_count), 0) FROM profiles),
        total_canvases = (SELECT COALESCE(SUM(canvas_count), 0) FROM profiles),
        total_uploads = (SELECT COALESCE(SUM(upload_count), 0) FROM profiles),
        dev_users = (SELECT COUNT(*) FROM profiles WHERE user_level = 'dev'),
        beta_users = (SELECT COUNT(*) FROM profiles WHERE user_level = 'beta'),
        standard_users = (SELECT COUNT(*) FROM profiles WHERE user_level = 'standard'),
        updated_at = NOW()
    WHERE id = 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Function to increment upload count
CREATE OR REPLACE FUNCTION increment_upload_count(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Create profile if it doesn't exist
    INSERT INTO profiles (id, upload_count)
    VALUES (user_id, 1)
    ON CONFLICT (id) 
    DO UPDATE SET 
        upload_count = profiles.upload_count + 1,
        updated_at = NOW();
    
    -- Update global stats
    PERFORM update_global_stats();
    
    -- Return success with updated count
    SELECT json_build_object(
        'success', true,
        'user_id', user_id,
        'new_upload_count', upload_count,
        'action', 'upload_tracked'
    ) INTO result
    FROM profiles 
    WHERE id = user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Function to increment canvas count
CREATE OR REPLACE FUNCTION increment_canvas_count(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Create profile if it doesn't exist
    INSERT INTO profiles (id, canvas_count)
    VALUES (user_id, 1)
    ON CONFLICT (id) 
    DO UPDATE SET 
        canvas_count = profiles.canvas_count + 1,
        updated_at = NOW();
    
    -- Update global stats
    PERFORM update_global_stats();
    
    -- Return success with updated count
    SELECT json_build_object(
        'success', true,
        'user_id', user_id,
        'new_canvas_count', canvas_count,
        'action', 'canvas_tracked'
    ) INTO result
    FROM profiles 
    WHERE id = user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Function to increment export count
CREATE OR REPLACE FUNCTION increment_export_count(user_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    -- Create profile if it doesn't exist
    INSERT INTO profiles (id, export_count)
    VALUES (user_id, 1)
    ON CONFLICT (id) 
    DO UPDATE SET 
        export_count = profiles.export_count + 1,
        updated_at = NOW();
    
    -- Update global stats
    PERFORM update_global_stats();
    
    -- Return success with updated count
    SELECT json_build_object(
        'success', true,
        'user_id', user_id,
        'new_export_count', export_count,
        'action', 'export_tracked'
    ) INTO result
    FROM profiles 
    WHERE id = user_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Trigger function for profile changes
CREATE OR REPLACE FUNCTION trigger_update_global_stats()
RETURNS TRIGGER AS $$
BEGIN
    -- Call the update function
    PERFORM update_global_stats();
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Create triggers (drop first if they exist)
DROP TRIGGER IF EXISTS profiles_update_global_trigger ON profiles;
DROP TRIGGER IF EXISTS profiles_insert_global_trigger ON profiles;
DROP TRIGGER IF EXISTS profiles_delete_global_trigger ON profiles;

CREATE TRIGGER profiles_insert_global_trigger
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_global_stats();

CREATE TRIGGER profiles_update_global_trigger
    AFTER UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_global_stats();

CREATE TRIGGER profiles_delete_global_trigger
    AFTER DELETE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_global_stats();

-- 9. Enable RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE global ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role can manage profiles" ON profiles;

CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage profiles" ON profiles
    FOR ALL USING (auth.role() = 'service_role');

-- 11. RLS Policies for global (read-only for users)
DROP POLICY IF EXISTS "Anyone can view global stats" ON global;
DROP POLICY IF EXISTS "Service role can manage global" ON global;

CREATE POLICY "Anyone can view global stats" ON global
    FOR SELECT USING (true);

CREATE POLICY "Service role can manage global" ON global
    FOR ALL USING (auth.role() = 'service_role');

-- 12. Initial global stats calculation
SELECT update_global_stats();

-- 13. Test the functions (uncomment these lines to test)
-- SELECT increment_upload_count(auth.uid());
-- SELECT increment_canvas_count(auth.uid());
-- SELECT increment_export_count(auth.uid());
-- SELECT * FROM global;
-- SELECT * FROM profiles WHERE id = auth.uid(); 