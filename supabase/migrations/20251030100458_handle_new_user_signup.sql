-- ============================================================================
-- AUTO-CREATE ORGANIZATION AND USER ON SIGNUP
-- ============================================================================
-- This trigger automatically creates an organization and inserts the user
-- into the users table when someone signs up via Supabase Auth
-- ============================================================================

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id uuid;
  user_email text;
  user_name text;
BEGIN
  -- Extract user info from auth.users metadata
  user_email := NEW.email;
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name',
    split_part(user_email, '@', 1)
  );

  -- Create a new organization for this user
  INSERT INTO public.organizations (name, subscription_plan, credits_balance)
  VALUES (
    user_name || '''s Organization',
    'free',
    10
  )
  RETURNING id INTO new_org_id;

  -- Insert the user into the users table
  INSERT INTO public.users (
    id,
    organization_id,
    email,
    full_name,
    avatar_url,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    new_org_id,
    user_email,
    user_name,
    NEW.raw_user_meta_data->>'avatar_url',
    'owner',
    true
  );

  RETURN NEW;
END;
$$;

-- Drop the trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create trigger on auth.users table
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_signup();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;
