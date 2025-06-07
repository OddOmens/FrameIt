-- Fix for Supabase function search_path warnings
-- Run these commands in your Supabase SQL editor

-- Fix update_global_stats function
-- This function updates global statistics when users sign up
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
    
    -- Update total users count
    UPDATE global SET total_users = total_users + 1;
    
    -- Update specific user level counts
    IF level = 'standard' THEN
      UPDATE global SET standard_users = standard_users + 1;
    ELSIF level = 'beta' THEN
      UPDATE global SET beta_users = beta_users + 1;
    END IF;
  END IF;
END;
$$;

-- Fix increment_upload_count function
-- This function increments upload count for a user and global stats
CREATE OR REPLACE FUNCTION public.increment_upload_count(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_level text;
  new_upload_count integer;
BEGIN
  -- Get user level and increment upload count
  UPDATE profiles 
  SET upload_count = COALESCE(upload_count, 0) + 1
  WHERE id = user_id
  RETURNING upload_count, user_level INTO new_upload_count, user_level;
  
  -- Update global upload count only if user is not dev
  IF user_level != 'dev' THEN
    UPDATE global SET total_uploads = total_uploads + 1;
  END IF;
  
  -- Return the new count
  RETURN json_build_object('new_upload_count', new_upload_count);
END;
$$;

-- Fix increment_canvas_count function
-- This function increments canvas count for a user and global stats
CREATE OR REPLACE FUNCTION public.increment_canvas_count(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_level text;
  new_canvas_count integer;
BEGIN
  -- Get user level and increment canvas count
  UPDATE profiles 
  SET canvas_count = COALESCE(canvas_count, 0) + 1
  WHERE id = user_id
  RETURNING canvas_count, user_level INTO new_canvas_count, user_level;
  
  -- Update global canvas count only if user is not dev
  IF user_level != 'dev' THEN
    UPDATE global SET total_canvases = total_canvases + 1;
  END IF;
  
  -- Return the new count
  RETURN json_build_object('new_canvas_count', new_canvas_count);
END;
$$;

-- Fix increment_export_count function
-- This function increments export count for a user and global stats
CREATE OR REPLACE FUNCTION public.increment_export_count(user_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_level text;
  new_export_count integer;
BEGIN
  -- Get user level and increment export count
  UPDATE profiles 
  SET export_count = COALESCE(export_count, 0) + 1
  WHERE id = user_id
  RETURNING export_count, user_level INTO new_export_count, user_level;
  
  -- Update global export count only if user is not dev
  IF user_level != 'dev' THEN
    UPDATE global SET total_exports = total_exports + 1;
  END IF;
  
  -- Return the new count
  RETURN json_build_object('new_export_count', new_export_count);
END;
$$;

-- Note: The pg_temp functions are temporary PostgreSQL functions
-- and typically don't need to be fixed manually as they're system-generated

-- Make sure you have the required tables:
-- 1. profiles table with columns: id (uuid), user_level (text), upload_count (integer), canvas_count (integer), export_count (integer)
-- 2. global table with columns: total_users (integer), standard_users (integer), beta_users (integer), total_uploads (integer), total_canvases (integer), total_exports (integer) 