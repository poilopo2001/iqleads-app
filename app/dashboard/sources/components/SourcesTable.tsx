/**
 * Sources Table Component
 * Displays paginated list of lead sources with actions
 */

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { CopyWebhookButton } from './CopyWebhookButton';
import { ToggleActiveButton } from './ToggleActiveButton';
import { EditSourceButton } from './EditSourceButton';
import { DeleteSourceButton } from './DeleteSourceButton';
import { TestWebhookButton } from './TestWebhookButton';
import { db } from '@/lib/db/client';
import { leadSources } from '@/lib/db/schema';
import { getCurrentUserOrganizationId } from '@/lib/db/helpers';
import { eq, desc } from 'drizzle-orm';

interface SourcesTableProps {
  page: number;
  search?: string;
  type?: string;
  status?: string;
}

async function getSources(params: {
  page: number;
  search?: string;
  type?: string;
  status?: string;
}) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return null;
    }

    const limit = 20;
    const offset = (params.page - 1) * limit;

    // Execute query with pagination
    const [sourcesData, countResult] = await Promise.all([
      db
        .select()
        .from(leadSources)
        .where(eq(leadSources.organizationId, organizationId))
        .orderBy(desc(leadSources.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: db.$count(leadSources) })
        .from(leadSources)
        .where(eq(leadSources.organizationId, organizationId)),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return {
      data: sourcesData,
      pagination: {
        page: params.page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  } catch (error) {
    console.error('Error fetching sources:', error);
    return null;
  }
}

function getTypeBadgeColor(type: string) {
  const colors = {
    wordpress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
    woocommerce: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400',
    shopify: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    zapier: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
    custom: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    api: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-400',
  };
  return colors[type as keyof typeof colors] || colors.custom;
}

function formatDate(dateString: string | null) {
  if (!dateString) return 'Never';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export async function SourcesTable({ page, search, type, status }: SourcesTableProps) {
  const response = await getSources({ page, search, type, status });

  if (!response || !response.data) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Unable to load sources
      </div>
    );
  }

  const { data: sources, pagination } = response;

  if (sources.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No sources found</p>
        <p className="mt-2 text-sm text-gray-400 dark:text-gray-500">
          Create your first lead source to start receiving webhooks
        </p>
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
                Type
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
                Webhook URL
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Total Leads
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
              >
                Last Received
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {sources.map((source: any) => (
              <tr key={source.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {source.name}
                    </div>
                    {source.description && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {source.description}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeBadgeColor(
                      source.type
                    )}`}
                  >
                    {source.type}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <ToggleActiveButton source={source} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-gray-900 dark:text-white font-mono truncate max-w-xs">
                      {source.webhookUrl}
                    </div>
                    <CopyWebhookButton url={source.webhookUrl} />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 dark:text-white">
                    {source.totalLeadsReceived || 0}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {formatDate(source.lastLeadReceivedAt)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2">
                    <TestWebhookButton source={source} />
                    <EditSourceButton source={source} />
                    <DeleteSourceButton sourceId={source.id} sourceName={source.name} />
                  </div>
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
              href={`/dashboard/sources?page=${Math.max(1, page - 1)}${
                search ? `&search=${search}` : ''
              }${type ? `&type=${type}` : ''}${
                status ? `&status=${status}` : ''
              }`}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                page === 1 ? 'pointer-events-none opacity-50' : ''
              }`}
            >
              Previous
            </Link>
            <Link
              href={`/dashboard/sources?page=${Math.min(pagination.totalPages, page + 1)}${
                search ? `&search=${search}` : ''
              }${type ? `&type=${type}` : ''}${
                status ? `&status=${status}` : ''
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
                  href={`/dashboard/sources?page=${Math.max(1, page - 1)}${
                    search ? `&search=${search}` : ''
                  }${type ? `&type=${type}` : ''}${
                    status ? `&status=${status}` : ''
                  }`}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                    page === 1 ? 'pointer-events-none opacity-50' : ''
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronLeft className="h-5 w-5" />
                </Link>
                <Link
                  href={`/dashboard/sources?page=${Math.min(pagination.totalPages, page + 1)}${
                    search ? `&search=${search}` : ''
                  }${type ? `&type=${type}` : ''}${
                    status ? `&status=${status}` : ''
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
