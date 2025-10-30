-- ============================================================================
-- FIX MULTIPLE PERMISSIVE POLICIES ON SUBSCRIPTIONS
-- ============================================================================
-- This migration fixes the performance issue caused by multiple permissive
-- policies for the same role and action by splitting the service role policy
-- into specific actions (INSERT, UPDATE, DELETE) instead of using FOR ALL.

-- Drop the existing service role policy that uses FOR ALL
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

-- Create separate policies for service role with specific actions
-- This prevents conflict with the user SELECT policy

-- Service role can insert subscriptions (for webhook creation)
CREATE POLICY "Service role can insert subscriptions"
    ON public.subscriptions
    FOR INSERT
    WITH CHECK ((SELECT auth.jwt()->>'role') = 'service_role');

-- Service role can update subscriptions (for webhook updates)
CREATE POLICY "Service role can update subscriptions"
    ON public.subscriptions
    FOR UPDATE
    USING ((SELECT auth.jwt()->>'role') = 'service_role')
    WITH CHECK ((SELECT auth.jwt()->>'role') = 'service_role');

-- Service role can delete subscriptions (for cleanup)
CREATE POLICY "Service role can delete subscriptions"
    ON public.subscriptions
    FOR DELETE
    USING ((SELECT auth.jwt()->>'role') = 'service_role');

-- Service role can also read subscriptions (for verification)
CREATE POLICY "Service role can read subscriptions"
    ON public.subscriptions
    FOR SELECT
    USING ((SELECT auth.jwt()->>'role') = 'service_role');
