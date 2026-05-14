/** Invoice Store — Zustand store for active invoice editing session.
 * Per ADR-004 (Zustand for client state) and ADR-008 (dynamic invoice).
 *
 * Holds the in-flight invoice and its items during the editing session.
 * Syncs with Supabase via the invoice service for persistence.
 */
import { create } from 'zustand';
import type { Invoice, InvoiceItem, InvoiceStatus } from '../types';
import { InvoiceStatus as InvoiceStatusEnum } from '../types';

interface InvoiceState {
  /** The currently active invoice being edited. */
  activeInvoice: Invoice | null;
  /** Line items for the active invoice. */
  items: InvoiceItem[];
  /** Whether the invoice data is being loaded. */
  isLoading: boolean;

  /** Sets the active invoice and its items. */
  setActiveInvoice: (invoice: Invoice | null, items?: InvoiceItem[]) => void;
  /** Adds a line item to the local state. */
  addItem: (item: InvoiceItem) => void;
  /** Removes a line item from local state by ID. */
  removeItem: (itemId: string) => void;
  /** Updates the invoice totals in local state. */
  updateTotals: (totals: Pick<Invoice, 'subtotal' | 'tax_amount' | 'dispatch_charge' | 'total'>) => void;
  /** Marks the invoice as locked in local state. */
  lockLocal: () => void;
  /** Clears the active invoice session. */
  clear: () => void;
  /** Sets loading state. */
  setLoading: (loading: boolean) => void;
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  activeInvoice: null,
  items: [],
  isLoading: false,

  setActiveInvoice: (invoice, items = []) =>
    set({ activeInvoice: invoice, items, isLoading: false }),

  addItem: (item) =>
    set((state) => ({ items: [...state.items, item] })),

  removeItem: (itemId) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) })),

  updateTotals: (totals) =>
    set((state) => ({
      activeInvoice: state.activeInvoice
        ? { ...state.activeInvoice, ...totals }
        : null,
    })),

  lockLocal: () =>
    set((state) => ({
      activeInvoice: state.activeInvoice
        ? {
            ...state.activeInvoice,
            is_locked: true,
            status: InvoiceStatusEnum.PAID,
            locked_at: new Date().toISOString(),
          }
        : null,
    })),

  clear: () => set({ activeInvoice: null, items: [], isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}));
