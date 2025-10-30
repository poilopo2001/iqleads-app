/**
 * Edit Source Modal Component
 * Form for editing an existing lead source
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

interface EditSourceModalProps {
  source: any;
  onClose: () => void;
}

const SOURCE_TYPES = [
  { value: 'wordpress', label: 'WordPress' },
  { value: 'woocommerce', label: 'WooCommerce' },
  { value: 'shopify', label: 'Shopify' },
  { value: 'zapier', label: 'Zapier' },
  { value: 'custom', label: 'Custom Webhook' },
  { value: 'api', label: 'API Integration' },
];

export function EditSourceModal({ source, onClose }: EditSourceModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: source.name || '',
    type: source.type || 'custom',
    description: source.description || '',
    isActive: source.isActive !== undefined ? source.isActive : true,
    autoQualify: source.autoQualify !== undefined ? source.autoQualify : true,
    autoCall: source.autoCall !== undefined ? source.autoCall : false,
    fieldMapping: source.fieldMapping ? JSON.stringify(source.fieldMapping, null, 2) : '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let fieldMappingObj = null;
      if (formData.fieldMapping.trim()) {
        try {
          fieldMappingObj = JSON.parse(formData.fieldMapping);
        } catch (err) {
          setError('Invalid JSON in field mapping');
          return;
        }
      }

      const response = await fetch(`/api/lead-sources/${source.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          description: formData.description || null,
          isActive: formData.isActive,
          autoQualify: formData.autoQualify,
          autoCall: formData.autoCall,
          fieldMapping: fieldMappingObj,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update source');
      }

      startTransition(() => {
        router.refresh();
        onClose();
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Edit Lead Source
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-800 dark:text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Website Contact Form"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SOURCE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional description of this source"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Active (receive webhooks)
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoQualify"
                  checked={formData.autoQualify}
                  onChange={(e) => setFormData({ ...formData, autoQualify: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoQualify" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Auto-qualify leads from this source
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="autoCall"
                  checked={formData.autoCall}
                  onChange={(e) => setFormData({ ...formData, autoCall: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoCall" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  Auto-call qualified leads
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Field Mapping (JSON)
              </label>
              <textarea
                value={formData.fieldMapping}
                onChange={(e) => setFormData({ ...formData, fieldMapping: e.target.value })}
                rows={6}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={`{\n  "email": "customer_email",\n  "phone": "billing_phone",\n  "firstName": "first_name",\n  "lastName": "last_name"\n}`}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Map webhook fields to lead fields. Leave empty to use default mapping.
              </p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                Webhook URL (Read-only)
              </h3>
              <input
                type="text"
                value={source.webhookUrl}
                readOnly
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
