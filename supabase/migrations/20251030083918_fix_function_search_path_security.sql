-- ============================================================================
-- FIX FUNCTION SEARCH_PATH SECURITY VULNERABILITY
-- ============================================================================
-- This migration fixes the search_path security issue by setting it to empty
-- for all functions, preventing potential SQL injection attacks.

-- Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$;

-- Fix handle_updated_at function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Fix sync_membership_tier function
CREATE OR REPLACE FUNCTION public.sync_membership_tier()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    -- Update profile membership tier based on active subscription
    IF NEW.status = 'active' OR NEW.status = 'trialing' THEN
        UPDATE public.profiles
        SET membership_tier = NEW.membership_tier
        WHERE id = NEW.user_id;
    ELSIF NEW.status IN ('canceled', 'past_due', 'unpaid', 'incomplete_expired') THEN
        -- Downgrade to free when subscription is no longer active
        UPDATE public.profiles
        SET membership_tier = 'free'
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$;
