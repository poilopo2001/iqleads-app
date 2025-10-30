/**
 * Stats API Endpoint
 * Provides KPIs and statistics for the CallIQ dashboard
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { leads, callLogs, leadSources } from '@/lib/db/schema';
import { getCurrentUserOrganizationId } from '@/lib/db/helpers';
import { eq, and, sql, gte } from 'drizzle-orm';

/**
 * GET /api/stats
 * Get dashboard statistics and KPIs
 */
export async function GET(request: NextRequest) {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Calculate date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all stats in parallel
    const [
      totalLeadsResult,
      newLeadsResult,
      hotLeadsResult,
      qualifiedLeadsResult,
      totalCallsResult,
      recentCallsResult,
      activeSourcesResult,
      conversionRateResult,
    ] = await Promise.all([
      // Total leads
      db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(eq(leads.organizationId, organizationId)),

      // New leads (last 30 days)
      db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(
          and(
            eq(leads.organizationId, organizationId),
            gte(leads.createdAt, thirtyDaysAgo)
          )
        ),

      // Hot leads (temperature = 'hot')
      db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(
          and(
            eq(leads.organizationId, organizationId),
            eq(leads.temperature, 'hot')
          )
        ),

      // Qualified leads (status = 'qualified')
      db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(
          and(
            eq(leads.organizationId, organizationId),
            eq(leads.status, 'qualified')
          )
        ),

      // Total calls
      db
        .select({ count: sql<number>`count(*)` })
        .from(callLogs)
        .where(eq(callLogs.organizationId, organizationId)),

      // Recent calls (last 30 days)
      db
        .select({ count: sql<number>`count(*)` })
        .from(callLogs)
        .where(
          and(
            eq(callLogs.organizationId, organizationId),
            gte(callLogs.createdAt, thirtyDaysAgo)
          )
        ),

      // Active lead sources
      db
        .select({ count: sql<number>`count(*)` })
        .from(leadSources)
        .where(
          and(
            eq(leadSources.organizationId, organizationId),
            eq(leadSources.isActive, true)
          )
        ),

      // Conversion rate (converted leads / total leads)
      db
        .select({
          total: sql<number>`count(*)`,
          converted: sql<number>`count(*) filter (where ${leads.status} = 'converted')`,
        })
        .from(leads)
        .where(eq(leads.organizationId, organizationId)),
    ]);

    const totalLeads = Number(totalLeadsResult[0]?.count || 0);
    const newLeads = Number(newLeadsResult[0]?.count || 0);
    const hotLeads = Number(hotLeadsResult[0]?.count || 0);
    const qualifiedLeads = Number(qualifiedLeadsResult[0]?.count || 0);
    const totalCalls = Number(totalCallsResult[0]?.count || 0);
    const recentCalls = Number(recentCallsResult[0]?.count || 0);
    const activeSources = Number(activeSourcesResult[0]?.count || 0);

    const total = Number(conversionRateResult[0]?.total || 0);
    const converted = Number(conversionRateResult[0]?.converted || 0);
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';

    // Get lead status distribution
    const statusDistribution = await db
      .select({
        status: leads.status,
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(eq(leads.organizationId, organizationId))
      .groupBy(leads.status);

    // Get temperature distribution
    const temperatureDistribution = await db
      .select({
        temperature: leads.temperature,
        count: sql<number>`count(*)`,
      })
      .from(leads)
      .where(eq(leads.organizationId, organizationId))
      .groupBy(leads.temperature);

    return NextResponse.json({
      data: {
        overview: {
          totalLeads,
          newLeads,
          hotLeads,
          qualifiedLeads,
          totalCalls,
          recentCalls,
          activeSources,
          conversionRate: parseFloat(conversionRate),
        },
        distributions: {
          status: statusDistribution.map((item) => ({
            status: item.status,
            count: Number(item.count),
          })),
          temperature: temperatureDistribution.map((item) => ({
            temperature: item.temperature,
            count: Number(item.count),
          })),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
