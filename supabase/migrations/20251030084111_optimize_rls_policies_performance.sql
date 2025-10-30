-- ============================================================================
-- OPTIMIZE RLS POLICIES FOR PERFORMANCE
-- ============================================================================
-- This migration optimizes Row Level Security policies by using subqueries
-- for auth functions, preventing unnecessary re-evaluation for each row.
-- This significantly improves query performance at scale.

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;

-- Recreate policies with optimized auth function calls
-- ============================================================================
-- PROFILES POLICIES
-- ============================================================================

-- Users can view their own profile (optimized)
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (id = (SELECT auth.uid()));

-- Users can update their own profile (optimized)
CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (id = (SELECT auth.uid()));

-- ============================================================================
-- SUBSCRIPTIONS POLICIES
-- ============================================================================

-- Users can view their own subscriptions (optimized)
CREATE POLICY "Users can view their own subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING (user_id = (SELECT auth.uid()));
