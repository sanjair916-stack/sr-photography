# SR PHOTOGRAPHY – Premium Quotation Management Website

A comprehensive, production-grade quotation management and booking operations portal tailored for **SR PHOTOGRAPHY**. The platform enables studio admins to create instant, professional photography quotations, perform real-time financial calculations in Indian Rupees (₹), preview and generate pixel-perfect A4 portrait PDFs in a Modern Minimalist White & Gold aesthetic, manage bookings and payment states, share breakdowns directly via WhatsApp, and persist all records securely to a dedicated database.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Confirmed Choices & Default Configurations:**
> - **PDF Quotation Aesthetic**: Modern Minimalist White with subtle gold accents (`#C5A059`, `#D4AF37`) and clean grid structure, as selected during initial clarification.
> - **Admin Authentication**: Pre-configured master admin password with persistent session storage, session lock, and self-service password update in Studio Settings. (Default credentials: username `admin`, password `srphotography2026` or customizable).
> - **Studio Profile & Contact Data**: Comprehensive customizable Studio Settings panel where the admin can upload their official SR PHOTOGRAPHY logo, configure phone number, WhatsApp contact, studio address, email, UPI ID/Bank account for advance payments, and legal terms & conditions.
> - **Data Persistence**: Express server with robust persistent JSON file store (`data/quotations.json` & `data/settings.json`) backed by automatic client-side sync to guarantee that data never gets lost on page refresh or browser restart.

---

## 1. Overview & Core Concept

- **What It Does**: Complete end-to-end quotation workflow: client intake -> multi-service selection & custom packages -> automatic subtotal, discount, advance, and remaining balance math -> instant A4 PDF rendering and downloading -> 1-click WhatsApp messaging -> quotation history with full CRUD, search, filter, and duplication.
- **Target Audience / Persona**: Studio Owner & Lead Photographer at SR PHOTOGRAPHY managing client consultations, wedding bookings, and financial tracking without manual paper estimates.
- **Key Value**: Replaces error-prone manual spreadsheets with an executive white-and-gold portal that issues accurate, branded PDF quotations in under 60 seconds and tracks payment status from quotation to completed shoot.

---

## 2. User Experience & Visual Design

### Key User Flows
1. **Admin Authentication**:
   - Secure login screen with White & Gold branding, password masking, and error notifications.
   - Guarded routes ensuring all dashboard, quotation, and history views remain strictly admin-only.
2. **Dashboard Overview**:
   - High-density KPI cards: Total Quotations, Confirmed Bookings, Total Quotation Value (₹), Advance Received (₹), and Pending Balance (₹).
   - Quick action bar: "Create New Quotation", "View History", "Studio Settings".
   - Recent Quotations list with quick status pills and direct PDF download/WhatsApp triggers.
3. **Quotation Creator**:
   - Two-column layout: Left column contains Customer Details (Name, Phone, WhatsApp, Email, Event Date, Location, Event Type) and Service Catalog (checkboxes with default prices + dynamic custom services).
   - Right column features sticky Financial Ledger: real-time Subtotal, Discount toggle (₹ or %), Final Total, Advance Paid input, and Remaining Balance with validation safeguards against negative values.
   - Bottom Action Bar: "Save Quotation", "Live A4 Preview", "Download PDF", "Share on WhatsApp".
4. **Interactive A4 Portrait Preview & PDF Generator**:
   - Exact 210mm x 297mm (A4) aspect ratio canvas.
   - Clean gold foil line accents, header with SR PHOTOGRAPHY logo and studio credentials, customer/event metadata block, itemized services ledger with unit rates, payment breakdown summary, legal terms, and dual signature zones (Client & Authorized Signatory).
   - Instant client-side PDF export matching the exact visual preview.
5. **Quotation History & Booking Management**:
   - Searchable table filtering by Customer Name, Phone Number, or Quotation Number (`SRP-YYYY-XXXX`).
   - Filters by Booking Status (`Quotation`, `Confirmed Booking`, `Completed`, `Cancelled`) and Payment Status (`Advance Pending`, `Partially Paid`, `Fully Paid`).
   - Row action menu: View/Preview, Download PDF, Send WhatsApp, Edit, Duplicate, and Delete (with confirmation modal).
6. **Studio Settings**:
   - Upload and preview SR PHOTOGRAPHY logo (stores data URL locally and on server).
   - Update contact information, studio address, UPI ID / bank details for advances, and standard terms of service.
   - Update admin login credentials.

### Visual Identity & Theme
- **Aesthetic Direction**: Modern Minimalist White & Gold luxury. Generous white space, architectural hairline borders, warm gold metallic accents, and high-contrast typography reflecting high-end photography craftsmanship.
- **Color Palette**:
  - Dominant Canvas (60%): Clean Pure White (`#FFFFFF`) with ultra-subtle off-white background fields (`#FAFAF8`).
  - Structural Surfaces (30%): Soft cream/warm-neutral cards (`#FFFFFF`), subtle hairline borders (`#EAE6DF` / `#DFD9CE`), and rich slate-charcoal text (`#1A1A1A` and `#4A4A4A`).
  - Accent Budget (10%): Warm Metallic Gold (`#C5A059`, `#B38E3E`, hover `#9E7A2E`) applied deliberately to primary action buttons, active tab indicators, table header borders, and the PDF branding rule.
- **Typography**:
  - Display & Headings: `Plus Jakarta Sans` or `Cinzel` / `Outfit` for brand elegance and refined structure.
  - Body & UI: `Plus Jakarta Sans` / `DM Sans` (14px–16px, 1.5 line height).
  - Numbers & Ledgers: Strict tabular figures (`tabular-nums font-mono`) for all Indian Rupee amounts and quotation IDs.

---

## 3. Key Product Decisions & Trade-Offs

- **Server-Side + Local Storage Dual Persistence**:
  - *Chosen Approach*: Full-stack Express API with a persistent JSON store (`data/quotations.json`, `data/settings.json`) paired with client-side state synchronization.
  - *Why*: Guarantees quotations remain safely stored across browser refreshes, server restarts, or separate device sessions without requiring external third-party cloud database subscriptions.
  - *Alternatives Considered*: Pure browser `localStorage` (risks data loss if cache cleared) vs. Cloud SQL / Firebase (unnecessary friction and external provisioning when a self-contained persistent store fulfills requirements cleanly).
- **Client-Side Vector/Canvas PDF Engine**:
  - *Chosen Approach*: Pure A4 DOM layout paired with `html2canvas` and `jspdf` for high-resolution A4 portrait PDF generation with zero server rendering lag.
  - *Why*: Ensures 100% visual fidelity between the "Preview" modal and the generated "Download PDF" file, incorporating the uploaded logo, gold styling, and exact fonts.
- **Pre-Loaded Photography Service Catalog with Dynamic Customization**:
  - *Chosen Approach*: Provide all 14 requested services pre-loaded with realistic standard market prices, while giving the admin immediate controls to add custom services, edit names, alter pricing, or delete line items on the fly.
  - *Why*: Eliminates repetitive typing for everyday packages (e.g. Wedding + Reception + Drone) while supporting bespoke client requests.

---

## 4. Technical Architecture & Data Strategy

### Architecture & Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SR PHOTOGRAPHY WEB PORTAL                       │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    Admin Authentication Guard                    │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│         ┌───────────────────────────┼────────────────────────┐         │
│         ▼                           ▼                        ▼         │
│  ┌──────────────┐          ┌─────────────────┐      ┌────────────────┐ │
│  │  Dashboard   │          │ Quotation Form  │      │ Quotation List │ │
│  │  - KPI Cards │          │ - Client Intake │      │ - Search/Filter│ │
│  │  - Analytics │          │ - Service Grid  │      │ - Actions:     │ │
│  │  - Status    │          │ - Auto Calc (₹) │      │   PDF/WhatsApp │ │
│  │    Overview  │          │ - Custom Items  │      │   Edit/Dup/Del │ │
│  └──────┬───────┘          └────────┬────────┘      └───────┬────────┘ │
│         │                           │                       │          │
│         │                  ┌────────▼────────┐              │          │
│         │                  │ A4 PDF Preview  │              │          │
│         │                  │ & jsPDF Engine  │              │          │
│         │                  └────────┬────────┘              │          │
│         │                           │                       │          │
│         └───────────────────────────┼───────────────────────┘          │
│                                     │                                  │
│                                     ▼                                  │
│                 ┌───────────────────────────────────────┐              │
│                 │      Quotation State & Store Sync     │              │
│                 └───────────────────┬───────────────────┘              │
│                                     │                                  │
└─────────────────────────────────────┼──────────────────────────────────┘
                                      ▼
                      ┌───────────────────────────────┐
                      │    Express API (port 3000)    │
                      │  /api/auth                    │
                      │  /api/quotations (CRUD)       │
                      │  /api/settings (Profile/Logo) │
                      └───────────────┬───────────────┘
                                      ▼
                      ┌───────────────────────────────┐
                      │  Persistent Storage (data/)   │
                      │  - data/quotations.json       │
                      │  - data/settings.json         │
                      └───────────────────────────────┘
```

### Data Models

```typescript
export interface PhotographyService {
  id: string;
  name: string;
  category?: string;
  price: number;
  selected: boolean;
  notes?: string;
}

export interface Quotation {
  id: string; // e.g. "SRP-2026-0001"
  createdAt: string;
  updatedAt: string;
  customer: {
    name: string;
    mobile: string;
    whatsapp: string;
    email: string;
    eventDate: string;
    eventLocation: string;
    eventType: string; // Wedding, Reception, Engagement, Birthday, etc.
  };
  services: {
    id: string;
    name: string;
    price: number;
  }[];
  financials: {
    subtotal: number;
    discountType: 'rupees' | 'percentage';
    discountValue: number;
    discountAmount: number;
    finalTotal: number;
    advancePaid: number;
    remainingBalance: number;
  };
  status: 'Quotation' | 'Confirmed Booking' | 'Completed' | 'Cancelled';
  paymentStatus: 'Advance Pending' | 'Partially Paid' | 'Fully Paid';
  customNotes?: string;
}

export interface StudioProfile {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  gstNumber?: string;
  bankDetails: {
    accountName: string;
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    upiId: string;
  };
  termsAndConditions: string[];
  logoDataUrl?: string;
}
```

### Interactive Verification Plan
1. **Authentication Flow**: Verify login with valid credentials, session retention on refresh, and secure logout.
2. **Quotation Math**: Test subtotal summing, percentage vs. rupee discount calculation, negative amount prevention, and remaining balance calculations.
3. **PDF Generation**: Verify A4 portrait dimensions, rendering of logo, customer details, service table, financial breakdown, and signatures; ensure download creates a valid non-empty `.pdf` file.
4. **CRUD & Search**: Test creation, saving, editing, duplication, deletion with confirmation, and real-time search by name, phone, and quotation number.
5. **WhatsApp Integration**: Test WhatsApp deep-link generation with formatted message content.
