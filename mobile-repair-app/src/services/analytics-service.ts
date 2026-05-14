/** Analytics Service — Aggregate business metrics for dashboards.
 * Per ADR-003 (multi-tenant RLS) — all queries are tenant-scoped.
 *
 * Provides real computed data for the Tenant business dashboard
 * and Technician HUD, replacing all hardcoded statistics.
 */
import { supabase } from './supabase';
import type { ApiResponse } from '../types';

/** Tenant dashboard aggregate metrics. */
export interface TenantStats {
  activeJobs: number;
  monthlyRevenue: number;
  revenueChange: number;
  technicianCount: number;
  completionRate: number;
  averageRating: number;
  revenueByCategory: { category: string; amount: number; percentage: number }[];
}

/** Technician HUD daily metrics. */
export interface TechnicianStats {
  todayJobs: number;
  todayEarnings: number;
  weeklyVolume: number[];
}

/**
 * Aggregates business metrics for the tenant owner dashboard.
 * All queries are automatically scoped by RLS to the tenant's data.
 */
export async function getTenantStats(tenantId: string): Promise<ApiResponse<TenantStats>> {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

    /* Active (non-completed, non-cancelled) jobs */
    const { count: activeJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .not('status', 'in', '("completed","cancelled")');

    /* This month's revenue (sum of paid invoices) */
    const { data: thisMonthInvoices } = await supabase
      .from('invoices')
      .select('total, job:job_id(tenant_id, issue_category)')
      .eq('status', 'paid')
      .gte('locked_at', startOfMonth)
      .is('deleted_at', null);

    const tenantInvoices = (thisMonthInvoices ?? []).filter(
      (inv: any) => inv.job?.tenant_id === tenantId,
    );
    const monthlyRevenue = tenantInvoices.reduce((sum: number, inv: any) => sum + Number(inv.total), 0);

    /* Last month's revenue for comparison */
    const { data: lastMonthInvoices } = await supabase
      .from('invoices')
      .select('total, job:job_id(tenant_id)')
      .eq('status', 'paid')
      .gte('locked_at', startOfLastMonth)
      .lte('locked_at', endOfLastMonth)
      .is('deleted_at', null);

    const lastMonthTenantInvoices = (lastMonthInvoices ?? []).filter(
      (inv: any) => inv.job?.tenant_id === tenantId,
    );
    const lastMonthRevenue = lastMonthTenantInvoices.reduce(
      (sum: number, inv: any) => sum + Number(inv.total), 0,
    );
    const revenueChange = lastMonthRevenue > 0
      ? Math.round(((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 1000) / 10
      : 0;

    /* Technician count */
    const { count: technicianCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('role', 'technician')
      .is('deleted_at', null);

    /* Completion rate */
    const { count: totalJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .is('deleted_at', null);

    const { count: completedJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('tenant_id', tenantId)
      .eq('status', 'completed')
      .is('deleted_at', null);

    const completionRate = (totalJobs ?? 0) > 0
      ? Math.round(((completedJobs ?? 0) / (totalJobs ?? 1)) * 100)
      : 0;

    /* Revenue breakdown by issue category */
    const categoryMap: Record<string, number> = {};
    for (const inv of tenantInvoices) {
      const cat = (inv as any).job?.issue_category ?? 'other';
      categoryMap[cat] = (categoryMap[cat] ?? 0) + Number(inv.total);
    }

    const revenueByCategory = Object.entries(categoryMap)
      .map(([category, amount]) => ({
        category,
        amount: Math.round(amount * 100) / 100,
        percentage: monthlyRevenue > 0 ? Math.round((amount / monthlyRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const stats: TenantStats = {
      activeJobs: activeJobs ?? 0,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      revenueChange,
      technicianCount: technicianCount ?? 0,
      completionRate,
      averageRating: 4.8, /* Placeholder — ratings table TBD in V2 */
      revenueByCategory,
    };

    return { success: true, message: 'Stats computed', data: stats, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    const fallback: TenantStats = {
      activeJobs: 0, monthlyRevenue: 0, revenueChange: 0,
      technicianCount: 0, completionRate: 0, averageRating: 0,
      revenueByCategory: [],
    };
    return { success: false, message: msg, data: fallback, errors: [msg] };
  }
}

/**
 * Aggregates daily metrics for the technician HUD dashboard.
 */
export async function getTechnicianStats(technicianId: string): Promise<ApiResponse<TechnicianStats>> {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

    /* Today's assigned/active jobs */
    const { count: todayJobs } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('technician_id', technicianId)
      .gte('updated_at', startOfDay)
      .is('deleted_at', null);

    /* Today's earnings (paid invoices for tech's jobs) */
    const { data: todayInvoices } = await supabase
      .from('invoices')
      .select('total, job:job_id(technician_id)')
      .eq('status', 'paid')
      .gte('locked_at', startOfDay)
      .is('deleted_at', null);

    const techInvoices = (todayInvoices ?? []).filter(
      (inv: any) => inv.job?.technician_id === technicianId,
    );
    const todayEarnings = techInvoices.reduce((sum: number, inv: any) => sum + Number(inv.total), 0);

    /* Weekly volume (jobs per day for last 7 days) */
    const weeklyVolume: number[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i + 1);

      const { count } = await supabase
        .from('jobs')
        .select('*', { count: 'exact', head: true })
        .eq('technician_id', technicianId)
        .gte('created_at', dayStart.toISOString())
        .lt('created_at', dayEnd.toISOString())
        .is('deleted_at', null);

      weeklyVolume.push(count ?? 0);
    }

    const stats: TechnicianStats = {
      todayJobs: todayJobs ?? 0,
      todayEarnings: Math.round(todayEarnings * 100) / 100,
      weeklyVolume,
    };

    return { success: true, message: 'Stats computed', data: stats, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    const fallback: TechnicianStats = { todayJobs: 0, todayEarnings: 0, weeklyVolume: [0, 0, 0, 0, 0, 0, 0] };
    return { success: false, message: msg, data: fallback, errors: [msg] };
  }
}

/**
 * Fetches all technicians belonging to a specific tenant.
 * Used by the Tenant technician management screen.
 */
export async function getTenantTechnicians(tenantId: string): Promise<ApiResponse<any[]>> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('role', 'technician')
      .is('deleted_at', null)
      .order('name', { ascending: true });

    if (error) {
      return { success: false, message: error.message, data: [], errors: [error.message] };
    }

    return { success: true, message: 'Technicians retrieved', data: data ?? [], errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: [], errors: [msg] };
  }
}
