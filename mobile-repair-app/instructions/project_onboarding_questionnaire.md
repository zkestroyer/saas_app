# Next App World - Project Onboarding Questionnaire & Tech Gateway

> **CRITICAL RULE:** Development (even database design) will NOT begin until Part A is 100% completed by the Business/Sales Team and Part B is completed by the Tech Team (Maani & Antigravity).

---

## PART A: Business & Sales Questionnaire
*(To be filled by the Sales Team in consultation with the Client)*

### 1. General Overview
- **Project Name:** 
- **Client Name / Company:** 
- **Core Objective:** *(In 2-3 sentences, what is the main problem this app solves?)*

### 2. Target Audience & Platforms
- **Who will use this?** *(e.g., General Public, Internal Staff, B2B Vendors)*
- **Which platforms are required?**
  - [ ] Web Application (Desktop & Mobile Browser)
  - [ ] iOS App (Apple App Store)
  - [ ] Android App (Google Play Store)

### 3. User Roles & Features
- **List all User Roles:** *(e.g., Super Admin, Delivery Boy, Customer, Manager)*
- **What are the top 3 absolute "Must-Have" features?** 
  1. 
  2. 
  3. 

### 4. Design & Brand Assets
- **Do we have a Brand Book?** *(Logo, exact Color Codes, Fonts)* [ ] Yes [ ] No
- **Competitor References:** *(Provide 2 links to apps/websites the client likes)*

### 5. Third-Party Integrations & Accounts
*Does the system need to connect to outside services? If yes, the client must provide accounts/keys before development.*
- [ ] Payment Gateway (Stripe, PayPal, Local Banks)
- [ ] SMS OTP (Twilio, local provider)
- [ ] Maps/Location (Google Maps API)
- [ ] Push Notifications (Firebase)
- [ ] Apple Developer / Google Play Console Accounts (For Mobile)

### 6. Timeline & Deliverables
- **Expected Launch Date:** 
- **Agile Agreement:** *(Has the client been informed that progress will be shown bi-weekly on a demo server?)* [ ] Yes [ ] No

---

## PART B: Technical Architecture Checklist
*(To be filled by Solution Architect before writing the first line of code)*

### 1. Technology Stack Selection
- **Frontend / Mobile:** *(e.g., Next.js, Flutter)*
- **Backend:** *(e.g., Node.js Express, PHP PDO)*
- **Database:** *(e.g., PostgreSQL, MySQL, MongoDB)*
- **Admin Dashboard UI:** *(e.g., Tabler.io)*

### 2. Infrastructure Setup
- **Demo Server Provisioned:** [ ] Yes
- **Live Server Provisioned:** [ ] Yes
- **Domains/Subdomains configured via Cloudflare/Nginx:** [ ] Yes

### 3. Architecture & Security Patterns
- **API Standard:** *(e.g., RESTful JSON)*
- **Authentication:** *(e.g., JWT in HttpOnly cookies, OAuth)*
- **State Management (Mobile):** *(e.g., BLoC, Provider)*
- **E2E Testing Pipeline:** *(Playwright setup complete)*

---
**Sign-off:**
Once Part A and Part B are checked off, the "Black Box" is opened, and Antigravity begins coding.
