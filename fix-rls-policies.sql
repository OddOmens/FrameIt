-- Fix RLS policies to allow existing tracking functions to work
-- This keeps your existing JavaScript code unchanged

-- Drop the problematic restrictive policies
DROP POLICY IF EXISTS "profiles_access_policy" ON public.profiles;
DROP POLICY IF EXISTS "global_access_policy" ON public.global;

-- Create permissive policies for PROFILES table
CREATE POLICY "profiles_full_access" ON public.profiles
    FOR ALL
    USING (
        -- Allow all authenticated users to read/write profiles
        auth.role() = 'authenticated' OR
        -- Allow service role (for functions)
        current_setting('role') = 'service_role' OR
        -- Allow anon role (functions sometimes run as anon)
        auth.role() = 'anon' OR
        -- Allow when there's a valid JWT (function context)
        auth.jwt() IS NOT NULL
    )
    WITH CHECK (
        -- Same permissions for writes
        auth.role() = 'authenticated' OR
        current_setting('role') = 'service_role' OR
        auth.role() = 'anon' OR
        auth.jwt() IS NOT NULL
    );

-- Create permissive policies for GLOBAL table  
CREATE POLICY "global_full_access" ON public.global
    FOR ALL
    USING (
        -- Allow everyone to read global stats
        true
    )
    WITH CHECK (
        -- Allow authenticated users and functions to update global stats
        auth.role() = 'authenticated' OR
        current_setting('role') = 'service_role' OR
        auth.role() = 'anon' OR
        auth.jwt() IS NOT NULL OR
        -- Allow any role to update (functions need this)
        true
    );

-- Alternative: If the above still doesn't work, temporarily disable RLS
-- Uncomment these lines if you still have issues:

-- ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.global DISABLE ROW LEVEL SECURITY;

-- Note: Disabling RLS removes all access restrictions, so only do this temporarily
-- You can re-enable later with:
-- ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.global ENABLE ROW LEVEL SECURITY; 