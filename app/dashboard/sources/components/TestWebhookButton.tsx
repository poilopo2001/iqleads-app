/**
 * Test Webhook Button Component
 * Opens modal to test webhook integration
 */

'use client';

import { useState } from 'react';
import { FlaskConical } from 'lucide-react';
import { TestWebhookModal } from './TestWebhookModal';

interface TestWebhookButtonProps {
  source: any;
}

export function TestWebhookButton({ source }: TestWebhookButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300"
        title="Test webhook"
      >
        <FlaskConical className="h-4 w-4" />
      </button>
      {isOpen && <TestWebhookModal source={source} onClose={() => setIsOpen(false)} />}
    </>
  );
}
