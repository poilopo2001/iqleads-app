/**
 * Leads Table Component
 * Displays paginated list of leads with status badges
 */

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Phone, Mail } from 'lucide-react';
import { db } from '@/lib/db/client';
import { leads, leadSources } from '@/lib/db/schema';
import { getCurrentUserOrganizationId } from '@/lib/db/helpers';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';

interface LeadsTableProps {
  page: number;
  search?: string;
  status?: string;
  temperature?: string;
}

async function getLeads(params: {
  page: number;
  search?: string;
  status?: string;
  temperature?: string;
}) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return null;
    }

    const limit = 20;
    const offset = (params.page - 1) * limit;

    // Build query conditions
    let conditions = [eq(leads.organizationId, organizationId)];

    if (params.status) {
      conditions.push(eq(leads.status, params.status));
    }

    if (params.temperature) {
      conditions.push(eq(leads.temperature, params.temperature));
    }

    // Search across multiple fields
    if (params.search) {
      conditions.push(
        or(
          ilike(leads.firstName, `%${params.search}%`),
          ilike(leads.lastName, `%${params.search}%`),
          ilike(leads.email, `%${params.search}%`),
          ilike(leads.company, `%${params.search}%`),
          ilike(leads.phone, `%${params.search}%`)
        )!
      );
    }

    // Execute query with pagination
    const [leadsData, countResult] = await Promise.all([
      db
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
          callAttempts: leads.callAttempts,
          lastCallAt: leads.lastCallAt,
          nextCallScheduledAt: leads.nextCallScheduledAt,
          tags: leads.tags,
          createdAt: leads.createdAt,
          updatedAt: leads.updatedAt,
        })
        .from(leads)
        .where(and(...conditions))
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset),

      // Count total for pagination
      db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(and(...conditions)),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return {
      data: leadsData,
      pagination: {
        page: params.page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching leads:', error);
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

export async function LeadsTable({ page, search, status, temperature }: LeadsTableProps) {
  const response = await getLeads({ page, search, status, temperature });

  if (!response || !response.data) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Unable to load leads
      </div>
    );
  }

  const { data: leads, pagination } = response;

  if (leads.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No leads found</p>
        <Link
          href="/dashboard/leads/new"
          className="mt-4 inline-block text-blue-600 dark:text-blue-400 hover:underline"
        >
          Add your first lead
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Contact
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Company
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Status
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Temperature
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Score
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {leads.map((lead: any) => (
              <tr key={lead.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {lead.firstName} {lead.lastName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex flex-col space-y-1">
                    {lead.email && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Mail className="h-4 w-4 mr-1" />
                        {lead.email}
                      </div>
                    )}
                    {lead.phone && (
                      <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                        <Phone className="h-4 w-4 mr-1" />
                        {lead.phone}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {lead.company || '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                      lead.status
                    )}`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTemperatureBadgeColor(
                      lead.temperature
                    )}`}
                  >
                    {lead.temperature}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {lead.leadScore || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/dashboard/leads/${lead.id}`}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Link
              href={`/dashboard/leads?page=${Math.max(1, page - 1)}${
                search ? `&search=${search}` : ''
              }${status ? `&status=${status}` : ''}${
                temperature ? `&temperature=${temperature}` : ''
              }`}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                page === 1 ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/dashboard/leads?page=${Math.min(pagination.totalPages, page + 1)}${
                search ? `&search=${search}` : ''
              }${status ? `&status=${status}` : ''}${
                temperature ? `&temperature=${temperature}` : ''
              }`}
              className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                page === pagination.totalPages ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              Next
            </Link>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing{' '}
                <span className="font-medium">{(page - 1) * pagination.limit + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-medium">{pagination.total}</span> results
              </p>
            </div>
            <div>
              <nav
                className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
                aria-label="Pagination"
              >
                <Link
                  href={`/dashboard/leads?page=${Math.max(1, page - 1)}${
                    search ? `&search=${search}` : ''
                  }${status ? `&status=${status}` : ''}${
                    temperature ? `&temperature=${temperature}` : ''
                  }`}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    page === 1 ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </Link>
                <Link
                  href={`/dashboard/leads?page=${Math.min(pagination.totalPages, page + 1)}${
                    search ? `&search=${search}` : ''
                  }${status ? `&status=${status}` : ''}${
                    temperature ? `&temperature=${temperature}` : ''
                  }`}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    page === pagination.totalPages ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronRight className="h-5 w-5" />
                </Link>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
