-- Create safe functions that bypass RLS for tracking
-- These functions use SECURITY DEFINER to run with elevated privileges

CREATE OR REPLACE FUNCTION public.safe_increment_upload_count(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_level text;
  new_upload_count integer;
BEGIN
  -- Temporarily disable RLS for this function
  SET row_security = off;
  
  -- Get user level and increment upload count
  UPDATE profiles 
  SET upload_count = COALESCE(upload_count, 0) + 1
  WHERE id = user_id
  RETURNING upload_count, user_level INTO new_upload_count, user_level;
  
  -- Update global upload count only if user is not dev
  IF user_level != 'dev' THEN
    UPDATE global SET total_uploads = COALESCE(total_uploads, 0) + 1;
  END IF;
  
  -- Re-enable RLS
  SET row_security = on;
  
  -- Return the new count
  RETURN json_build_object('new_upload_count', new_upload_count);
END;
$$;

CREATE OR REPLACE FUNCTION public.safe_increment_canvas_count(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_level text;
  new_canvas_count integer;
BEGIN
  -- Temporarily disable RLS for this function
  SET row_security = off;
  
  -- Get user level and increment canvas count
  UPDATE profiles 
  SET canvas_count = COALESCE(canvas_count, 0) + 1
  WHERE id = user_id
  RETURNING canvas_count, user_level INTO new_canvas_count, user_level;
  
  -- Update global canvas count only if user is not dev
  IF user_level != 'dev' THEN
    UPDATE global SET total_canvases = COALESCE(total_canvases, 0) + 1;
  END IF;
  
  -- Re-enable RLS
  SET row_security = on;
  
  -- Return the new count
  RETURN json_build_object('new_canvas_count', new_canvas_count);
END;
$$;

CREATE OR REPLACE FUNCTION public.safe_increment_export_count(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_level text;
  new_export_count integer;
BEGIN
  -- Temporarily disable RLS for this function
  SET row_security = off;
  
  -- Get user level and increment export count
  UPDATE profiles 
  SET export_count = COALESCE(export_count, 0) + 1
  WHERE id = user_id
  RETURNING export_count, user_level INTO new_export_count, user_level;
  
  -- Update global export count only if user is not dev
  IF user_level != 'dev' THEN
    UPDATE global SET total_exports = COALESCE(total_exports, 0) + 1;
  END IF;
  
  -- Re-enable RLS
  SET row_security = on;
  
  -- Return the new count
  RETURN json_build_object('new_export_count', new_export_count);
END;
$$;

CREATE OR REPLACE FUNCTION public.safe_update_global_stats(action text, level text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Temporarily disable RLS for this function
  SET row_security = off;
  
  -- Only handle new_user action
  IF action = 'new_user' THEN
    -- Skip global stats update for dev users
    IF level = 'dev' THEN
      SET row_security = on;
      RETURN;
    END IF;
    
    -- Update total users count
    UPDATE global SET total_users = COALESCE(total_users, 0) + 1;
    
    -- Update specific user level counts
    IF level = 'standard' THEN
      UPDATE global SET standard_users = COALESCE(standard_users, 0) + 1;
    ELSIF level = 'beta' THEN
      UPDATE global SET beta_users = COALESCE(beta_users, 0) + 1;
    END IF;
  END IF;
  
  -- Re-enable RLS
  SET row_security = on;
END;
$$; 