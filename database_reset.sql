-- FrameIt Database Reset Script
-- This script will clean up all tables except profiles and recreate analytics tables

-- Drop analytics tables if they exist
DROP TABLE IF EXISTS user_events CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS daily_metrics CASCADE;

-- Recreate user_events table for tracking user actions
CREATE TABLE user_events (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID,
    event_type VARCHAR(50) NOT NULL,
    event_name VARCHAR(100) NOT NULL,
    event_data JSONB,
    page_url TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate user_sessions table for tracking user sessions
CREATE TABLE user_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_start TIMESTAMPTZ NOT NULL,
    session_end TIMESTAMPTZ,
    user_agent TEXT,
    device_type VARCHAR(20),
    browser VARCHAR(50),
    os VARCHAR(50),
    ip_address INET,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate daily_metrics table for aggregated daily statistics
CREATE TABLE daily_metrics (
    id BIGSERIAL PRIMARY KEY,
    date DATE NOT NULL UNIQUE,
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    total_events INTEGER DEFAULT 0,
    total_exports INTEGER DEFAULT 0,
    total_uploads INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX idx_user_events_user_id ON user_events(user_id);
CREATE INDEX idx_user_events_timestamp ON user_events(timestamp);
CREATE INDEX idx_user_events_type ON user_events(event_type);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_start ON user_sessions(session_start);
CREATE INDEX idx_daily_metrics_date ON daily_metrics(date);

-- Enable RLS (Row Level Security)
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_metrics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_events
CREATE POLICY "Users can view their own events" ON user_events
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events" ON user_events
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions" ON user_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON user_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for daily_metrics (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view daily metrics" ON daily_metrics
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create a function to update daily metrics
CREATE OR REPLACE FUNCTION update_daily_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Update today's metrics
    INSERT INTO daily_metrics (
        date,
        total_users,
        active_users,
        new_users,
        total_events,
        total_exports,
        total_uploads,
        updated_at
    )
    SELECT
        CURRENT_DATE,
        (SELECT COUNT(*) FROM profiles WHERE user_level IS NOT NULL),
        (SELECT COUNT(DISTINCT user_id) FROM user_events WHERE DATE(timestamp) = CURRENT_DATE),
        (SELECT COUNT(*) FROM profiles WHERE DATE(created_at) = CURRENT_DATE),
        (SELECT COUNT(*) FROM user_events WHERE DATE(timestamp) = CURRENT_DATE),
        (SELECT COUNT(*) FROM user_events WHERE event_type = 'export' AND DATE(timestamp) = CURRENT_DATE),
        (SELECT COUNT(*) FROM user_events WHERE event_type = 'image_upload' AND DATE(timestamp) = CURRENT_DATE),
        NOW()
    ON CONFLICT (date) DO UPDATE SET
        total_users = EXCLUDED.total_users,
        active_users = EXCLUDED.active_users,
        new_users = EXCLUDED.new_users,
        total_events = EXCLUDED.total_events,
        total_exports = EXCLUDED.total_exports,
        total_uploads = EXCLUDED.total_uploads,
        updated_at = NOW();
END;
$$;

-- Make sure profiles table has the right structure (don't drop it, just update)
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
END $$;

-- Create an index on user_level for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_level ON profiles(user_level);

-- Insert some initial data for testing
-- Update your user to be dev level (replace with your actual user ID or email)
-- You can find your user ID in the auth.users table in Supabase dashboard

-- Example of how to set yourself as dev (uncomment and update with your email):
-- UPDATE profiles SET user_level = 'dev' WHERE id = (SELECT id FROM auth.users WHERE email = 'your-email@example.com');

-- Create some sample analytics data for testing
INSERT INTO user_events (user_id, session_id, event_type, event_name, event_data, timestamp)
SELECT 
    (SELECT id FROM auth.users LIMIT 1),
    gen_random_uuid(),
    'app_usage',
    'app_start',
    '{"version": "1.0"}',
    NOW() - INTERVAL '1 hour'
WHERE EXISTS (SELECT 1 FROM auth.users);

-- Initialize today's metrics
SELECT update_daily_metrics();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT ON user_events TO authenticated;
GRANT SELECT, INSERT ON user_sessions TO authenticated;
GRANT SELECT ON daily_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION update_daily_metrics() TO authenticated; 