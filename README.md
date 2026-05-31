# Special Resident Retiree's Visa (SRRV) Service Platform

A web-based platform designed to help foreign retirees apply for and manage their **Special Resident Retiree's Visa (SRRV)** services online.

The platform streamlines the entire application process by providing a centralized portal where applicants can create accounts, submit applications, upload required documents, track application progress, receive updates, and complete online payments.

An administrative portal is also provided for staff to review applications, manage applicant records, monitor payments, and update application statuses.

## Features

### Public Features

* SRRV Information Pages
* Service & Package Listings
* Pricing Information
* Frequently Asked Questions (FAQ)
* Contact Page
* User Registration & Login

### Applicant Features

* Secure Account Registration & Authentication
* SRRV Application Submission
* Document Upload & Management
* Application Status Tracking
* Payment Processing
* Profile Management
* Support & Inquiry System
* Notification Updates

### Admin Features

* Applicant Management
* Document Review & Verification
* Application Approval Workflow
* Status Management
* Payment Monitoring
* Dashboard Analytics
* Service & Package Management

## Technology Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* Shadcn/UI

### Backend

* Next.js Server Actions
* Next.js API Routes

### Database & Authentication

* Supabase PostgreSQL
* Supabase Auth

### File Storage

* Supabase Storage

### Payments

* Xendit Hosted Checkout

### Deployment

* Vercel

## Repository

```bash
git clone https://github.com/XjorLml/Special-Resident-Retiree-s-Visa.git

cd Special-Resident-Retiree-s-Visa
```

## Installation

### Prerequisites

* Node.js 20+
* PNPM
* Supabase Project

### Install Dependencies

```bash
pnpm install
```

### Configure Environment Variables

Copy the example file:

```bash
cp env.copy.example .env.local
```

Configure your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Development

Run the development server:

```bash
pnpm dev
```

Open:

```text
http://localhost:3000
```

## Production Build

Build the application:

```bash
pnpm build
```

Start the production server:

```bash
pnpm start
```

## Linting

```bash
pnpm lint
```

## Application Workflow

1. Applicant creates an account.
2. Applicant verifies email address.
3. Applicant purchases an SRRV service package.
4. Applicant completes the application form.
5. Applicant uploads required documents.
6. Admin reviews submitted information.
7. Application status is updated throughout the process.
8. Applicant receives notifications and updates.
9. Application proceeds until approval or completion.

## Future Enhancements

* Real-time notifications
* Chatbot integration
* Revenue analytics
* Application conversion tracking
* Multi-language support
* Advanced reporting dashboard

## License

This project is intended for SRRV service management and application processing.

Please consult the project owner before redistribution or commercial use.
