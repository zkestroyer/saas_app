/** Global TypeScript type definitions for RepairPro.
 * Per Code_standards.md: PascalCase types, no implicit any.
 */

/* ── Enums ── */
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  TENANT = 'tenant',
  TECHNICIAN = 'technician',
  CUSTOMER = 'customer',
}

export enum JobStatus {
  PENDING = 'pending',
  ASSIGNED = 'assigned',
  EN_ROUTE = 'en_route',
  DIAGNOSING = 'diagnosing',
  REPAIRING = 'repairing',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum ServiceType {
  HOME_VISIT = 'home_visit',
  STORE_DROPOFF = 'store_dropoff',
}

export enum InvoiceStatus {
  DRAFT = 'draft',
  QUOTED = 'quoted',
  APPROVED = 'approved',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum InvoiceItemType {
  PART = 'part',
  LABOR = 'labor',
  TAX = 'tax',
  DISPATCH = 'dispatch',
}

export enum IssueCategory {
  SCREEN = 'screen',
  BATTERY = 'battery',
  SOFTWARE = 'software',
  CHARGING = 'charging',
  CAMERA = 'camera',
  SPEAKER = 'speaker',
  WATER_DAMAGE = 'water_damage',
  OTHER = 'other',
}

/* ── Database Models ── */
export interface Tenant {
  id: string;
  business_name: string;
  plan: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface User {
  id: string;
  tenant_id: string | null;
  role: UserRole;
  name: string;
  email: string;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface Job {
  id: string;
  customer_id: string;
  technician_id: string | null;
  tenant_id: string;
  device_brand: string;
  device_model: string;
  issue_category: IssueCategory;
  description: string;
  photos: string[];
  service_type: ServiceType;
  status: JobStatus;
  location: {
    address: string;
    latitude?: number;
    longitude?: number;
  };
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  /* Relations (optional, populated by joins) */
  customer?: User;
  technician?: User;
  invoice?: Invoice;
}

export interface Invoice {
  id: string;
  job_id: string;
  status: InvoiceStatus;
  subtotal: number;
  tax_amount: number;
  dispatch_charge: number;
  total: number;
  is_locked: boolean;
  locked_at: string | null;
  payment_method: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  /* Relations */
  items?: InvoiceItem[];
}

export interface InvoiceItem {
  id: string;
  invoice_id: string;
  type: InvoiceItemType;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface ReceivingNote {
  id: string;
  job_id: string;
  device_condition: string;
  damage_photos: string[];
  customer_signature_url: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

/* ── API Response Envelope (per Master_Engineering_Guidelines.md) ── */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}
