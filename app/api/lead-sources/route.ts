/**
 * Lead Sources API Endpoint
 * Manages webhook configurations for lead ingestion
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { leadSources } from '@/lib/db/schema';
import { getCurrentUserOrganizationId } from '@/lib/db/helpers';
import { eq, and, desc } from 'drizzle-orm';
import { randomBytes } from 'crypto';

/**
 * Generate a secure webhook token
 */
function generateWebhookToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * GET /api/lead-sources
 * List all lead sources for the current user's organization
 * Query params: page, limit
 */
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const offset = (page - 1) * limit;

    // Execute query with pagination
    const [sourcesData, countResult] = await Promise.all([
      db
        .select()
        .from(leadSources)
        .where(eq(leadSources.organizationId, organizationId))
        .orderBy(desc(leadSources.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: db.$count(leadSources) })
        .from(leadSources)
        .where(eq(leadSources.organizationId, organizationId)),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      data: sourcesData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching lead sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead sources' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/lead-sources
 * Create a new lead source with webhook configuration
 */
export async function POST(request: NextRequest) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.type) {
      return NextResponse.json(
        { error: 'Name and type are required' },
        { status: 400 }
      );
    }

    // Generate unique webhook token
    const webhookToken = generateWebhookToken();

    // Create webhook URL based on the environment
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const webhookUrl = `${baseUrl}/api/webhooks/leads/${webhookToken}`;

    // Create the lead source
    const newSource = await db
      .insert(leadSources)
      .values({
        organizationId,
        name: body.name,
        description: body.description,
        type: body.type,
        webhookToken,
        webhookUrl,
        isActive: body.isActive !== undefined ? body.isActive : true,
        autoQualify: body.autoQualify !== undefined ? body.autoQualify : true,
        autoCall: body.autoCall !== undefined ? body.autoCall : false,
        fieldMapping: body.fieldMapping,
        qualificationRuleId: body.qualificationRuleId,
      })
      .returning();

    return NextResponse.json(
      {
        data: newSource[0],
        message: 'Lead source created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead source:', error);
    return NextResponse.json(
      { error: 'Failed to create lead source' },
      { status: 500 }
    );
  }
}
