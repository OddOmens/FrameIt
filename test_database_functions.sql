-- Test script to check if database functions exist
-- Run this in Supabase SQL Editor to see what's missing

-- Check if functions exist
SELECT 
    'increment_export_count' as function_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'increment_export_count' 
        AND routine_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'increment_canvas_count' as function_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'increment_canvas_count' 
        AND routine_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'increment_upload_count' as function_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'increment_upload_count' 
        AND routine_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'update_global_stats' as function_name,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.routines 
        WHERE routine_name = 'update_global_stats' 
        AND routine_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Check if tables exist and their structure
SELECT 
    'profiles table' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles' 
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status
UNION ALL
SELECT 
    'global table' as item,
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'global' 
        AND table_schema = 'public'
    ) THEN 'EXISTS' ELSE 'MISSING' END as status;

-- Check if required columns exist in profiles table
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name IN ('export_count', 'canvas_count', 'upload_count', 'user_level')
ORDER BY column_name; 