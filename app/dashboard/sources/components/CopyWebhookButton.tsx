/**
 * Copy Webhook Button Component
 * Provides click-to-copy functionality for webhook URLs
 */

'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface CopyWebhookButtonProps {
  url: string;
}

export function CopyWebhookButton({ url }: CopyWebhookButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
      title={copied ? 'Copied!' : 'Copy URL'}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 mr-1 text-green-600 dark:text-green-400" />
          <span className="text-green-600 dark:text-green-400">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3 mr-1" />
          Copy
        </>
      )}
    </button>
  );
}
