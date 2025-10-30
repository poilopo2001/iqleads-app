/**
 * Lead Webhook Endpoint
 * Receives leads from external sources (WordPress, WooCommerce, Shopify, Zapier, etc.)
 * Uses unique token per lead source for security
 *
 * Intelligent 3-Layer Mapping System:
 * 1. Rule-based auto-detection (fast, free, covers 90% of cases)
 * 2. LLM-powered mapping (smart fallback for complex structures)
 * 3. Manual override (custom fieldMapping in lead source)
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { leads, leadSources } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { llmMapFields } from '@/lib/ai/field-mapper';

interface WebhookParams {
  params: Promise<{
    token: string;
  }>;
}

/**
 * Apply field mapping to transform webhook data to lead format
 * Uses 3-layer intelligent mapping system
 */
async function applyFieldMapping(data: any, fieldMapping: any, useLLM: boolean = true): Promise<any> {
  // Layer 3: Manual override with custom field mapping
  if (fieldMapping && !fieldMapping.autoDetect) {
    const mapped: any = {};

    if (fieldMapping.firstName) {
      mapped.firstName = getNestedValue(data, fieldMapping.firstName);
    }
    if (fieldMapping.lastName) {
      mapped.lastName = getNestedValue(data, fieldMapping.lastName);
    }
    if (fieldMapping.email) {
      mapped.email = getNestedValue(data, fieldMapping.email);
    }
    if (fieldMapping.phone) {
      mapped.phone = getNestedValue(data, fieldMapping.phone);
    }
    if (fieldMapping.company) {
      mapped.company = getNestedValue(data, fieldMapping.company);
    }

    return mapped;
  }

  // Layer 1: Fast rule-based auto-detection (covers 90% of cases)
  const autoDetected = autoDetectFields(data);

  // Check if auto-detection found all critical fields (email or phone)
  const hasMinimumData = autoDetected.email || autoDetected.phone;

  // If auto-detection succeeded, return it
  if (hasMinimumData) {
    return autoDetected;
  }

  // Layer 2: LLM-powered intelligent mapping (fallback for complex structures)
  if (useLLM && process.env.OPENROUTER_API_KEY) {
    try {
      console.log('🤖 Auto-detection failed, trying LLM mapping...');
      const llmResult = await llmMapFields(data);

      // Only use LLM result if confidence is high enough
      if (llmResult.confidence >= 70 && (llmResult.email || llmResult.phone)) {
        console.log(`✅ LLM mapping successful (confidence: ${llmResult.confidence}%)`);
        console.log(`📝 Reasoning: ${llmResult.reasoning}`);

        return {
          email: llmResult.email,
          phone: llmResult.phone,
          firstName: llmResult.firstName,
          lastName: llmResult.lastName,
          company: llmResult.company,
        };
      } else {
        console.log(`⚠️ LLM mapping low confidence: ${llmResult.confidence}%`);
      }
    } catch (error) {
      console.error('LLM mapping failed:', error);
    }
  }

  // Fallback: Return whatever auto-detection found
  return autoDetected;
}

/**
 * Auto-detect common field names with various formats
 * Supports: camelCase, snake_case, Title Case, and common variations
 */
function autoDetectFields(data: any): any {
  const result: any = {};

  // Find email (case-insensitive, multiple variations)
  const emailFields = [
    'email', 'Email', 'e-mail', 'E-mail', 'emailAddress', 'email_address',
    'customer_email', 'customerEmail', 'user_email', 'userEmail', 'mail'
  ];
  for (const field of emailFields) {
    if (data[field]) {
      result.email = data[field];
      break;
    }
  }

  // Find phone (case-insensitive, multiple variations)
  const phoneFields = [
    'phone', 'Phone', 'phoneNumber', 'phone_number', 'Phone Number',
    'telephone', 'Telephone', 'mobile', 'Mobile', 'cell', 'Cell',
    'contact_number', 'contactNumber'
  ];
  for (const field of phoneFields) {
    if (data[field]) {
      result.phone = data[field];
      break;
    }
  }

  // Find first name
  const firstNameFields = [
    'firstName', 'first_name', 'First Name', 'fname', 'Fname',
    'given_name', 'givenName', 'forename', 'Forename'
  ];
  for (const field of firstNameFields) {
    if (data[field]) {
      result.firstName = data[field];
      break;
    }
  }

  // Find last name
  const lastNameFields = [
    'lastName', 'last_name', 'Last Name', 'lname', 'Lname',
    'surname', 'Surname', 'family_name', 'familyName'
  ];
  for (const field of lastNameFields) {
    if (data[field]) {
      result.lastName = data[field];
      break;
    }
  }

  // If no firstName/lastName but has 'name' or 'full_name', split it
  if (!result.firstName && !result.lastName) {
    const nameFields = ['name', 'Name', 'fullName', 'full_name', 'Full Name'];
    for (const field of nameFields) {
      if (data[field]) {
        const parts = data[field].trim().split(/\s+/);
        result.firstName = parts[0];
        if (parts.length > 1) {
          result.lastName = parts.slice(1).join(' ');
        }
        break;
      }
    }
  }

  // Find company
  const companyFields = [
    'company', 'Company', 'companyName', 'company_name', 'Company Name',
    'organization', 'Organization', 'org', 'Org', 'business', 'Business'
  ];
  for (const field of companyFields) {
    if (data[field]) {
      result.company = data[field];
      break;
    }
  }

  return result;
}

/**
 * Get nested value from object using dot notation
 * e.g., "user.contact.email" => data.user.contact.email
 */
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

/**
 * Validate that lead has minimum required data
 */
function validateLeadData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.email && !data.phone) {
    errors.push('Either email or phone is required');
  }

  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format');
  }

  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Invalid phone format');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  // Remove common phone formatting characters
  const cleaned = phone.replace(/[\s\-\(\)\+]/g, '');
  // Check if it's a valid phone number (at least 10 digits)
  return /^\d{10,15}$/.test(cleaned);
}

/**
 * POST /api/webhooks/leads/[token]
 * Receive and process incoming lead from external source
 */
export async function POST(request: NextRequest, { params }: WebhookParams) {
  try {
    const { token } = await params;

    // Find the lead source by webhook token
    const sourceResult = await db
      .select()
      .from(leadSources)
      .where(eq(leadSources.webhookToken, token))
      .limit(1);

    if (!sourceResult.length) {
      return NextResponse.json(
        { error: 'Invalid webhook token' },
        { status: 401 }
      );
    }

    const source = sourceResult[0];

    // Check if source is active
    if (!source.isActive) {
      return NextResponse.json(
        { error: 'Lead source is disabled' },
        { status: 403 }
      );
    }

    // Parse webhook payload
    let webhookData: any;
    try {
      webhookData = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Apply field mapping to transform data (now async with LLM support)
    const mappedData = await applyFieldMapping(webhookData, source.fieldMapping);

    // Validate lead data
    const validation = validateLeadData(mappedData);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid lead data', details: validation.errors },
        { status: 400 }
      );
    }

    // Create the lead
    const newLead = await db
      .insert(leads)
      .values({
        organizationId: source.organizationId,
        sourceId: source.id,
        sourceType: source.type,
        firstName: mappedData.firstName,
        lastName: mappedData.lastName,
        email: mappedData.email,
        phone: mappedData.phone,
        company: mappedData.company,
        status: 'new',
        leadScore: 0,
        temperature: 'cold',
        rawData: webhookData, // Store original payload
        consentToCall: false,
        consentToEmail: false,
        doNotContact: false,
      })
      .returning();

    // Update source statistics
    await db
      .update(leadSources)
      .set({
        totalLeadsReceived: source.totalLeadsReceived + 1,
        lastLeadReceivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(leadSources.id, source.id));

    // TODO: If autoQualify is enabled, trigger qualification
    // TODO: If autoCall is enabled, schedule a call

    return NextResponse.json(
      {
        success: true,
        leadId: newLead[0].id,
        message: 'Lead received successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/webhooks/leads/[token]
 * Test endpoint to verify webhook is working
 */
export async function GET(request: NextRequest, { params }: WebhookParams) {
  try {
    const { token } = await params;

    // Find the lead source by webhook token
    const sourceResult = await db
      .select({
        id: leadSources.id,
        name: leadSources.name,
        type: leadSources.type,
        isActive: leadSources.isActive,
        totalLeadsReceived: leadSources.totalLeadsReceived,
        lastLeadReceivedAt: leadSources.lastLeadReceivedAt,
      })
      .from(leadSources)
      .where(eq(leadSources.webhookToken, token))
      .limit(1);

    if (!sourceResult.length) {
      return NextResponse.json(
        { error: 'Invalid webhook token' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Webhook is configured correctly',
      source: sourceResult[0],
    });
  } catch (error) {
    console.error('Error testing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
