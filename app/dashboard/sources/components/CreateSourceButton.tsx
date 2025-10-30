/**
 * Create Source Button Component
 * Opens modal to create a new lead source
 */

'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { CreateSourceModal } from './CreateSourceModal';

export function CreateSourceButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-blue-500 dark:hover:bg-blue-600"
      >
        <Plus className="h-4 w-4 mr-2" />
        Create New Source
      </button>
      {isOpen && <CreateSourceModal onClose={() => setIsOpen(false)} />}
    </>
  );
}
