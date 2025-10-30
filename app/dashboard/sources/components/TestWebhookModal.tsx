/**
 * Test Webhook Modal Component
 * Provides tools to test webhook integration
 */

'use client';

import { useState } from 'react';
import { X, Send, Copy, Check, ExternalLink } from 'lucide-react';

interface TestWebhookModalProps {
  source: any;
  onClose: () => void;
}

const SAMPLE_PAYLOAD = {
  firstName: "John",
  lastName: "Doe",
  email: "john.doe@example.com",
  phone: "+1234567890",
  company: "Acme Inc",
  notes: "Test lead from webhook integration",
};

export function TestWebhookModal({ source, onClose }: TestWebhookModalProps) {
  const [testPayload, setTestPayload] = useState(JSON.stringify(SAMPLE_PAYLOAD, null, 2));
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    setResponse(null);

    try {
      const payload = JSON.parse(testPayload);

      const res = await fetch(source.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        success: res.ok,
      });
    } catch (err: any) {
      setResponse({
        status: 0,
        statusText: 'Error',
        data: { error: err.message },
        success: false,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(source.webhookUrl);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyPayload = async () => {
    try {
      await navigator.clipboard.writeText(testPayload);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleCopyGetUrl = async () => {
    const getUrl = `${source.webhookUrl}?config=true`;
    try {
      await navigator.clipboard.writeText(getUrl);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Test Webhook Integration
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="space-y-6">
            {/* Webhook URL Section */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                Webhook Endpoint
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    POST URL
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={source.webhookUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                    />
                    <button
                      onClick={handleCopyUrl}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="h-4 w-4 mr-1 text-green-600" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    GET URL (Config Test)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={`${source.webhookUrl}?config=true`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
                    />
                    <button
                      onClick={handleCopyGetUrl}
                      className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors"
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Use this URL to test if the webhook endpoint is accessible
                  </p>
                </div>
              </div>
            </div>

            {/* Test Payload Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Test Payload
                </h3>
                <button
                  onClick={handleCopyPayload}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  {copiedPayload ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <textarea
                value={testPayload}
                onChange={(e) => setTestPayload(e.target.value)}
                rows={12}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Modify the payload above and click "Send Test" to test your webhook integration
              </p>
            </div>

            {/* Send Button */}
            <div className="flex justify-between items-center">
              <a
                href="/docs/WEBHOOK_INTEGRATIONS.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                <ExternalLink className="h-4 w-4 mr-1" />
                View Integration Documentation
              </a>
              <button
                onClick={handleTest}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Send Test
                  </>
                )}
              </button>
            </div>

            {/* Response Section */}
            {response && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3">
                  Response
                </h3>
                <div className={`rounded-lg border-2 p-4 ${
                  response.success
                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      response.success
                        ? 'text-green-800 dark:text-green-400'
                        : 'text-red-800 dark:text-red-400'
                    }`}>
                      Status: {response.status} {response.statusText}
                    </span>
                  </div>
                  <pre className="text-xs bg-white dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700 overflow-x-auto">
                    <code className="text-gray-900 dark:text-white">
                      {JSON.stringify(response.data, null, 2)}
                    </code>
                  </pre>
                </div>
              </div>
            )}

            {/* Close Button */}
            <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
