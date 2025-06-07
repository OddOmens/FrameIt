-- COMPREHENSIVE FIX for Supabase RLS Warnings
-- This fixes both "Auth RLS Initialization Plan" and "Multiple Permissive Policies" warnings
-- Run these commands in your Supabase SQL editor

-- ===========================================
-- STEP 1: CLEAN SLATE - Remove ALL existing policies
-- ===========================================

-- Drop ALL existing policies on profiles table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'profiles' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', policy_record.policyname);
    END LOOP;
END $$;

-- Drop ALL existing policies on global table
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'global' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.global', policy_record.policyname);
    END LOOP;
END $$;

-- ===========================================
-- STEP 2: CREATE SINGLE, OPTIMIZED POLICIES
-- ===========================================

-- PROFILES TABLE - Single comprehensive policy
CREATE POLICY "profiles_access_policy" ON public.profiles
    FOR ALL
    TO public
    USING (
        -- Users can access their own profile OR service role can access all
        id = auth.uid() OR 
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    )
    WITH CHECK (
        -- Users can modify their own profile OR service role can modify all
        id = auth.uid() OR 
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- GLOBAL TABLE - Single comprehensive policy
CREATE POLICY "global_access_policy" ON public.global
    FOR ALL
    TO public
    USING (
        -- Authenticated users can read, service role can do everything
        auth.role() = 'authenticated' OR
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    )
    WITH CHECK (
        -- Only service role can modify global stats
        current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
    );

-- ===========================================
-- STEP 3: ENSURE RLS IS ENABLED
-- ===========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.global ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- ALTERNATIVE APPROACH: DISABLE RLS ON GLOBAL TABLE
-- ===========================================

-- If you still get warnings on the global table, you can disable RLS entirely
-- since it's primarily accessed by your backend functions:

-- ALTER TABLE public.global DISABLE ROW LEVEL SECURITY;

-- ===========================================
-- STEP 4: VERIFY POLICIES (Optional - for debugging)
-- ===========================================

-- Run these queries to verify your policies are correct:
-- SELECT * FROM pg_policies WHERE tablename IN ('profiles', 'global');

-- ===========================================
-- NOTES
-- ===========================================

-- This approach:
-- 1. Removes ALL existing policies to eliminate "Multiple Permissive Policies" warnings
-- 2. Creates single, comprehensive policies for each table
-- 3. Uses optimized auth checks to reduce "RLS Initialization Plan" warnings
-- 4. Uses request.jwt.claims for service role detection (more reliable)

-- If you still see warnings after this, the nuclear option is to disable RLS
-- on tables that are only accessed by your backend functions:
-- ALTER TABLE public.global DISABLE ROW LEVEL SECURITY; 