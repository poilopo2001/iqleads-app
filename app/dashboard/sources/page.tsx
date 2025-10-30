/**
 * Lead Sources Management Page
 * Displays and manages webhook sources for lead ingestion
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import { SourcesTable } from './components/SourcesTable';
import { SourceFilters } from './components/SourceFilters';
import { CreateSourceButton } from './components/CreateSourceButton';
import { Suspense } from 'react';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams: {
    page?: string;
    search?: string;
    type?: string;
    status?: string;
  };
}

export default async function SourcesPage({ searchParams }: PageProps) {
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
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Leads
                </Link>
                <Link
                  href="/dashboard/sources"
                  className="text-blue-600 dark:text-blue-400 font-medium"
                >
                  Sources
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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Lead Sources</h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Manage webhook integrations and lead sources
              </p>
            </div>
            <CreateSourceButton />
          </div>

          {/* Filters */}
          <div className="mb-6">
            <SourceFilters
              currentSearch={searchParams.search}
              currentType={searchParams.type}
              currentStatus={searchParams.status}
            />
          </div>

          {/* Sources Table */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
            <Suspense fallback={<SourcesTableSkeleton />}>
              <SourcesTable
                page={parseInt(searchParams.page || '1')}
                search={searchParams.search}
                type={searchParams.type}
                status={searchParams.status}
              />
            </Suspense>
          </div>
        </div>
      </main>
    </div>
  );
}

function SourcesTableSkeleton() {
  return (
    <div className="p-6">
      <div className="animate-pulse space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
        ))}
      </div>
    </div>
  );
}
