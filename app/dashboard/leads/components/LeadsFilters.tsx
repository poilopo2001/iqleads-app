'use client';

/**
 * Leads Filters Component
 * Provides search and filtering controls for the leads list
 */

import { useRouter, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState, useTransition } from 'react';

interface LeadsFiltersProps {
  currentSearch?: string;
  currentStatus?: string;
  currentTemperature?: string;
}

export function LeadsFilters({
  currentSearch = '',
  currentStatus = '',
  currentTemperature = '',
}: LeadsFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [search, setSearch] = useState(currentSearch);

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    // Reset to page 1 when filters change
    params.delete('page');

    startTransition(() => {
      router.push(`/dashboard/leads?${params.toString()}`);
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange('search', search);
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="col-span-2">
          <label htmlFor="search" className="sr-only">
            Search leads
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search by name, email, phone, or company..."
            />
          </div>
        </form>

        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="sr-only">
            Status
          </label>
          <select
            id="status"
            name="status"
            value={currentStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            disabled={isPending}
            className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="disqualified">Disqualified</option>
            <option value="converted">Converted</option>
          </select>
        </div>

        {/* Temperature Filter */}
        <div>
          <label htmlFor="temperature" className="sr-only">
            Temperature
          </label>
          <select
            id="temperature"
            name="temperature"
            value={currentTemperature}
            onChange={(e) => handleFilterChange('temperature', e.target.value)}
            disabled={isPending}
            className="block w-full py-2 px-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          >
            <option value="">All Temperatures</option>
            <option value="cold">Cold</option>
            <option value="warm">Warm</option>
            <option value="hot">Hot</option>
          </select>
        </div>
      </div>
    </div>
  );
}
