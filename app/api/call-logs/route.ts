/**
 * Call Logs API Endpoint
 * Manages call history with AI analysis and transcriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { callLogs, leads } from '@/lib/db/schema';
import { getCurrentUserOrganizationId } from '@/lib/db/helpers';
import { eq, and, desc, gte, lte, sql } from 'drizzle-orm';

/**
 * GET /api/call-logs
 * List all call logs for the current user's organization
 * Query params: page, limit, leadId, status, startDate, endDate
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
    const leadId = searchParams.get('leadId') || '';
    const status = searchParams.get('status') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    const offset = (page - 1) * limit;

    // Build query conditions
    let conditions = [eq(callLogs.organizationId, organizationId)];

    if (leadId) {
      conditions.push(eq(callLogs.leadId, leadId));
    }

    if (status) {
      conditions.push(eq(callLogs.status, status));
    }

    if (startDate) {
      conditions.push(gte(callLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(callLogs.createdAt, new Date(endDate)));
    }

    // Execute query with pagination
    const [callLogsData, countResult] = await Promise.all([
      db
        .select({
          id: callLogs.id,
          leadId: callLogs.leadId,
          callSid: callLogs.callSid,
          direction: callLogs.direction,
          status: callLogs.status,
          fromNumber: callLogs.fromNumber,
          toNumber: callLogs.toNumber,
          duration: callLogs.duration,
          recordingUrl: callLogs.recordingUrl,
          recordingDuration: callLogs.recordingDuration,
          transcriptionStatus: callLogs.transcriptionStatus,
          sentimentScore: callLogs.sentimentScore,
          qualificationScore: callLogs.qualificationScore,
          keyPoints: callLogs.keyPoints,
          outcome: callLogs.outcome,
          notes: callLogs.notes,
          nextAction: callLogs.nextAction,
          costCredits: callLogs.costCredits,
          startedAt: callLogs.startedAt,
          endedAt: callLogs.endedAt,
          createdAt: callLogs.createdAt,
          // Include lead info
          lead: {
            id: leads.id,
            firstName: leads.firstName,
            lastName: leads.lastName,
            email: leads.email,
            phone: leads.phone,
            company: leads.company,
          },
        })
        .from(callLogs)
        .leftJoin(leads, eq(callLogs.leadId, leads.id))
        .where(and(...conditions))
        .orderBy(desc(callLogs.createdAt))
        .limit(limit)
        .offset(offset),

      db
        .select({ count: sql<number>`count(*)` })
        .from(callLogs)
        .where(and(...conditions)),
    ]);

    const total = Number(countResult[0]?.count || 0);

    return NextResponse.json({
      data: callLogsData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching call logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch call logs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/call-logs
 * Create a new call log entry
 */
export async function POST(request: NextRequest) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.direction || !body.toNumber) {
      return NextResponse.json(
        { error: 'Direction and to_number are required' },
        { status: 400 }
      );
    }

    // Create the call log
    const newCallLog = await db
      .insert(callLogs)
      .values({
        organizationId,
        leadId: body.leadId,
        callSid: body.callSid,
        direction: body.direction,
        status: body.status || 'initiated',
        fromNumber: body.fromNumber,
        toNumber: body.toNumber,
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
        costCredits: body.costCredits || 1,
        providerData: body.providerData,
        startedAt: body.startedAt ? new Date(body.startedAt) : null,
        endedAt: body.endedAt ? new Date(body.endedAt) : null,
      })
      .returning();

    return NextResponse.json(
      {
        data: newCallLog[0],
        message: 'Call log created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating call log:', error);
    return NextResponse.json(
      { error: 'Failed to create call log' },
      { status: 500 }
    );
  }
}
