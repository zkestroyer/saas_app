/** Job Service — Full Supabase CRUD for repair jobs.
 * Per ADR-009 (repair branching), ADR-007 (soft deletes),
 * and SaaS Blueprint §4.1–§4.2.
 *
 * Replaces all hardcoded job data with real database operations.
 */
import { supabase } from './supabase';
import { logAudit, AuditActions } from './audit-service';
import type { Job, JobStatus, ApiResponse } from '../types';

/** Valid job status transitions (state machine). */
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['assigned', 'cancelled'],
  assigned: ['en_route', 'cancelled'],
  en_route: ['diagnosing', 'cancelled'],
  diagnosing: ['repairing', 'cancelled'],
  repairing: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/** Input shape for creating a new job. */
export interface CreateJobInput {
  customer_id: string;
  tenant_id: string;
  device_brand: string;
  device_model: string;
  issue_category: string;
  description: string;
  photos?: string[];
  service_type: string;
  location?: { address: string; latitude?: number; longitude?: number };
  scheduled_at?: string | null;
}

/**
 * Creates a new repair job booking.
 * Called from the customer booking screen.
 */
export async function createJob(input: CreateJobInput): Promise<ApiResponse<Job | null>> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        customer_id: input.customer_id,
        tenant_id: input.tenant_id,
        device_brand: input.device_brand,
        device_model: input.device_model,
        issue_category: input.issue_category,
        description: input.description,
        photos: input.photos ?? [],
        service_type: input.service_type,
        status: 'pending',
        location: input.location ?? {},
        scheduled_at: input.scheduled_at ?? null,
      })
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    logAudit(input.customer_id, AuditActions.JOB_CREATED, 'jobs', data.id, {
      device: `${input.device_brand} ${input.device_model}`,
      issue_category: input.issue_category,
    });

    return { success: true, message: 'Job created', data: data as Job, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}

/**
 * Retrieves all active jobs for a specific customer.
 * Soft-deleted records are excluded.
 */
export async function getCustomerJobs(customerId: string): Promise<ApiResponse<Job[]>> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('customer_id', customerId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, message: error.message, data: [], errors: [error.message] };
    }

    return { success: true, message: 'Jobs retrieved', data: (data ?? []) as Job[], errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: [], errors: [msg] };
  }
}

/**
 * Retrieves all jobs assigned to a specific technician.
 * Sorted by status priority (assigned/en_route first).
 */
export async function getTechnicianJobs(technicianId: string): Promise<ApiResponse<Job[]>> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, customer:customer_id(name, email, phone)')
      .eq('technician_id', technicianId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, message: error.message, data: [], errors: [error.message] };
    }

    return { success: true, message: 'Jobs retrieved', data: (data ?? []) as Job[], errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: [], errors: [msg] };
  }
}

/**
 * Retrieves all jobs within a tenant (for tenant owner dashboard).
 */
export async function getTenantJobs(tenantId: string): Promise<ApiResponse<Job[]>> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('*, customer:customer_id(name), technician:technician_id(name)')
      .eq('tenant_id', tenantId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, message: error.message, data: [], errors: [error.message] };
    }

    return { success: true, message: 'Jobs retrieved', data: (data ?? []) as Job[], errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: [], errors: [msg] };
  }
}

/**
 * Fetches a single job with all related data (customer, technician, invoice).
 */
export async function getJobById(jobId: string): Promise<ApiResponse<Job | null>> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select(`
        *,
        customer:customer_id(id, name, email, phone),
        technician:technician_id(id, name, email, phone)
      `)
      .eq('id', jobId)
      .is('deleted_at', null)
      .single();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    return { success: true, message: 'Job retrieved', data: data as Job, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}

/**
 * Transitions a job to a new status.
 * Validates against the state machine in VALID_TRANSITIONS.
 */
export async function updateJobStatus(
  jobId: string,
  newStatus: JobStatus,
  actorId: string,
): Promise<ApiResponse<Job | null>> {
  try {
    /* Fetch current status */
    const { data: current, error: fetchErr } = await supabase
      .from('jobs')
      .select('status')
      .eq('id', jobId)
      .single();

    if (fetchErr || !current) {
      return { success: false, message: 'Job not found', data: null, errors: ['Job not found'] };
    }

    /* Validate transition */
    const allowed = VALID_TRANSITIONS[current.status] ?? [];
    if (!allowed.includes(newStatus)) {
      return {
        success: false,
        message: `Cannot transition from ${current.status} to ${newStatus}`,
        data: null,
        errors: ['INVALID_STATUS_TRANSITION'],
      };
    }

    /* Apply update */
    const { data, error } = await supabase
      .from('jobs')
      .update({ status: newStatus })
      .eq('id', jobId)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    logAudit(actorId, AuditActions.JOB_STATUS_CHANGED, 'jobs', jobId, {
      from: current.status,
      to: newStatus,
    });

    return { success: true, message: `Status updated to ${newStatus}`, data: data as Job, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}

/**
 * Assigns a technician to a pending job.
 * Automatically transitions status to 'assigned'.
 */
export async function assignTechnician(
  jobId: string,
  technicianId: string,
  actorId: string,
): Promise<ApiResponse<Job | null>> {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .update({ technician_id: technicianId, status: 'assigned' })
      .eq('id', jobId)
      .eq('status', 'pending')
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    logAudit(actorId, AuditActions.JOB_TECHNICIAN_ASSIGNED, 'jobs', jobId, {
      technician_id: technicianId,
    });

    return { success: true, message: 'Technician assigned', data: data as Job, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}
