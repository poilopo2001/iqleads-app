/**
 * Single Call Log API Endpoint
 * Handles operations for a specific call log
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { callLogs, leads } from '@/lib/db/schema';
import { getCurrentUserOrganizationId } from '@/lib/db/helpers';
import { eq, and } from 'drizzle-orm';

/**
 * GET /api/call-logs/[id]
 * Get a single call log with full details including transcription and AI analysis
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get call log with lead info
    const callLogData = await db
      .select()
      .from(callLogs)
      .leftJoin(leads, eq(callLogs.leadId, leads.id))
      .where(
        and(
          eq(callLogs.id, params.id),
          eq(callLogs.organizationId, organizationId)
        )
      )
      .limit(1);

    if (!callLogData.length) {
      return NextResponse.json(
        { error: 'Call log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: {
        ...callLogData[0].call_logs,
        lead: callLogData[0].leads,
      },
    });
  } catch (error) {
    console.error('Error fetching call log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call log' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/call-logs/[id]
 * Update a call log (typically for adding transcription, AI analysis, outcomes)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Update the call log
    const updatedCallLog = await db
      .update(callLogs)
      .set({
        status: body.status,
        duration: body.duration,
        recordingUrl: body.recordingUrl,
        recordingDuration: body.recordingDuration,
        transcription: body.transcription,
        transcriptionStatus: body.transcriptionStatus,
        aiAnalysis: body.aiAnalysis,
        sentimentScore: body.sentimentScore,
        qualificationScore: body.qualificationScore,
        keyPoints: body.keyPoints,
        outcome: body.outcome,
        notes: body.notes,
        nextAction: body.nextAction,
        providerData: body.providerData,
        endedAt: body.endedAt ? new Date(body.endedAt) : undefined,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(callLogs.id, params.id),
          eq(callLogs.organizationId, organizationId)
        )
      )
      .returning();

    if (!updatedCallLog.length) {
      return NextResponse.json(
        { error: 'Call log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: updatedCallLog[0],
      message: 'Call log updated successfully',
    });
  } catch (error) {
    console.error('Error updating call log:', error);
    return NextResponse.json(
      { error: 'Failed to update call log' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/call-logs/[id]
 * Delete a call log
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Delete the call log
    const deletedCallLog = await db
      .delete(callLogs)
      .where(
        and(
          eq(callLogs.id, params.id),
          eq(callLogs.organizationId, organizationId)
        )
      )
      .returning();

    if (!deletedCallLog.length) {
      return NextResponse.json(
        { error: 'Call log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: 'Call log deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting call log:', error);
    return NextResponse.json(
      { error: 'Failed to delete call log' },
      { status: 500 }
    );
  }
}
