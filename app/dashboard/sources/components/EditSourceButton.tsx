/**
 * Edit Source Button Component
 * Opens modal to edit an existing lead source
 */

'use client';

import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import { EditSourceModal } from './EditSourceModal';

interface EditSourceButtonProps {
  source: any;
}

export function EditSourceButton({ source }: EditSourceButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300"
        title="Edit source"
      >
        <Edit2 className="h-4 w-4" />
      </button>
      {isOpen && <EditSourceModal source={source} onClose={() => setIsOpen(false)} />}
    </>
  );
}
