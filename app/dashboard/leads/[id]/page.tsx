/**
 * Lead Detail Page
 * Shows complete information about a lead including call history
 */

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { signOut } from '@/app/actions/auth';
import { Phone, Mail, Building2, Calendar, Zap, Target, ArrowLeft } from 'lucide-react';
import { CallLogsTimeline } from './components/CallLogsTimeline';
import { LeadActions } from './components/LeadActions';
import { db } from '@/lib/db/client';
import { leads, leadSources, callLogs } from '@/lib/db/schema';
import { getCurrentUserOrganizationId } from '@/lib/db/helpers';
import { eq, and, desc } from 'drizzle-orm';

// Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

async function getLead(id: string) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return null;
    }

    // Fetch lead with source information
    const leadResult = await db
      .select({
        id: leads.id,
        firstName: leads.firstName,
        lastName: leads.lastName,
        email: leads.email,
        phone: leads.phone,
        company: leads.company,
        status: leads.status,
        leadScore: leads.leadScore,
        temperature: leads.temperature,
        aiNotes: leads.aiNotes,
        callAttempts: leads.callAttempts,
        lastCallAt: leads.lastCallAt,
        nextCallScheduledAt: leads.nextCallScheduledAt,
        tags: leads.tags,
        createdAt: leads.createdAt,
        updatedAt: leads.updatedAt,
        source: {
          id: leadSources.id,
          name: leadSources.name,
          type: leadSources.type,
        },
      })
      .from(leads)
      .leftJoin(leadSources, eq(leads.sourceId, leadSources.id))
      .where(and(eq(leads.id, id), eq(leads.organizationId, organizationId)))
      .limit(1);

    if (!leadResult.length) {
      return null;
    }

    // Fetch call logs for this lead
    const callLogsResult = await db
      .select()
      .from(callLogs)
      .where(and(eq(callLogs.leadId, id), eq(callLogs.organizationId, organizationId)))
      .orderBy(desc(callLogs.createdAt));

    return {
      data: {
        ...leadResult[0],
        callLogs: callLogsResult,
      },
    };
  } catch (error) {
    console.error('Error fetching lead:', error);
    return null;
  }
}

function getStatusBadgeColor(status: string) {
  const colors = {
    new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    contacted: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    qualified: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    disqualified: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    converted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
  };
  return colors[status as keyof typeof colors] || colors.new;
}

function getTemperatureBadgeColor(temperature: string) {
  const colors = {
    cold: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    warm: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    hot: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
  };
  return colors[temperature as keyof typeof colors] || colors.cold;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const appName = process.env.NEXT_PUBLIC_APP_NAME || "CallIQ";

  if (!user) {
    redirect('/auth/login');
  }

  // Await params in Next.js 16
  const { id } = await params;
  const response = await getLead(id);

  if (!response || !response.data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Lead not found
          </h1>
          <Link
            href="/dashboard/leads"
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Back to leads
          </Link>
        </div>
      </div>
    );
  }

  const lead = response.data;

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
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {lead.firstName} {lead.lastName}
                </h1>
                <div className="mt-2 flex items-center space-x-3">
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadgeColor(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getTemperatureBadgeColor(
                      lead.temperature
                    )}`}
                  >
                    {lead.temperature}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 text-sm font-semibold rounded-full bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400">
                    <Target className="h-4 w-4 mr-1" />
                    Score: {lead.leadScore || 0}
                  </span>
                </div>
              </div>
              <LeadActions leadId={lead.id} lead={lead} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lead Information */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Contact Information
                </h2>
                <div className="space-y-4">
                  {lead.email && (
                    <div className="flex items-start">
                      <Mail className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Email
                        </p>
                        <a
                          href={`mailto:${lead.email}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {lead.email}
                        </a>
                      </div>
                    </div>
                  )}

                  {lead.phone && (
                    <div className="flex items-start">
                      <Phone className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Phone
                        </p>
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {lead.phone}
                        </a>
                      </div>
                    </div>
                  )}

                  {lead.company && (
                    <div className="flex items-start">
                      <Building2 className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Company
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">{lead.company}</p>
                      </div>
                    </div>
                  )}

                  {lead.source && (
                    <div className="flex items-start">
                      <Zap className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Source
                        </p>
                        <p className="text-sm text-gray-900 dark:text-white">
                          {lead.source?.name || 'Direct'}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-400 mr-3 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Created
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {new Date(lead.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {lead.aiNotes && (
                  <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      AI Notes
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{lead.aiNotes}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Call Logs Timeline */}
            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Call History
                </h2>
                <CallLogsTimeline callLogs={lead.callLogs || []} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
