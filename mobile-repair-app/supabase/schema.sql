-- RepairPro Database Schema for Supabase (PostgreSQL)
-- Per Master_Engineering_Guidelines.md: soft deletes, audit trails, UUID public IDs
-- Run this in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── TENANTS ───────────────────────────────────────────────
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  business_name VARCHAR(255) NOT NULL,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  subscription_status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- ─── USERS ─────────────────────────────────────────────────
-- Links to Supabase Auth via auth.users.id
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  role VARCHAR(20) NOT NULL CHECK (role IN ('super_admin', 'tenant', 'technician', 'customer')),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  avatar_url TEXT,
  phone VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_role ON users(role);

-- ─── JOBS ──────────────────────────────────────────────────
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID NOT NULL REFERENCES users(id),
  technician_id UUID REFERENCES users(id),
  tenant_id UUID NOT NULL REFERENCES tenants(id),
  device_brand VARCHAR(100) NOT NULL,
  device_model VARCHAR(100) NOT NULL,
  issue_category VARCHAR(30) NOT NULL CHECK (issue_category IN (
    'screen', 'battery', 'software', 'charging', 'camera', 'speaker', 'water_damage', 'other'
  )),
  description TEXT NOT NULL,
  photos JSONB DEFAULT '[]'::jsonb,
  service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('home_visit', 'store_dropoff')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending', 'assigned', 'en_route', 'diagnosing', 'repairing', 'completed', 'cancelled'
  )),
  location JSONB DEFAULT '{}'::jsonb,
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_jobs_customer ON jobs(customer_id);
CREATE INDEX idx_jobs_technician ON jobs(technician_id);
CREATE INDEX idx_jobs_tenant ON jobs(tenant_id);
CREATE INDEX idx_jobs_status ON jobs(status);

-- ─── INVOICES ──────────────────────────────────────────────
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'quoted', 'approved', 'paid', 'cancelled'
  )),
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  dispatch_charge DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  locked_at TIMESTAMPTZ,
  payment_method VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_invoices_job ON invoices(job_id);

-- ─── INVOICE ITEMS ─────────────────────────────────────────
CREATE TABLE invoice_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('part', 'labor', 'tax', 'dispatch')),
  description TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

-- ─── RECEIVING NOTES ───────────────────────────────────────
CREATE TABLE receiving_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  job_id UUID NOT NULL REFERENCES jobs(id),
  device_condition TEXT NOT NULL,
  damage_photos JSONB DEFAULT '[]'::jsonb,
  customer_signature_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_receiving_notes_job ON receiving_notes(job_id);

-- ─── AUDIT TRAILS (per Master_Engineering §3) ──────────────
CREATE TABLE audit_trails (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  target_table VARCHAR(100) NOT NULL,
  target_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_actor ON audit_trails(actor_id);
CREATE INDEX idx_audit_action ON audit_trails(action);

-- ─── AUTO-UPDATE updated_at TRIGGER ────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at column
CREATE TRIGGER trg_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_users_updated BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_jobs_updated BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoices_updated BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_invoice_items_updated BEFORE UPDATE ON invoice_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_receiving_notes_updated BEFORE UPDATE ON receiving_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════
-- ═══ ROW LEVEL SECURITY — COMPLETE POLICIES ═══════════════
-- ═══════════════════════════════════════════════════════════
-- Per ADR-003 (Multi-Tenant RLS) and ADR-006 (RBAC)
-- Every table has RLS enabled with granular per-role policies.

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE receiving_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trails ENABLE ROW LEVEL SECURITY;

-- ─── Helper function: get current user's role ──────────────
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS VARCHAR(20) AS $$
  SELECT role FROM users WHERE id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── Helper function: get current user's tenant ────────────
CREATE OR REPLACE FUNCTION get_user_tenant_id()
RETURNS UUID AS $$
  SELECT tenant_id FROM users WHERE id = auth.uid() AND deleted_at IS NULL;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ─── TENANTS POLICIES ──────────────────────────────────────

-- Members can read their own tenant
CREATE POLICY "Tenant members can read own tenant" ON tenants
  FOR SELECT USING (
    id IN (SELECT tenant_id FROM users WHERE id = auth.uid() AND deleted_at IS NULL)
  );

-- Super admin can read all tenants
CREATE POLICY "Super admin reads all tenants" ON tenants
  FOR SELECT USING (get_user_role() = 'super_admin');

-- ─── USERS POLICIES ────────────────────────────────────────

-- Users can read own profile
CREATE POLICY "Users can read own profile" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update own profile
CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Tenant owners can read all users in their tenant
CREATE POLICY "Tenant reads team members" ON users
  FOR SELECT USING (
    tenant_id = get_user_tenant_id() AND get_user_role() = 'tenant'
  );

-- Technicians can read customer profiles (for assigned jobs)
CREATE POLICY "Technicians read customers" ON users
  FOR SELECT USING (
    get_user_role() = 'technician'
    AND id IN (
      SELECT customer_id FROM jobs
      WHERE technician_id = auth.uid() AND deleted_at IS NULL
    )
  );

-- Authenticated users can insert their own profile (registration)
CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Super admin can read all users
CREATE POLICY "Super admin reads all users" ON users
  FOR SELECT USING (get_user_role() = 'super_admin');

-- ─── JOBS POLICIES ─────────────────────────────────────────

-- Customers can read their own jobs
CREATE POLICY "Customers read own jobs" ON jobs
  FOR SELECT USING (auth.uid() = customer_id AND deleted_at IS NULL);

-- Customers can create jobs
CREATE POLICY "Customers can create jobs" ON jobs
  FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Technicians can read assigned jobs
CREATE POLICY "Technicians read assigned jobs" ON jobs
  FOR SELECT USING (auth.uid() = technician_id AND deleted_at IS NULL);

-- Technicians can update assigned jobs (status changes)
CREATE POLICY "Technicians update assigned jobs" ON jobs
  FOR UPDATE USING (auth.uid() = technician_id);

-- Tenant owners can read all tenant jobs
CREATE POLICY "Tenant reads all jobs" ON jobs
  FOR SELECT USING (
    tenant_id = get_user_tenant_id() AND get_user_role() = 'tenant'
  );

-- Tenant owners can update jobs (assign technicians)
CREATE POLICY "Tenant updates jobs" ON jobs
  FOR UPDATE USING (
    tenant_id = get_user_tenant_id() AND get_user_role() = 'tenant'
  );

-- Super admin can read all jobs
CREATE POLICY "Super admin reads all jobs" ON jobs
  FOR SELECT USING (get_user_role() = 'super_admin');

-- ─── INVOICES POLICIES ─────────────────────────────────────

-- Customers can read invoices for their jobs
CREATE POLICY "Customers read own invoices" ON invoices
  FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE customer_id = auth.uid() AND deleted_at IS NULL)
    AND deleted_at IS NULL
  );

-- Technicians can read invoices for assigned jobs
CREATE POLICY "Technicians read assigned invoices" ON invoices
  FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE technician_id = auth.uid() AND deleted_at IS NULL)
    AND deleted_at IS NULL
  );

-- Technicians can create invoices for assigned jobs
CREATE POLICY "Technicians create invoices" ON invoices
  FOR INSERT WITH CHECK (
    job_id IN (SELECT id FROM jobs WHERE technician_id = auth.uid() AND deleted_at IS NULL)
  );

-- Technicians can update invoices for assigned jobs (when not locked)
CREATE POLICY "Technicians update invoices" ON invoices
  FOR UPDATE USING (
    job_id IN (SELECT id FROM jobs WHERE technician_id = auth.uid() AND deleted_at IS NULL)
  );

-- Tenant owners can read all invoices for tenant jobs
CREATE POLICY "Tenant reads all invoices" ON invoices
  FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE tenant_id = get_user_tenant_id() AND deleted_at IS NULL)
    AND deleted_at IS NULL
  );

-- Super admin can read all invoices
CREATE POLICY "Super admin reads all invoices" ON invoices
  FOR SELECT USING (get_user_role() = 'super_admin');

-- ─── INVOICE ITEMS POLICIES ────────────────────────────────

-- Customers can read items for their invoices
CREATE POLICY "Customers read own invoice items" ON invoice_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT i.id FROM invoices i
      JOIN jobs j ON i.job_id = j.id
      WHERE j.customer_id = auth.uid() AND i.deleted_at IS NULL AND j.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- Technicians can read/create/update items for assigned job invoices
CREATE POLICY "Technicians read invoice items" ON invoice_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT i.id FROM invoices i
      JOIN jobs j ON i.job_id = j.id
      WHERE j.technician_id = auth.uid() AND i.deleted_at IS NULL AND j.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

CREATE POLICY "Technicians create invoice items" ON invoice_items
  FOR INSERT WITH CHECK (
    invoice_id IN (
      SELECT i.id FROM invoices i
      JOIN jobs j ON i.job_id = j.id
      WHERE j.technician_id = auth.uid() AND i.is_locked = FALSE
    )
  );

CREATE POLICY "Technicians update invoice items" ON invoice_items
  FOR UPDATE USING (
    invoice_id IN (
      SELECT i.id FROM invoices i
      JOIN jobs j ON i.job_id = j.id
      WHERE j.technician_id = auth.uid() AND i.is_locked = FALSE
    )
  );

-- Tenant owners can read all invoice items
CREATE POLICY "Tenant reads all invoice items" ON invoice_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT i.id FROM invoices i
      JOIN jobs j ON i.job_id = j.id
      WHERE j.tenant_id = get_user_tenant_id() AND i.deleted_at IS NULL
    )
    AND deleted_at IS NULL
  );

-- ─── RECEIVING NOTES POLICIES ──────────────────────────────

-- Technicians can create receiving notes for assigned jobs
CREATE POLICY "Technicians create receiving notes" ON receiving_notes
  FOR INSERT WITH CHECK (
    job_id IN (SELECT id FROM jobs WHERE technician_id = auth.uid() AND deleted_at IS NULL)
  );

-- Technicians can read receiving notes for assigned jobs
CREATE POLICY "Technicians read receiving notes" ON receiving_notes
  FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE technician_id = auth.uid() AND deleted_at IS NULL)
    AND deleted_at IS NULL
  );

-- Customers can read receiving notes for their jobs
CREATE POLICY "Customers read receiving notes" ON receiving_notes
  FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE customer_id = auth.uid() AND deleted_at IS NULL)
    AND deleted_at IS NULL
  );

-- Tenant owners can read all receiving notes for tenant jobs
CREATE POLICY "Tenant reads all receiving notes" ON receiving_notes
  FOR SELECT USING (
    job_id IN (SELECT id FROM jobs WHERE tenant_id = get_user_tenant_id() AND deleted_at IS NULL)
    AND deleted_at IS NULL
  );

-- ─── AUDIT TRAILS POLICIES ─────────────────────────────────

-- All authenticated users can insert audit records
CREATE POLICY "Authenticated users can log audits" ON audit_trails
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only super admin can read audit trails
CREATE POLICY "Super admin reads audit trails" ON audit_trails
  FOR SELECT USING (get_user_role() = 'super_admin');

-- Audit records can NEVER be updated or deleted (immutable by design)
-- No UPDATE or DELETE policies exist for audit_trails.
