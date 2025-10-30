/**
 * Leads API Endpoint
 * Handles CRUD operations for leads with multi-tenant isolation
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { leads, leadSources } from '@/lib/db/schema';
import { getCurrentUserOrganizationId } from '@/lib/db/helpers';
import { eq, and, desc, ilike, or, sql } from 'drizzle-orm';

/**
 * GET /api/leads
 * List all leads for the current user's organization
 * Query params: page, limit, search, status, temperature
 */
export async function GET(request: NextRequest) {
  try {
    // Get user's organization_id
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const temperature = searchParams.get('temperature') || '';

    const offset = (page - 1) * limit;

    // Build query conditions
    let conditions = [eq(leads.organizationId, organizationId)];

    if (status) {
      conditions.push(eq(leads.status, status));
    }

    if (temperature) {
      conditions.push(eq(leads.temperature, temperature));
    }

    // Search across multiple fields
    if (search) {
      conditions.push(
        or(
          ilike(leads.firstName, `%${search}%`),
          ilike(leads.lastName, `%${search}%`),
          ilike(leads.email, `%${search}%`),
          ilike(leads.company, `%${search}%`),
          ilike(leads.phone, `%${search}%`)
        )!
      );
    }

    // Execute query with pagination
    const [leadsData, countResult] = await Promise.all([
      db
        .select({
          id: leads.id,
          firstName: leads.firstName,
          lastName: leads.lastName,
          email: leads.email,
          phone: leads.phone,
          company: leads.company,
          status: leads.status,
          leadScore: leads.leadScore,
          temperature: leads.temperature,
          callAttempts: leads.callAttempts,
          lastCallAt: leads.lastCallAt,
          nextCallScheduledAt: leads.nextCallScheduledAt,
          tags: leads.tags,
          createdAt: leads.createdAt,
          updatedAt: leads.updatedAt,
          // Include source info
          source: {
            id: leadSources.id,
            name: leadSources.name,
            type: leadSources.type,
          },
        })
        .from(leads)
        .leftJoin(leadSources, eq(leads.sourceId, leadSources.id))
        .where(and(...conditions))
        .orderBy(desc(leads.createdAt))
        .limit(limit)
        .offset(offset),

      // Count total for pagination
      db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(and(...conditions)),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      data: leadsData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/leads
 * Create a new lead
 */
export async function POST(request: NextRequest) {
  try {
    // Get user's organization_id
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.email && !body.phone) {
      return NextResponse.json(
        { error: 'Either email or phone is required' },
        { status: 400 }
      );
    }

    // Create the lead
    const newLead = await db
      .insert(leads)
      .values({
        organizationId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        company: body.company,
        sourceId: body.sourceId,
        sourceType: body.sourceType || 'manual',
        status: body.status || 'new',
        leadScore: body.leadScore || 0,
        temperature: body.temperature || 'cold',
        aiNotes: body.aiNotes,
        customFields: body.customFields,
        rawData: body.rawData,
        tags: body.tags,
        consentToCall: body.consentToCall || false,
        consentToEmail: body.consentToEmail || false,
        doNotContact: body.doNotContact || false,
      })
      .returning();

    return NextResponse.json(
      { data: newLead[0], message: 'Lead created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating lead:', error);
    return NextResponse.json(
      { error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}
