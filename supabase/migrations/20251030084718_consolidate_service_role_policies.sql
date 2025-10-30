-- ============================================================================
-- CONSOLIDATE SERVICE ROLE POLICIES AND FIX PROFILES
-- ============================================================================
-- This migration consolidates service role policies to use restrictive policies
-- (using TO service_role) instead of permissive policies, eliminating conflicts
-- and improving performance.

-- ============================================================================
-- FIX SUBSCRIPTIONS POLICIES
-- ============================================================================

-- Drop all existing service role policies
DROP POLICY IF EXISTS "Service role can insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can delete subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can read subscriptions" ON public.subscriptions;

-- Create a single restrictive policy for service_role that applies to all operations
-- Using TO service_role makes this a restrictive policy that only applies to that role
CREATE POLICY "Service role has full access to subscriptions"
    ON public.subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- FIX PROFILES POLICIES - Remove duplicate public profile view
-- ============================================================================

-- The "Public profiles are viewable by everyone" policy conflicts with 
-- "Users can view their own profile" for authenticated users
-- Keep only the necessary policies

-- Users already have "Users can view their own profile" (optimized)
-- So "Public profiles are viewable by everyone" creates a duplicate permissive policy

-- If you want profiles to be truly public, keep the public one and remove the user-specific one
-- If you want profiles to be private, remove the public one (recommended for most SaaS apps)

-- For a typical SaaS app, we'll make profiles private:
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
