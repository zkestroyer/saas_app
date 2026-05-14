/** Receiving Note Service — Device custody documentation for Path B (shop repair).
 * Per ADR-009 (repair branching logic) and SaaS Blueprint §4.2.
 *
 * The receiving note serves as legal proof of device custody transfer
 * from customer to technician, including condition assessment,
 * damage photos, and digital signature.
 */
import { supabase } from './supabase';
import { logAudit, AuditActions } from './audit-service';
import type { ReceivingNote, ApiResponse } from '../types';

/** Input shape for creating a receiving note. */
export interface CreateReceivingNoteInput {
  job_id: string;
  device_condition: string;
  damage_photos?: string[];
  customer_signature_url?: string | null;
  notes?: string;
}

/**
 * Creates a device receiving note for Path B workflow.
 * Links to the job and transitions status to 'repairing'.
 */
export async function createReceivingNote(
  input: CreateReceivingNoteInput,
  actorId: string,
): Promise<ApiResponse<ReceivingNote | null>> {
  try {
    const { data, error } = await supabase
      .from('receiving_notes')
      .insert({
        job_id: input.job_id,
        device_condition: input.device_condition,
        damage_photos: input.damage_photos ?? [],
        customer_signature_url: input.customer_signature_url ?? null,
        notes: input.notes ?? '',
      })
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    logAudit(actorId, AuditActions.RECEIVING_NOTE_CREATED, 'receiving_notes', data.id, {
      job_id: input.job_id,
      condition: input.device_condition.slice(0, 100),
    });

    return {
      success: true,
      message: 'Receiving note created',
      data: data as ReceivingNote,
      errors: [],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}

/**
 * Fetches the receiving note for a specific job (if one exists).
 * Returns null if no receiving note exists (Path A jobs).
 */
export async function getReceivingNote(
  jobId: string,
): Promise<ApiResponse<ReceivingNote | null>> {
  try {
    const { data, error } = await supabase
      .from('receiving_notes')
      .select('*')
      .eq('job_id', jobId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    return {
      success: true,
      message: data ? 'Receiving note found' : 'No receiving note for this job',
      data: data as ReceivingNote | null,
      errors: [],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}
