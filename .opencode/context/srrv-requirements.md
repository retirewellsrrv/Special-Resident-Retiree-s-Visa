# SRRV Service Platform — Requirements Reference

> Source: SRRV Service Platform System Design Document.
> This file is the checklist source of truth for the `srrv-compliance-checker` agent.
> Do not treat anything outside this file as a requirement.

## 1. Tech Stack (must match)
- Frontend: Next.js, Tailwind CSS, shadcn/ui
- Backend: Next.js API routes
- Auth: Supabase Auth
- Database: PostgreSQL (Supabase)
- File storage: Supabase Storage
- Payments: Xendit Hosted Checkout
- Deployment: Vercel

Flag any deviation (e.g. a different payment gateway, ORM, or auth provider) as a **tech-stack drift** finding, not necessarily a bug — note it and ask whether it was an intentional change.

## 2. User Roles
- Applicant / Client
- Admin Staff (can review applications/documents, create admin users)

Check that role-based access control exists and that admin-only routes/actions are actually gated server-side, not just hidden in the UI.

## 3. Functional Requirements Checklist

### 3.1 Authentication Module
- [ ] Register accounts
- [ ] Secure login/logout
- [ ] Password reset flow
- [ ] Role-based page restriction
- [ ] Secure session handling (no client-only auth checks on protected pages)

### 3.2 Applicant Dashboard
- [ ] Applicant info displayed
- [ ] Purchased services displayed
- [ ] Application progress displayed
- [ ] Uploaded documents displayed
- [ ] Payment history displayed

### 3.3 Application Form Module
- [ ] SRRV form completion flow
- [ ] Applicant info persisted
- [ ] Required-field validation
- [ ] Draft saving for incomplete forms

### 3.4 Document Upload Module
- [ ] Upload supports PDF, JPG, PNG (and rejects other types)
- [ ] Files stored securely (Supabase Storage, not public buckets unless intended)
- [ ] Document preview/download works
- [ ] Admin can reject / request re-upload

### 3.5 Application Tracking Module
- [ ] Progress/status displayed to applicant
- [ ] Admin can update status
- [ ] Applicant notified on status change
- [ ] Status values match: Submitted, Under Review, Waiting for Documents, Payment Pending, Processing, PRA Submission, Approved, Rejected

### 3.6 Payment Module
- [ ] International card payments supported
- [ ] Xendit Hosted Checkout integration
- [ ] Secure payment link generation
- [ ] Webhook verifies payment status (signature/secret checked, not just trusted payload)
- [ ] Payment logs/history stored
- [ ] Receipts displayed to applicant

### 3.7 Messaging / Inquiry Module
- [ ] Applicant can send inquiries (chatbot-based per spec)
- [ ] Admin replies escalate via email
- [ ] Inquiry history stored
- [ ] Architecture allows future chatbot integration (not hard blocker, but note if tightly coupled)

### 3.8 Admin Dashboard Module
- [ ] Platform statistics
- [ ] Application management
- [ ] Document review
- [ ] Status management
- [ ] Payment tracking
- [ ] Service/package management

### 3.9 Analytics Module (nice-to-have — do not fail the check if missing, just note as not-yet-implemented)
- [ ] Traffic analytics
- [ ] Revenue analytics
- [ ] Popular services
- [ ] Conversion rate tracking

## 4. Non-Functional Requirements

### 4.1 Security
- [ ] HTTPS enforced
- [ ] Protected/authenticated routes actually check auth server-side
- [ ] Passwords/tokens never stored or logged in plaintext
- [ ] Uploaded files validated (type/size) server-side, not just client-side
- [ ] Payment webhooks verified securely (signature check)
- [ ] Role-based access control enforced server-side

### 4.2 Performance
- [ ] No obvious blocking/unoptimized queries on hot paths
- [ ] Uploads/API responses reasonably optimized (pagination, streaming where relevant)

### 4.3 Scalability
- [ ] No hard architectural blockers to adding features or migrating off Next.js API routes later

### 4.4 Availability
- [ ] Payment retry/failure handling exists (not a silent dead-end)

### 4.5 Maintainability
- [ ] Modular architecture (feature folders / clear separation)
- [ ] Reusable UI components (not copy-pasted markup everywhere)
- [ ] Business logic separated from UI (no heavy logic embedded in JSX)

### 4.6 Usability
- [ ] Mobile responsive
- [ ] Clear navigation
- [ ] Clear application tracking UI

### 4.7 Compliance & Privacy
- [ ] Privacy Policy page exists
- [ ] Terms & Conditions page exists
- [ ] Refund Policy page exists
- [ ] Some form of audit logging for sensitive actions (status changes, document review, payments)

## 5. Expected Page Structure

**Public:** Home, About SRRV, Services, Pricing, FAQs, Contact Us, Login, Signup

**Applicant:** Dashboard, Application Form, Application Tracker, Document Upload, Payments, Messaging/Support, Profile Settings

**Admin:** Admin Dashboard, Applicant List, Application Review, Document Review, Payment Logs, Service Management, Analytics

Flag missing pages/routes and flag any pages that exist but aren't in this list (may be fine, just call it out as scope drift).

## 6. Reporting Format

When reporting compliance, group findings by section (3.1–3.9, 4.1–4.7, 5) and use:
- ✅ Implemented — matches the requirement
- ⚠️ Partial — exists but incomplete or has gaps (explain the gap)
- ❌ Missing — no evidence found in the codebase
- ℹ️ Drift — implemented differently than specified (not necessarily wrong, just different)

Always cite the file(s)/route(s) that back up each ✅ or ⚠️ finding. Never mark something ✅ without pointing to the code that proves it.