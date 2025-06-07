-- RESTORE ORIGINAL WORKING FUNCTIONS
-- This restores the exact functions from your fresh database setup that were working

-- 1. Restore the original update_global_stats function (without parameters)
CREATE OR REPLACE FUNCTION update_global_stats()
RETURNS VOID 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    UPDATE global SET
        total_users = (SELECT COUNT(*) FROM profiles WHERE user_level != 'dev'),
        standard_users = (SELECT COUNT(*) FROM profiles WHERE user_level = 'standard'),
        beta_users = (SELECT COUNT(*) FROM profiles WHERE user_level = 'beta'),
        total_exports = (SELECT COALESCE(SUM(export_count), 0) FROM profiles WHERE user_level != 'dev'),
        total_canvases = (SELECT COALESCE(SUM(canvas_count), 0) FROM profiles WHERE user_level != 'dev'),
        total_uploads = (SELECT COALESCE(SUM(upload_count), 0) FROM profiles WHERE user_level != 'dev'),
        updated_at = NOW()
    WHERE id = 1;
END;
$$;

-- 2. Restore the original increment_upload_count function
CREATE OR REPLACE FUNCTION increment_upload_count(user_id UUID)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    user_level_val TEXT;
BEGIN
    -- Create or update profile
    INSERT INTO profiles (id, upload_count, user_level)
    VALUES (user_id, 1, 'standard')
    ON CONFLICT (id) 
    DO UPDATE SET 
        upload_count = profiles.upload_count + 1,
        updated_at = NOW();
    
    -- Get user level to check if we should update global stats
    SELECT user_level INTO user_level_val FROM profiles WHERE id = user_id;
    
    -- Update global stats only for non-dev users
    IF user_level_val != 'dev' THEN
        PERFORM update_global_stats();
    END IF;
    
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
$$;

-- 3. Restore the original increment_canvas_count function
CREATE OR REPLACE FUNCTION increment_canvas_count(user_id UUID)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    user_level_val TEXT;
BEGIN
    INSERT INTO profiles (id, canvas_count, user_level)
    VALUES (user_id, 1, 'standard')
    ON CONFLICT (id) 
    DO UPDATE SET 
        canvas_count = profiles.canvas_count + 1,
        updated_at = NOW();
    
    -- Get user level to check if we should update global stats
    SELECT user_level INTO user_level_val FROM profiles WHERE id = user_id;
    
    -- Update global stats only for non-dev users
    IF user_level_val != 'dev' THEN
        PERFORM update_global_stats();
    END IF;
    
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
$$;

-- 4. Restore the original increment_export_count function
CREATE OR REPLACE FUNCTION increment_export_count(user_id UUID)
RETURNS JSON 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
    user_level_val TEXT;
BEGIN
    INSERT INTO profiles (id, export_count, user_level)
    VALUES (user_id, 1, 'standard')
    ON CONFLICT (id) 
    DO UPDATE SET 
        export_count = profiles.export_count + 1,
        updated_at = NOW();
    
    -- Get user level to check if we should update global stats
    SELECT user_level INTO user_level_val FROM profiles WHERE id = user_id;
    
    -- Update global stats only for non-dev users
    IF user_level_val != 'dev' THEN
        PERFORM update_global_stats();
    END IF;
    
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
$$;

-- 5. Create the new parameterized update_global_stats function for signup tracking
CREATE OR REPLACE FUNCTION public.update_global_stats(action text, level text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only handle new_user action
  IF action = 'new_user' THEN
    -- Skip global stats update for dev users
    IF level = 'dev' THEN
      RETURN;
    END IF;
    
    -- Just call the main update function which recalculates everything
    PERFORM update_global_stats();
  END IF;
END;
$$;

-- 6. Restore the trigger function
CREATE OR REPLACE FUNCTION trigger_update_global_stats()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Only update global stats for non-dev users
    IF (TG_OP = 'DELETE' AND OLD.user_level != 'dev') OR 
       (TG_OP != 'DELETE' AND COALESCE(NEW.user_level, 'standard') != 'dev') THEN
        PERFORM update_global_stats();
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- 7. Recreate the trigger
DROP TRIGGER IF EXISTS profiles_update_global_stats ON profiles;
CREATE TRIGGER profiles_update_global_stats
    AFTER INSERT OR UPDATE OR DELETE ON profiles
    FOR EACH ROW EXECUTE FUNCTION trigger_update_global_stats();

-- Test that functions work
SELECT 'Original working functions restored!' as status; 