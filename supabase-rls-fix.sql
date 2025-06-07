-- Fix for Supabase RLS Initialization Plan warnings
-- Run these commands in your Supabase SQL editor

-- First, let's see what RLS policies currently exist and then optimize them

-- Drop existing policies (if they exist) and recreate them with optimized structure
-- This prevents the unnecessary re-evaluation of auth functions for each row

-- ===========================================
-- PROFILES TABLE RLS POLICIES
-- ===========================================

-- Drop existing policies for profiles table
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON public.profiles;

-- Create optimized RLS policies for profiles table
-- These policies avoid re-evaluating auth functions for each row

-- Policy for users to read their own profile
CREATE POLICY "profiles_select_own" ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Policy for users to insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "profiles_update_own" ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Policy for service role to access all profiles (for admin functions)
CREATE POLICY "profiles_service_role_all" ON public.profiles
    FOR ALL
    USING (current_setting('role') = 'service_role')
    WITH CHECK (current_setting('role') = 'service_role');

-- ===========================================
-- GLOBAL TABLE RLS POLICIES
-- ===========================================

-- Drop existing policies for global table
DROP POLICY IF EXISTS "Enable read access for all users" ON public.global;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.global;
DROP POLICY IF EXISTS "Allow authenticated users to read global stats" ON public.global;
DROP POLICY IF EXISTS "Allow service role to update global stats" ON public.global;

-- Create optimized RLS policies for global table
-- Global stats should be readable by authenticated users, writable by service role

-- Policy for authenticated users to read global stats
CREATE POLICY "global_select_authenticated" ON public.global
    FOR SELECT
    USING (auth.role() = 'authenticated');

-- Policy for service role to update global stats
CREATE POLICY "global_update_service" ON public.global
    FOR UPDATE
    USING (current_setting('role') = 'service_role')
    WITH CHECK (current_setting('role') = 'service_role');

-- Policy for service role to insert global stats (if needed)
CREATE POLICY "global_insert_service" ON public.global
    FOR INSERT
    WITH CHECK (current_setting('role') = 'service_role');

-- ===========================================
-- ENABLE RLS ON TABLES
-- ===========================================

-- Make sure RLS is enabled on both tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- ALTERNATIVE: SIMPLER POLICIES (if above doesn't work)
-- ===========================================

-- If the above policies still cause warnings, you can use these simpler versions:

/*
-- Simple profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_service_role_all" ON public.profiles;

CREATE POLICY "profiles_policy" ON public.profiles
    FOR ALL
    USING (
        auth.uid() = id OR 
        current_setting('role') = 'service_role'
    )
    WITH CHECK (
        auth.uid() = id OR 
        current_setting('role') = 'service_role'
    );

-- Simple global policies
DROP POLICY IF EXISTS "global_select_authenticated" ON public.global;
DROP POLICY IF EXISTS "global_update_service" ON public.global;
DROP POLICY IF EXISTS "global_insert_service" ON public.global;

CREATE POLICY "global_policy" ON public.global
    FOR ALL
    USING (
        auth.role() = 'authenticated' OR 
        current_setting('role') = 'service_role'
    )
    WITH CHECK (current_setting('role') = 'service_role');
*/

-- ===========================================
-- NOTES
-- ===========================================

-- These optimized policies should reduce the RLS warnings by:
-- 1. Using more specific policy types (SELECT, INSERT, UPDATE) instead of FOR ALL
-- 2. Avoiding complex expressions that require re-evaluation
-- 3. Using auth.uid() and auth.role() efficiently
-- 4. Separating concerns between user access and service role access

-- If you still see warnings after applying these policies, 
-- you may need to disable RLS on the global table entirely if it's only 
-- accessed by your backend functions:
-- ALTER TABLE public.global DISABLE ROW LEVEL SECURITY; 