/**
 * Source Filters Component
 * Provides filtering options for the sources table
 */

'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';

interface SourceFiltersProps {
  currentSearch?: string;
  currentType?: string;
  currentStatus?: string;
}

export function SourceFilters({ currentSearch, currentType, currentStatus }: SourceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearch = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set('search', value);
    } else {
      params.delete('search');
    }
    params.set('page', '1');
    router.push(`/dashboard/sources?${params.toString()}`);
  };

  const handleTypeFilter = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set('type', value);
    } else {
      params.delete('type');
    }
    params.set('page', '1');
    router.push(`/dashboard/sources?${params.toString()}`);
  };

  const handleStatusFilter = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== 'all') {
      params.set('status', value);
    } else {
      params.delete('status');
    }
    params.set('page', '1');
    router.push(`/dashboard/sources?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Search */}
      <div className="flex-1 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search sources..."
          defaultValue={currentSearch}
          onChange={(e) => handleSearch(e.target.value)}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        />
      </div>

      {/* Type Filter */}
      <select
        value={currentType || 'all'}
        onChange={(e) => handleTypeFilter(e.target.value)}
        className="block w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="all">All Types</option>
        <option value="wordpress">WordPress</option>
        <option value="woocommerce">WooCommerce</option>
        <option value="shopify">Shopify</option>
        <option value="zapier">Zapier</option>
        <option value="custom">Custom</option>
        <option value="api">API</option>
      </select>

      {/* Status Filter */}
      <select
        value={currentStatus || 'all'}
        onChange={(e) => handleStatusFilter(e.target.value)}
        className="block w-full sm:w-48 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>
    </div>
  );
}
