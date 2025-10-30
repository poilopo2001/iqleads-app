/**
 * Database Helper Functions
 * Utility functions for working with Drizzle ORM and CallIQ data
 */

import { createClient } from '@/lib/supabase/server';
import { db } from './client';
import { users } from './schema';
import { eq } from 'drizzle-orm';

/**
 * Get the organization_id for the current authenticated user
 * @returns organization_id or null if user not found
 */
export async function getCurrentUserOrganizationId(): Promise<string | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  // Query the users table to get organization_id
  const result = await db
    .select({ organizationId: users.organizationId })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  return result[0]?.organizationId || null;
}

/**
 * Get the current authenticated user with organization info
 * @returns user with organization_id or null
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) {
    return null;
  }

  // Get full user info from our users table
  const result = await db
    .select()
    .from(users)
    .where(eq(users.id, authUser.id))
    .limit(1);

  return result[0] || null;
}

/**
 * Verify that a resource belongs to the user's organization
 * @param organizationId - The organization_id to check
 * @returns true if authorized, false otherwise
 */
export async function verifyOrganizationAccess(
  organizationId: string
): Promise<boolean> {
  const userOrgId = await getCurrentUserOrganizationId();
  return userOrgId === organizationId;
}
