/**
 * AI-Powered Field Mapping
 * Uses Google Gemini 2.0 Flash via OpenRouter to intelligently map webhook fields
 */

interface MappingResult {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  confidence: number;
  reasoning?: string;
}

/**
 * Use LLM to intelligently map fields from webhook data
 * This is a fallback when auto-detection fails
 */
export async function llmMapFields(webhookData: any): Promise<MappingResult> {
  try {
    const prompt = `You are an expert at mapping webhook/API data fields to a standardized lead format.

Given this webhook data:
${JSON.stringify(webhookData, null, 2)}

Extract and map the following fields if they exist:
- email (email address)
- phone (phone number)
- firstName (first name)
- lastName (last name)
- company (company/organization name)

IMPORTANT:
1. Look for field names that match these concepts (case-insensitive)
2. Handle nested objects (e.g., contact.email, user.profile.name)
3. If you find a full name field, split it into firstName and lastName
4. Return ONLY the extracted values, not the field paths
5. Use dot notation for nested fields (e.g., "user.email")

Return a JSON object with this EXACT structure:
{
  "email": "value or null",
  "phone": "value or null",
  "firstName": "value or null",
  "lastName": "value or null",
  "company": "value or null",
  "confidence": 0-100,
  "reasoning": "brief explanation"
}

Example input:
{
  "customer": {
    "contact_email": "john@example.com",
    "full_name": "John Doe"
  },
  "org": "Acme Corp"
}

Example output:
{
  "email": "john@example.com",
  "phone": null,
  "firstName": "John",
  "lastName": "Doe",
  "company": "Acme Corp",
  "confidence": 95,
  "reasoning": "Found email in customer.contact_email, split full_name into firstName/lastName, found company in org field"
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'IQLead',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1, // Low temperature for consistent results
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from LLM');
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from LLM response');
    }

    const result: MappingResult = JSON.parse(jsonMatch[0]);

    // Validate result
    if (typeof result.confidence !== 'number' || result.confidence < 0 || result.confidence > 100) {
      result.confidence = 50; // Default confidence
    }

    return result;
  } catch (error) {
    console.error('LLM field mapping error:', error);
    return {
      confidence: 0,
      reasoning: 'LLM mapping failed, falling back to empty result',
    };
  }
}

/**
 * Generate field mapping configuration from sample data
 * This can be used to auto-generate the fieldMapping JSON for a lead source
 */
export async function generateFieldMapping(sampleData: any): Promise<Record<string, string>> {
  try {
    const prompt = `You are an expert at analyzing webhook/API data structures and creating field mappings.

Given this sample webhook data:
${JSON.stringify(sampleData, null, 2)}

Generate a field mapping configuration that maps webhook fields to lead fields.
Use dot notation for nested fields (e.g., "customer.email" or "user.profile.phone").

Return ONLY a JSON object with this structure:
{
  "email": "path.to.email.field",
  "phone": "path.to.phone.field",
  "firstName": "path.to.firstName.field",
  "lastName": "path.to.lastName.field",
  "company": "path.to.company.field"
}

Only include fields that exist in the sample data. If a field doesn't exist, omit it.

Example input:
{
  "customer": {
    "contact_email": "john@example.com",
    "details": {
      "phone": "+1234567890"
    }
  },
  "business_name": "Acme Corp"
}

Example output:
{
  "email": "customer.contact_email",
  "phone": "customer.details.phone",
  "company": "business_name"
}`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'X-Title': process.env.NEXT_PUBLIC_APP_NAME || 'IQLead',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.0-flash-001',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No response from LLM');
    }

    // Parse the JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from LLM response');
    }

    const mapping: Record<string, string> = JSON.parse(jsonMatch[0]);
    return mapping;
  } catch (error) {
    console.error('LLM field mapping generation error:', error);
    return {};
  }
}

/**
 * Cache key for storing learned mappings
 */
export function getMappingCacheKey(sourceId: string, dataStructure: string): string {
  // Create a hash of the data structure to detect similar payloads
  const structureKeys = JSON.stringify(Object.keys(dataStructure).sort());
  return `mapping:${sourceId}:${Buffer.from(structureKeys).toString('base64').slice(0, 20)}`;
}
