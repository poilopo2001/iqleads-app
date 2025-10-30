/**
 * New Lead Page
 * Form to create a new lead
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import { ArrowLeft } from 'lucide-react';
import { NewLeadForm } from './components/NewLeadForm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function NewLeadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "CallIQ";

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
                {appName}
              </Link>
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/leads"
                  className="text-blue-600 dark:text-blue-400 font-medium"
                >
                  Leads
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/pricing"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Pricing
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-3xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Back button */}
          <Link
            href="/dashboard/leads"
            className="inline-flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to leads
          </Link>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Create New Lead
            </h1>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Add a new lead to your database
            </p>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <NewLeadForm />
          </div>
        </div>
      </main>
    </div>
  );
}
