# SR PHOTOGRAPHY – Quotation Save, Full Preview & Print Export Fix

Fix the quotation saving workflow to prevent silent validation failures, render a complete unclipped scrollable A4 preview showing all services and signatures, and provide seamless browser print "Save as PDF" alongside an interactive image export modal.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions have been aligned based on your clarifying feedback:

- **Save Failure Resolution**: Replace suppressed `window.alert()` calls with clear, visible inline warning banners and reactive field validation. The save button will immediately communicate missing fields or save status directly on screen.
- **Full Quotation Page Display**: Remove container clipping (`overflow-hidden` constraints and artificial max-height limits) in the preview modal. The quotation sheet will render in its entirety from the top gold logo badge down through all selected services, financials, terms, and the authorized signatory stamp with smooth vertical scrolling.
- **Browser Print "Save as PDF" Export**: Add an optimized A4 print stylesheet and direct print trigger (`window.print()`) that invokes the browser's native print engine. This circumvents iframe sandbox download restrictions and outputs a crisp, authentic vector PDF document.
- **Interactive One-Click JPG Save Modal**: For image downloads, provide an interactive export modal that presents the generated high-resolution JPG directly with a "Save Image", "Copy Image", and "Download File" button so the user is never blocked by browser download policies.

---

## 1. Overview & Core Concept

- **What It Does**: Resolves friction points in the SR PHOTOGRAPHY admin portal by ensuring quotations always save predictably with instant visual feedback, display completely in the preview modal without truncated tables or signatures, and export flawlessly to PDF and JPG using both native browser print dialogs and direct image capture.
- **Target Audience**: SR PHOTOGRAPHY studio owner and administration team generating commercial wedding and lifestyle event quotations.
- **Key Value**: Guarantees zero lost customer records, full visibility of multi-service quotations, and instant creation of client-ready A4 PDFs and JPGs suitable for direct client sharing and printing.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Quotation Creation & Save Flow**:
   - Admin fills in customer details (Customer Name, Mobile, Event Date, Location, Type).
   - If a required field is empty when clicking "Save Quotation", a distinct gold-bordered alert banner appears directly above the button with high-contrast copy (e.g., *"Please provide customer name and select at least one service before saving"*).
   - Upon successful save, the button transitions to a reassuring emerald badge (*"Quotation SRP-2026-XXXX Saved!"*) and automatically refreshes the recent quotation feed without leaving the form.

2. **Full Scrollable A4 Preview**:
   - Clicking "Preview" opens an expansive modal with a dark velvet backdrop (`bg-stone-950/85`).
   - The white and gold A4 sheet is displayed at 100% natural resolution or user-adjusted zoom (50% to 120%).
   - The modal viewport enables smooth vertical scrolling so that regardless of how many photography services are selected (from 1 to 14+), the client details, entire itemized fee table, balance breakdown, legal terms, and dual signatures are completely visible.

3. **Export Actions (Print & Save)**:
   - **"Save as PDF (Print)"**: Triggers `window.print()` with `@page { size: A4 portrait; margin: 0; }`. The modal controls and background are hidden (`@media print { .no-print { display: none } }`), sending solely the A4 document to the browser's native print dialogue where the user selects "Save as PDF".
   - **"Export JPG"**: Renders the document to a high-DPI image and opens a dedicated Export Dialog displaying the ready image with a "Download Image" button, a "Copy to Clipboard" button, and direct right-click instructions.

### Visual Styling & Typographic Hierarchy

- **Color Tokens**: White ground (`#FFFFFF`), warm charcoal typography (`#1C1917`), royal gold accents (`#C5A059`, `#DFB76C`), deep onyx headers (`#0C0A09`).
- **Typography**: Cinzel serif display headers paired with clean Plus Jakarta Sans numerals and service descriptions.
- **Feedback Alerts**: High-contrast, non-intrusive alert ribbons replacing native alert boxes.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Native Browser Print vs. Automated Client-Side Canvas Download**:
  - *Chosen Approach*: Support both, prioritizing the native **Browser Print Dialog ("Save as PDF")** via `window.print()` as requested by the user, while retaining client-side canvas generation.
  - *Why*: In sandboxed iframe environments (like AI Studio previews), browsers frequently block `<a download>` program clicks for security reasons. `window.print()` operates at the browser level and is never blocked, producing 600+ DPI vector text without blurriness.
  - *Alternatives Considered*: Pure server-side Puppeteer rendering (adds unnecessary backend latency and heavy Chromium dependencies).

- **Decision 2: Inline Form Validation vs. Native Alert Dialogs**:
  - *Chosen Approach*: Replace all `alert()` instances across `QuotationForm.tsx`, `App.tsx`, and `QuotationHistoryView.tsx` with dedicated stateful banner alerts and animated toast feedback.
  - *Why*: Browsers automatically suppress `window.alert()` inside iframes to prevent UI lockups, creating the illusion that clicking "Save" does nothing. Inline banners are 100% reliable and provide clear instructions on what needs fixing.

- **Decision 3: Unbounded Modal Scroll Container vs. Hardcoded 1123px Height**:
  - *Chosen Approach*: Change the preview modal container from `overflow-hidden` to `overflow-y-auto` and allow `QuotationSheetA4` to expand dynamically with content while preserving standard A4 proportions.
  - *Why*: Quotations with multiple services naturally require more vertical room. Users need to verify every service line item and the signatory block before sending.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    SR PHOTOGRAPHY Admin Portal                  │
└────────────────────────────────┬────────────────────────────────┘
                                 │
         ┌───────────────────────┴───────────────────────┐
         ▼                                               ▼
┌─────────────────────────────────┐             ┌─────────────────────────────────┐
│      Quotation Form View        │             │      Quotation Preview Modal    │
│  - Reactive field validation    │             │  - Full vertical scrolling      │
│  - Inline error alert ribbon    │             │  - Unclipped A4 sheet display   │
│  - Real-time subtotal & balance │             │  - Zoom control (50% - 120%)    │
│  - Direct Save to Express API   │             │  - Dual Export Buttons:         │
└────────────────┬────────────────┘             │    • Browser Print (Save as PDF)│
                 │                              │    • JPG Export Dialog          │
                 │                              └────────────────┬────────────────┘
                 ▼                                               │
┌─────────────────────────────────┐                              │
│       Express Persistence       │                              │
│  - POST /api/quotations         │◄─────────────────────────────┘
│  - PUT /api/quotations/:id      │
│  - File store in data/*.json    │
└─────────────────────────────────┘
```

### Component & State Interaction Mapping

1. **Validation State (`formError: string | null`)**:
   - Added to `QuotationForm.tsx`. Cleared whenever user types in `Customer Name` or selects a service.
   - If user attempts to save while invalid, sets `formError` with specific corrective instructions and smoothly scrolls into view.

2. **A4 Print CSS Configuration**:
   - In `index.css`, establish dedicated print rules:
     - `@page { size: A4 portrait; margin: 0; }`
     - `.print-only` visible solely during print; all navigation, modal backdrops, zoom buttons, and toolbars marked `.no-print`.
     - Forces browser print to render background colors and gold borders (`-webkit-print-color-adjust: exact`).

3. **JPG Export Modal (`exportImageModalUrl: string | null`)**:
   - When "Export JPG" is clicked, converts the canvas to an image URL and opens a focused review modal with immediate download and copy triggers.
