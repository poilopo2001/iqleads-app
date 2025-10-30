/**
 * Toggle Active Button Component
 * Toggles the active status of a lead source
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

interface ToggleActiveButtonProps {
  source: {
    id: string;
    isActive: boolean;
  };
}

export function ToggleActiveButton({ source }: ToggleActiveButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isActive, setIsActive] = useState(source.isActive);

  const handleToggle = async () => {
    try {
      const response = await fetch(`/api/lead-sources/${source.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          isActive: !isActive,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update source');
      }

      setIsActive(!isActive);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error('Error toggling source:', error);
      alert('Failed to update source status');
    }
  };

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
        isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
      } ${isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:opacity-80'}`}
    >
      {isActive ? 'Active' : 'Inactive'}
    </button>
  );
}
