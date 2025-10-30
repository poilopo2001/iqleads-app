/**
 * Create Source Modal Component - SIMPLIFIED
 * Easy 3-step process to create a lead source
 */

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { X, Copy, Check, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface CreateSourceModalProps {
  onClose: () => void;
}

const SOURCE_TYPES = [
  { value: 'zapier', label: '⚡ Zapier', popular: true },
  { value: 'make', label: '🔧 Make (Integromat)', popular: true },
  { value: 'typeform', label: '📋 TypeForm', popular: true },
  { value: 'google_forms', label: '📊 Google Forms', popular: true },
  { value: 'hubspot', label: '🎯 HubSpot', popular: false },
  { value: 'wordpress', label: '📝 WordPress', popular: false },
  { value: 'woocommerce', label: '🛒 WooCommerce', popular: false },
  { value: 'shopify', label: '🏪 Shopify', popular: false },
  { value: 'custom', label: '🔌 Custom Webhook', popular: false },
  { value: 'api', label: '⚙️ API Integration', popular: false },
];

// Pre-configured templates for popular integrations
const FIELD_TEMPLATES: Record<string, any> = {
  zapier: {
    // Auto-detect common field names
    autoDetect: true,
    example: { email: 'email', phone: 'phone', firstName: 'first_name', lastName: 'last_name' }
  },
  make: {
    autoDetect: true,
    example: { email: 'email', phone: 'phone', firstName: 'firstName', lastName: 'lastName' }
  },
  typeform: {
    email: 'email',
    phone: 'phone_number',
    firstName: 'first_name',
    lastName: 'last_name',
    company: 'company'
  },
  google_forms: {
    autoDetect: true,
    example: { email: 'Email', phone: 'Phone', firstName: 'First Name', lastName: 'Last Name' }
  },
  hubspot: {
    email: 'properties.email',
    phone: 'properties.phone',
    firstName: 'properties.firstname',
    lastName: 'properties.lastname',
    company: 'properties.company'
  },
  custom: {
    autoDetect: true,
    example: { email: 'email', phone: 'phone', firstName: 'firstName', lastName: 'lastName' }
  }
};

export function CreateSourceModal({ onClose }: CreateSourceModalProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [createdSource, setCreatedSource] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'zapier',
    description: '',
    isActive: true,
    autoQualify: true,
    autoCall: false,
    fieldMapping: '',
  });

  const selectedTemplate = FIELD_TEMPLATES[formData.type];
  const isAutoDetect = selectedTemplate?.autoDetect;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      let fieldMappingObj = null;

      // Use template mapping if not auto-detect and not custom
      if (!isAutoDetect && formData.type in FIELD_TEMPLATES && !formData.fieldMapping.trim()) {
        fieldMappingObj = FIELD_TEMPLATES[formData.type];
      } else if (formData.fieldMapping.trim()) {
        try {
          fieldMappingObj = JSON.parse(formData.fieldMapping);
        } catch (err) {
          setError('Invalid JSON format in field mapping');
          return;
        }
      }

      const response = await fetch('/api/lead-sources', {
        method: 'POST',
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
        throw new Error(data.error || 'Failed to create source');
      }

      const result = await response.json();
      setCreatedSource(result.data);

      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleCopyUrl = async () => {
    if (!createdSource?.webhookUrl) return;
    try {
      await navigator.clipboard.writeText(createdSource.webhookUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Success screen
  if (createdSource) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                ✅ Source Created!
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-800 dark:text-green-400">
                  Your webhook is ready! Copy the URL below and paste it into your {SOURCE_TYPES.find(t => t.value === createdSource.type)?.label} integration.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  📍 Your Webhook URL
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={createdSource.webhookUrl}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm"
                  />
                  <button
                    onClick={handleCopyUrl}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                  🚀 Next Steps
                </h3>
                <div className="text-sm text-blue-800 dark:text-blue-400 space-y-2">
                  <p><strong>1.</strong> Copy the webhook URL above (button clicked ✓)</p>
                  <p><strong>2.</strong> Open your {SOURCE_TYPES.find(t => t.value === createdSource.type)?.label} and configure it to send data to this URL</p>
                  <p><strong>3.</strong> Send a test lead to verify everything works</p>
                  <p><strong>4.</strong> Use the "Test Webhook" feature on the sources page if needed</p>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Creation form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Create New Lead Source
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

            {/* Step 1: Choose Integration */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                    1
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Choose Your Integration
                  </h3>
                  <p className="mt-1 text-xs text-blue-800 dark:text-blue-400">
                    Select where your leads will come from
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Integration Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <optgroup label="🌟 Popular">
                  {SOURCE_TYPES.filter(t => t.popular).map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="More Options">
                  {SOURCE_TYPES.filter(t => !t.popular).map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </optgroup>
              </select>

              {isAutoDetect && (
                <div className="mt-2 flex items-start space-x-2 text-xs text-green-600 dark:text-green-400">
                  <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <p>
                    <strong>Auto-configured!</strong> We'll automatically detect common fields like email, phone, firstName, lastName.
                  </p>
                </div>
              )}
            </div>

            {/* Step 2: Name & Settings */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white text-sm font-bold">
                    2
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300">
                    Name & Configure
                  </h3>
                  <p className="mt-1 text-xs text-blue-800 dark:text-blue-400">
                    Give it a memorable name and choose your settings
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Source Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Website Contact Form, Landing Page Leads"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
                className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Optional notes about this lead source"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Active</span>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Start receiving leads immediately</span>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="autoQualify"
                  checked={formData.autoQualify}
                  onChange={(e) => setFormData({ ...formData, autoQualify: e.target.checked })}
                  className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoQualify" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Auto-qualify leads</span>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Automatically mark leads from this source as qualified</span>
                </label>
              </div>

              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="autoCall"
                  checked={formData.autoCall}
                  onChange={(e) => setFormData({ ...formData, autoCall: e.target.checked })}
                  className="h-4 w-4 mt-0.5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="autoCall" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                  <span className="font-medium">Auto-call qualified leads</span>
                  <span className="text-gray-500 dark:text-gray-400 block text-xs">Automatically initiate AI calls to qualified leads</span>
                </label>
              </div>
            </div>

            {/* Advanced Options (Collapsible) */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                {showAdvanced ? (
                  <ChevronUp className="h-4 w-4 mr-2" />
                ) : (
                  <ChevronDown className="h-4 w-4 mr-2" />
                )}
                Advanced: Custom Field Mapping {!isAutoDetect && '(Optional)'}
              </button>

              {showAdvanced && (
                <div className="mt-4 space-y-4">
                  {isAutoDetect ? (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="ml-3 text-sm text-yellow-800 dark:text-yellow-400">
                          <p className="font-medium mb-1">Auto-detection is enabled</p>
                          <p>We'll automatically map these common fields:</p>
                          <ul className="mt-2 space-y-1 list-disc list-inside text-xs">
                            <li><code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">email</code>, <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">Email</code>, <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">customer_email</code></li>
                            <li><code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">phone</code>, <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">Phone</code>, <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">phone_number</code></li>
                            <li><code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">firstName</code>, <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">first_name</code>, <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">First Name</code></li>
                            <li><code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">lastName</code>, <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">last_name</code>, <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">Last Name</code></li>
                            <li><code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">company</code>, <code className="bg-yellow-100 dark:bg-yellow-900/40 px-1 rounded">Company</code></li>
                          </ul>
                          <p className="mt-2">Only add custom mapping below if you need to override this.</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-start">
                        <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                        <div className="ml-3 text-sm text-green-800 dark:text-green-400">
                          <p className="font-medium mb-1">Pre-configured for {SOURCE_TYPES.find(t => t.value === formData.type)?.label}</p>
                          <p className="text-xs">We've set up the field mapping for you. You can customize it below if needed.</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Custom Field Mapping (JSON)
                    </label>
                    <textarea
                      value={formData.fieldMapping}
                      onChange={(e) => setFormData({ ...formData, fieldMapping: e.target.value })}
                      rows={6}
                      className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={JSON.stringify(selectedTemplate.example || selectedTemplate, null, 2)}
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Map webhook fields to lead fields. Example: {`{"email": "customer_email", "phone": "billing_phone"}`}
                    </p>
                  </div>
                </div>
              )}
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
                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50"
              >
                {isPending ? 'Creating...' : '✨ Create Source'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
