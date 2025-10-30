-- ============================================================================
-- OPTIMIZE SERVICE ROLE RLS POLICY FOR PERFORMANCE
-- ============================================================================
-- This migration optimizes the service role policy by using a subquery
-- for auth.jwt() function, preventing unnecessary re-evaluation for each row.

-- Drop existing service role policy
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- Recreate policy with optimized auth function call
CREATE POLICY "Service role can manage subscriptions"
    ON public.subscriptions
    FOR ALL
    USING ((SELECT auth.jwt()->>'role') = 'service_role');
