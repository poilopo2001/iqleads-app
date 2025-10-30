/**
 * Single Lead Source API Endpoint
 * Handles operations for a specific lead source
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { leadSources } from '@/lib/db/schema';
import { getCurrentUserOrganizationId } from '@/lib/db/helpers';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/lead-sources/[id]
 * Get a single lead source with statistics
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get lead source
    const sourceData = await db
      .select()
      .from(leadSources)
      .where(
        and(
          eq(leadSources.id, id),
          eq(leadSources.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!sourceData.length) {
      return NextResponse.json(
        { error: 'Lead source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: sourceData[0],
    });
  } catch (error) {
    console.error('Error fetching lead source:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lead source' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/lead-sources/[id]
 * Update a lead source
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Update the lead source
    const updatedSource = await db
      .update(leadSources)
      .set({
        name: body.name,
        description: body.description,
        isActive: body.isActive,
        autoQualify: body.autoQualify,
        autoCall: body.autoCall,
        fieldMapping: body.fieldMapping,
        qualificationRuleId: body.qualificationRuleId,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(leadSources.id, id),
          eq(leadSources.organizationId, organizationId)
        )
      )
      .returning();

    if (!updatedSource.length) {
      return NextResponse.json(
        { error: 'Lead source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: updatedSource[0],
      message: 'Lead source updated successfully',
    });
  } catch (error) {
    console.error('Error updating lead source:', error);
    return NextResponse.json(
      { error: 'Failed to update lead source' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/lead-sources/[id]
 * Delete a lead source
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the lead source
    const deletedSource = await db
      .delete(leadSources)
      .where(
        and(
          eq(leadSources.id, id),
          eq(leadSources.organizationId, organizationId)
        )
      )
      .returning();

    if (!deletedSource.length) {
      return NextResponse.json(
        { error: 'Lead source not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Lead source deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting lead source:', error);
    return NextResponse.json(
      { error: 'Failed to delete lead source' },
      { status: 500 }
    );
  }
}
