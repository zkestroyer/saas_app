# Master Product Blueprint: Mobile Repair SaaS Platform

## 1. Project Overview & Vision
This document is the ultimate "Source of Truth" for building the new **Mobile Repair SaaS Platform**. It is strictly designed to be fed into the Antigravity AI system by junior engineers to ensure the generated codebase adheres exactly to our established **Master Engineering Guidelines**, **Universal Documentation Standards**, and **Playwright QA Compatibility**.

**Product Type:** Multi-Tenant SaaS Platform (Web Administration + Mobile Applications).
**Target Audience:** Mobile Repair Businesses (Tenants), their Technicians/Repairers (Staff), and End Customers.
**Core Proposition:** A comprehensive end-to-end workflow management system handling customer repair requests, dynamic technician dispatch, highly flexible dynamic invoicing, and secure device receiving/tracking.

---

## 2. Strict AI Prompting Guidelines (For Antigravity)
**CRITICAL:** When reading this document, the AI must apply the following constraints automatically:
1. **Premium Aesthetics Only:** The UI must feel high-end, modern, and trust-inspiring. Use curated color palettes, robust CSS variables, modern typography (e.g., Inter), smooth micro-animations, and proper layout spacing. **If the design looks like a basic MVP, it is considered a failure.**
2. **Master Engineering Standards:** The system must be API-first. Implement robust Authentication (JWT/OAuth), strict parameterized queries/ORM integrations, soft deletes (`deleted_at` everywhere), and standardized structured API JSON responses.
3. **Playwright QA Compatibility:** All core flows and UI components must be structured with unique, semantic `data-testid` attributes to support robust Playwright End-to-End automation out of the box.
4. **Documentation Standard:** As development progresses, generate Universal Documentation Vault HTML reports for Architecture, Schema, and Test Matrices based on the corporate master templates.

---

## 3. Core Roles & Permissions
1. **Super Admin:** Manages the SaaS infrastructure, handles tenant billing and global system metrics.
2. **Tenant (Repair Company Owner):** Manages their specific mobile repair business, oversees technicians, monitors inventory/parts, and tracks financial analytics.
3. **Technician (Repairer):** Field staff who receive job dispatches, visit customers, assess devices, and execute repairs.
4. **Customer:** End-user requesting repairs via Web Portal or Mobile App.

---

## 4. Feature Requirements & Core Workflows

### 4.1 Customer Booking Workflow
* **Intake Form:** A dynamic, user-friendly, and premium form where customers describe device issues. Fields include: Device Brand, Model, Issue Category (Screen, Battery, Software, etc.), detailed text description, and photo uploads.
* **Service Type:** Customer can request a technician visit to a specific location (home/office) or a store drop-off.
* **Live Tracking:** Real-time status visibility for the customer (e.g., *Job Assigned -> Technician En-route -> Diagnosing -> Repairing -> Completed*).

### 4.2 Technician Field & Shop Workflow
* **Job Dispatch:** Technician receives push notifications/alerts of a new assigned job with geolocation and device fault context.
* **On-Site Assessment:** Technician evaluates the device at the customer's location.
* **Branching Logic (Crucial Business Rule):**
  * **Path A (On-Spot Fix):** The issue is minor. The technician repairs the phone immediately at the customer's location.
  * **Path B (Shop Repair):** The issue requires advanced tools or parts. The technician generates a secure **"Device Receiving Note"** (digital PDF sent instantly to the customer via email/SMS), takes the device to the central shop, repairs it, and later coordinates redelivery.

### 4.3 Dynamic Invoicing & Quotations (Complex Logic)
* **Initial Quotation:** Generated and sent to the customer post-assessment for approval before major work begins.
* **Dynamic Cost Adjustment:** *Critical Requirement:* Mobile repairs often reveal hidden hardware issues once the device is opened. **The invoice MUST remain fully editable and dynamic up until the exact moment of final payment.**
* **Itemized Billing:** The invoice must clearly split: Parts Used, Labor/Time Cost, Tax, and Visit/Dispatch charges.
* **Final Payment & Locking:** Integration with payment gateways. Once the customer pays, the invoice is permanently locked and a final receipt is generated.

---

## 5. Technology Stack & Architecture
* **Frontend (Web/Admin Dashboard):** React/Next.js or Vue/Nuxt. Must utilize modern, premium component libraries with custom theming (e.g., Tailwind CSS paired with Radix UI or shadcn/ui).
* **Frontend (Customer/Technician App):** React Native or Flutter for seamless cross-platform native iOS/Android delivery.
* **Backend:** Node.js (Express/NestJS) or modern PHP (Laravel). Must adhere strictly to an API-first, stateless REST architecture.
* **Database:** PostgreSQL or MySQL. Every table must strictly enforce `created_at`, `updated_at`, and `deleted_at` tracking.
* **State Management:** Redis for fast caching, session management, and job queue processing (for email/SMS notifications).

---

## 6. Playwright QA & Testing Standards
* **Data Attributes:** Every button, input, and interactive element must feature semantic `data-testid` attributes (e.g., `data-testid="btn-approve-quotation"`, `data-testid="input-device-model"`).
* **E2E Testing Matrix:** The junior developer/AI must write Playwright E2E tests covering:
  1. The complete end-to-end Customer Booking flow.
  2. Technician branching logic (verifying both the On-spot fix and the PDF Receiving Note generation paths).
  3. The dynamic invoice adjustment cycle (modifying items, recalculating totals, and finalizing payment).

---

## 7. Deliverables & Documentation Vault Integration
Upon completion of the core modules, the AI and Junior Developer must output the following documents ready for the Google Drive Documentation Vault:
1. `01_Functional_Specification.html`
2. `02_System_Architecture.html`
3. `03_Database_Schema.html`
4. `04_Playwright_QA_Matrix.html`
