/** Audit Trail Service — Immutable logging for all significant system actions.
 * Per Master Engineering Guidelines §3 and ADR-011.
 *
 * This service is fire-and-forget: audit logging never blocks
 * the critical path and silently absorbs failures.
 */
import { supabase } from './supabase';

/** Standardised action identifiers for audit events. */
export const AuditActions = {
  USER_SIGNED_UP: 'user.signed_up',
  USER_SIGNED_IN: 'user.signed_in',
  USER_SIGNED_OUT: 'user.signed_out',
  USER_PROFILE_UPDATED: 'user.profile_updated',
  JOB_CREATED: 'job.created',
  JOB_STATUS_CHANGED: 'job.status_changed',
  JOB_TECHNICIAN_ASSIGNED: 'job.technician_assigned',
  INVOICE_CREATED: 'invoice.created',
  INVOICE_ITEM_ADDED: 'invoice.item_added',
  INVOICE_ITEM_REMOVED: 'invoice.item_removed',
  INVOICE_LOCKED: 'invoice.locked',
  RECEIVING_NOTE_CREATED: 'receiving_note.created',
} as const;

export type AuditAction = (typeof AuditActions)[keyof typeof AuditActions];

/**
 * Logs an immutable audit record to the `audit_trails` table.
 *
 * @param actorId   - UUID of the user performing the action
 * @param action    - Standardised action identifier (e.g. `job.created`)
 * @param targetTable - Database table affected (e.g. `jobs`)
 * @param targetId  - UUID of the specific record (nullable)
 * @param metadata  - Additional context (JSON-serialisable)
 */
export async function logAudit(
  actorId: string,
  action: AuditAction | string,
  targetTable: string,
  targetId: string | null = null,
  metadata: Record<string, unknown> = {},
): Promise<void> {
  try {
    await supabase.from('audit_trails').insert({
      actor_id: actorId,
      action,
      target_table: targetTable,
      target_id: targetId,
      metadata,
    });
  } catch {
    /* Fire-and-forget — audit failure must never break the primary flow.
     * In production, this would forward to an external error tracker (Sentry). */
    console.warn('[AuditService] Failed to log audit event:', action);
  }
}
