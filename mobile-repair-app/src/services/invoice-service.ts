/** Invoice Service — Dynamic invoicing with payment lock.
 * Per ADR-008 (Dynamic Invoice + Payment Lock) and SaaS Blueprint §4.3.
 *
 * CRITICAL BUSINESS RULE: Invoice remains fully editable until payment.
 * Once locked (is_locked=true), NO further mutations are permitted.
 */
import { supabase } from './supabase';
import { logAudit, AuditActions } from './audit-service';
import type { Invoice, InvoiceItem, InvoiceItemType, ApiResponse } from '../types';

/** Tax rate applied to subtotal (parts + labor). */
const TAX_RATE = 0.08;

/** Input shape for a new line item. */
export interface NewLineItem {
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unit_price: number;
}

/**
 * Creates a draft invoice for a job.
 * Called after technician assessment (Path A or Path B).
 */
export async function createInvoice(
  jobId: string,
  actorId: string,
): Promise<ApiResponse<Invoice | null>> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .insert({
        job_id: jobId,
        status: 'draft',
        subtotal: 0,
        tax_amount: 0,
        dispatch_charge: 0,
        total: 0,
        is_locked: false,
      })
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    logAudit(actorId, AuditActions.INVOICE_CREATED, 'invoices', data.id, { job_id: jobId });

    return { success: true, message: 'Invoice created', data: data as Invoice, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}

/**
 * Fetches an invoice with all its active line items.
 */
export async function getInvoice(invoiceId: string): Promise<ApiResponse<Invoice | null>> {
  try {
    const { data: invoice, error: invErr } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', invoiceId)
      .is('deleted_at', null)
      .single();

    if (invErr || !invoice) {
      return { success: false, message: 'Invoice not found', data: null, errors: [invErr?.message ?? 'Not found'] };
    }

    const { data: items, error: itemsErr } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    if (itemsErr) {
      return { success: false, message: itemsErr.message, data: null, errors: [itemsErr.message] };
    }

    const result: Invoice = { ...(invoice as Invoice), items: (items ?? []) as InvoiceItem[] };
    return { success: true, message: 'Invoice retrieved', data: result, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}

/**
 * Fetches the invoice for a specific job.
 */
export async function getInvoiceByJobId(jobId: string): Promise<ApiResponse<Invoice | null>> {
  try {
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('job_id', jobId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    if (!invoice) {
      return { success: true, message: 'No invoice found', data: null, errors: [] };
    }

    /* Fetch items */
    const { data: items } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoice.id)
      .is('deleted_at', null)
      .order('created_at', { ascending: true });

    const result: Invoice = { ...(invoice as Invoice), items: (items ?? []) as InvoiceItem[] };
    return { success: true, message: 'Invoice retrieved', data: result, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}

/**
 * Retrieves all invoices for a customer (via job relationship).
 */
export async function getCustomerInvoices(customerId: string): Promise<ApiResponse<Invoice[]>> {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, job:job_id(device_brand, device_model, customer_id)')
      .is('deleted_at', null)
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, message: error.message, data: [], errors: [error.message] };
    }

    /* Filter by customer ownership via the job relationship */
    const customerInvoices = (data ?? []).filter(
      (inv: any) => inv.job?.customer_id === customerId,
    );

    return {
      success: true,
      message: 'Invoices retrieved',
      data: customerInvoices as Invoice[],
      errors: [],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: [], errors: [msg] };
  }
}

/**
 * Adds a line item to an unlocked invoice.
 * REJECTS if is_locked === true.
 * Triggers recalculateTotals after insertion.
 */
export async function addLineItem(
  invoiceId: string,
  item: NewLineItem,
  actorId: string,
): Promise<ApiResponse<InvoiceItem | null>> {
  try {
    /* Check lock status FIRST — critical business rule */
    const { data: invoice } = await supabase
      .from('invoices')
      .select('is_locked')
      .eq('id', invoiceId)
      .single();

    if (invoice?.is_locked) {
      return {
        success: false,
        message: 'Invoice is locked after payment — cannot add items',
        data: null,
        errors: ['INVOICE_LOCKED'],
      };
    }

    const amount = item.quantity * item.unit_price;

    const { data, error } = await supabase
      .from('invoice_items')
      .insert({
        invoice_id: invoiceId,
        type: item.type,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        amount,
      })
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    logAudit(actorId, AuditActions.INVOICE_ITEM_ADDED, 'invoice_items', data.id, {
      invoice_id: invoiceId,
      item_type: item.type,
      amount,
    });

    /* Recalculate totals */
    await recalculateTotals(invoiceId);

    return { success: true, message: 'Item added', data: data as InvoiceItem, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}

/**
 * Soft-deletes a line item from an unlocked invoice.
 * REJECTS if is_locked === true.
 */
export async function removeLineItem(
  itemId: string,
  invoiceId: string,
  actorId: string,
): Promise<ApiResponse<null>> {
  try {
    /* Check lock status */
    const { data: invoice } = await supabase
      .from('invoices')
      .select('is_locked')
      .eq('id', invoiceId)
      .single();

    if (invoice?.is_locked) {
      return {
        success: false,
        message: 'Invoice is locked — cannot remove items',
        data: null,
        errors: ['INVOICE_LOCKED'],
      };
    }

    const { error } = await supabase
      .from('invoice_items')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', itemId);

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    logAudit(actorId, AuditActions.INVOICE_ITEM_REMOVED, 'invoice_items', itemId, {
      invoice_id: invoiceId,
    });

    await recalculateTotals(invoiceId);

    return { success: true, message: 'Item removed', data: null, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}

/**
 * Recalculates invoice totals from active line items.
 * Called internally after every item add/remove.
 */
export async function recalculateTotals(invoiceId: string): Promise<ApiResponse<Invoice | null>> {
  try {
    const { data: items, error: itemsErr } = await supabase
      .from('invoice_items')
      .select('*')
      .eq('invoice_id', invoiceId)
      .is('deleted_at', null);

    if (itemsErr) {
      return { success: false, message: itemsErr.message, data: null, errors: [itemsErr.message] };
    }

    const allItems = (items ?? []) as InvoiceItem[];

    /* Subtotal = parts + labor amounts */
    const subtotal = allItems
      .filter((i) => i.type === 'part' || i.type === 'labor')
      .reduce((sum, i) => sum + Number(i.amount), 0);

    /* Tax = subtotal × rate */
    const taxAmount = Math.round(subtotal * TAX_RATE * 100) / 100;

    /* Dispatch = sum of dispatch items */
    const dispatchCharge = allItems
      .filter((i) => i.type === 'dispatch')
      .reduce((sum, i) => sum + Number(i.amount), 0);

    const total = Math.round((subtotal + taxAmount + dispatchCharge) * 100) / 100;

    const { data, error } = await supabase
      .from('invoices')
      .update({ subtotal, tax_amount: taxAmount, dispatch_charge: dispatchCharge, total })
      .eq('id', invoiceId)
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    return { success: true, message: 'Totals recalculated', data: data as Invoice, errors: [] };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}

/**
 * Permanently locks an invoice after payment. IRREVERSIBLE.
 * Sets is_locked=true, status='paid', locked_at=NOW().
 * All subsequent mutations will be rejected.
 */
export async function lockInvoice(
  invoiceId: string,
  paymentMethod: string,
  actorId: string,
): Promise<ApiResponse<Invoice | null>> {
  try {
    /* Atomically lock — only if not already locked */
    const { data, error } = await supabase
      .from('invoices')
      .update({
        is_locked: true,
        status: 'paid',
        locked_at: new Date().toISOString(),
        payment_method: paymentMethod,
      })
      .eq('id', invoiceId)
      .eq('is_locked', false) /* Atomic guard — prevents race conditions */
      .select()
      .single();

    if (error) {
      return { success: false, message: error.message, data: null, errors: [error.message] };
    }

    if (!data) {
      return {
        success: false,
        message: 'Invoice is already locked',
        data: null,
        errors: ['INVOICE_LOCKED'],
      };
    }

    logAudit(actorId, AuditActions.INVOICE_LOCKED, 'invoices', invoiceId, {
      total: data.total,
      payment_method: paymentMethod,
    });

    return {
      success: true,
      message: 'Invoice locked and payment recorded',
      data: data as Invoice,
      errors: [],
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unexpected error';
    return { success: false, message: msg, data: null, errors: [msg] };
  }
}
