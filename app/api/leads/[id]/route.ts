/**
 * Single Lead API Endpoint
 * Handles operations for a specific lead
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { leads, callLogs, leadSources } from '@/lib/db/schema';
import { getCurrentUserOrganizationId } from '@/lib/db/helpers';
import { eq, and, desc } from 'drizzle-orm';

/**
 * GET /api/leads/[id]
 * Get a single lead with call logs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Get lead with source info
    const leadData = await db
      .select()
      .from(leads)
      .leftJoin(leadSources, eq(leads.sourceId, leadSources.id))
      .where(
        and(eq(leads.id, id), eq(leads.organizationId, organizationId))
      )
      .limit(1);

    if (!leadData.length) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    // Get call logs for this lead
    const leadCallLogs = await db
      .select()
      .from(callLogs)
      .where(eq(callLogs.leadId, id))
      .orderBy(desc(callLogs.createdAt));

    return NextResponse.json({
      data: {
        ...leadData[0].leads,
        source: leadData[0].lead_sources,
        callLogs: leadCallLogs,
      },
    });
  } catch (error) {
    console.error('Error fetching lead:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/leads/[id]
 * Update a lead
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Update the lead
    const updatedLead = await db
      .update(leads)
      .set({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        company: body.company,
        status: body.status,
        leadScore: body.leadScore,
        temperature: body.temperature,
        preQualificationScore: body.preQualificationScore,
        finalQualificationScore: body.finalQualificationScore,
        aiNotes: body.aiNotes,
        nextCallScheduledAt: body.nextCallScheduledAt,
        customFields: body.customFields,
        tags: body.tags,
        consentToCall: body.consentToCall,
        consentToEmail: body.consentToEmail,
        doNotContact: body.doNotContact,
        updatedAt: new Date(),
      })
      .where(
        and(eq(leads.id, id), eq(leads.organizationId, organizationId))
      )
      .returning();

    if (!updatedLead.length) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: updatedLead[0],
      message: 'Lead updated successfully',
    });
  } catch (error) {
    console.error('Error updating lead:', error);
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/leads/[id]
 * Delete a lead
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Delete the lead (cascade will handle call_logs)
    const deletedLead = await db
      .delete(leads)
      .where(
        and(eq(leads.id, id), eq(leads.organizationId, organizationId))
      )
      .returning();

    if (!deletedLead.length) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Lead deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lead:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
