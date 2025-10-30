/**
 * CallIQ Stats Component
 * Displays real-time KPIs for lead qualification
 */

import { Phone, TrendingUp, Target, Zap, Users, CheckCircle } from 'lucide-react';
import { db } from '@/lib/db/client';
import { leads, callLogs, leadSources } from '@/lib/db/schema';
import { getCurrentUserOrganizationId } from '@/lib/db/helpers';
import { eq, and, sql, gte } from 'drizzle-orm';

async function getStats() {
  try {
    const organizationId = await getCurrentUserOrganizationId();

    if (!organizationId) {
      return null;
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

      // Hot leads
      db
        .select({ count: sql<number>`count(*)` })
        .from(leads)
        .where(
          and(
            eq(leads.organizationId, organizationId),
            eq(leads.temperature, 'hot')
          )
        ),

      // Qualified leads
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

      // Active sources
      db
        .select({ count: sql<number>`count(*)` })
        .from(leadSources)
        .where(
          and(
            eq(leadSources.organizationId, organizationId),
            eq(leadSources.isActive, true)
          )
        ),

      // Conversion rate
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
    const activeSources = Number(activeSourcesResult[0]?.count || 0);

    const total = Number(conversionRateResult[0]?.total || 0);
    const converted = Number(conversionRateResult[0]?.converted || 0);
    const conversionRate = total > 0 ? ((converted / total) * 100).toFixed(1) : '0.0';

    return {
      totalLeads,
      newLeads,
      hotLeads,
      qualifiedLeads,
      totalCalls,
      activeSources,
      conversionRate: parseFloat(conversionRate),
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return null;
  }
}

export async function CallIQStats() {
  const stats = await getStats();

  if (!stats) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        Unable to load statistics
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Leads',
      value: stats.totalLeads,
      icon: Users,
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      textColor: 'text-blue-600 dark:text-blue-400',
      valueColor: 'text-blue-900 dark:text-blue-100',
    },
    {
      label: 'New Leads (30d)',
      value: stats.newLeads,
      icon: TrendingUp,
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      textColor: 'text-green-600 dark:text-green-400',
      valueColor: 'text-green-900 dark:text-green-100',
    },
    {
      label: 'Hot Leads',
      value: stats.hotLeads,
      icon: Zap,
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      textColor: 'text-red-600 dark:text-red-400',
      valueColor: 'text-red-900 dark:text-red-100',
    },
    {
      label: 'Qualified',
      value: stats.qualifiedLeads,
      icon: Target,
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      textColor: 'text-purple-600 dark:text-purple-400',
      valueColor: 'text-purple-900 dark:text-purple-100',
    },
    {
      label: 'Total Calls',
      value: stats.totalCalls,
      icon: Phone,
      color: 'indigo',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      textColor: 'text-indigo-600 dark:text-indigo-400',
      valueColor: 'text-indigo-900 dark:text-indigo-100',
    },
    {
      label: 'Conversion Rate',
      value: `${stats.conversionRate}%`,
      icon: CheckCircle,
      color: 'emerald',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      valueColor: 'text-emerald-900 dark:text-emerald-100',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div key={index} className={`p-4 ${card.bgColor} rounded-lg`}>
            <div className="flex items-center justify-between">
              <p className={`text-sm font-medium ${card.textColor}`}>
                {card.label}
              </p>
              <Icon className={`h-5 w-5 ${card.textColor}`} />
            </div>
            <p className={`mt-2 text-3xl font-semibold ${card.valueColor}`}>
              {card.value}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function StatsLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, index) => (
        <div key={index} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg animate-pulse">
          <div className="flex items-center justify-between">
            <div className="h-4 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
            <div className="h-5 w-5 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
          <div className="mt-2 h-8 w-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      ))}
    </div>
  );
}
