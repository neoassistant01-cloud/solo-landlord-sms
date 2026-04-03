# Solo Landlord SMS Assistant MVP - Specification

## 1. Project Overview

**Project Name:** Solo Landlord SMS  
**Type:** Web Application (Next.js 14)  
**Core Functionality:** SMS-based property management assistant for solo landlords managing 1-10 rental properties. Automates rent reminders, triages maintenance requests via photo, broadcasts vacancies, and provides a simple tenant CRM.  
**Target Users:** Individual landlords with small property portfolios (1-10 units)

---

## 2. UI/UX Specification

### Layout Structure

**Pages:**
1. **Dashboard** (`/`) - Overview of properties, upcoming rent reminders, recent maintenance
2. **Properties** (`/properties`) - List/add/edit properties
3. **Tenants** (`/tenants`) - Tenant CRM with contact info and lease details
4. **Reminders** (`/reminders`) - Configure automated rent reminder schedules
5. **Maintenance** (`/maintenance`) - View incoming maintenance requests with triage
6. **Vacancies** (`/vacancies`) - List vacant units and broadcast to platforms

**Global Layout:**
- Sidebar navigation (240px width, collapsible on mobile)
- Main content area with header bar
- Responsive: sidebar becomes bottom nav on mobile (<768px)

### Visual Design

**Color Palette:**
- Primary: `#1E3A5F` (deep navy)
- Secondary: `#3B82F6` (bright blue)
- Accent: `#10B981` (emerald green)
- Warning: `#F59E0B` (amber)
- Danger: `#EF4444` (red)
- Background: `#F8FAFC` (light gray)
- Card Background: `#FFFFFF`
- Text Primary: `#1E293B`
- Text Secondary: `#64748B`

**Typography:**
- Headings: `DM Sans` (600/700 weight)
- Body: `DM Sans` (400/500 weight)
- Monospace (phone numbers): `JetBrains Mono`
- Sizes: h1=32px, h2=24px, h3=18px, body=15px, small=13px

**Spacing:**
- Base unit: 4px
- Card padding: 24px
- Section gaps: 32px
- Element gaps: 16px

**Visual Effects:**
- Card shadows: `0 1px 3px rgba(0,0,0,0.1)`
- Hover states: subtle scale (1.02) + shadow increase
- Transitions: 200ms ease-out

### Components

**Cards:**
- Property Card (address, tenant count, rent status)
- Tenant Card (name, phone, property, lease dates)
- Reminder Card (schedule type, timing, active toggle)
- Maintenance Card (photo thumbnail, description, urgency badge)

**Buttons:**
- Primary: filled `#3B82F6`, white text
- Secondary: outlined, `#3B82F6` border
- Danger: filled `#EF4444`
- States: hover (darken 10%), disabled (50% opacity)

**Forms:**
- Input fields: 44px height, rounded-lg, border `#E2E8F0`
- Focus: ring `#3B82F6` 2px
- Labels: above field, 13px, `#64748B`

**Badges/Urgency:**
- Emergency: `#EF4444` bg, white text
- Urgent: `#F59E0B` bg, white text
- Normal: `#10B981` bg, white text

---

## 3. Functionality Specification

### Core Features

#### 3.1 Rent Reminder Automation
- Configure reminder schedule per tenant:
  - 3 days before due date
  - Day-of due date
  - 1 day after due date
- Toggle individual reminders on/off
- Mock SMS queue (logged to console/JSON for MVP)
- View scheduled reminders in list view

#### 3.2 Maintenance Triage
- Incoming maintenance "requests" (simulated)
- Photo upload shows thumbnail
- AI triage categorizes into:
  - **Emergency** (flooding, no heat in winter, gas leak)
  - **Urgent** (broken AC, major leak, no hot water)
  - **Normal** (minor repairs, cosmetic issues)
- Display with urgency badge
- Mark as resolved

#### 3.3 Vacancy Broadcast
- List vacant properties
- One-click "Broadcast" button
- Mock output: JSON log of platforms (Craigslist, Zillow, Facebook Marketplace)
- Track broadcast status

#### 3.4 Tenant Management CRM
- Add/Edit/Delete tenants
- Fields: Name, Phone, Email, Property, Lease Start, Lease End, Rent Amount
- Quick-dial phone numbers
- Search/filter tenants

### Data Handling

**Persistence:** JSON file-based (`data.json`) in project root
- Properties array
- Tenants array
- Reminders array
- MaintenanceRequests array
- Vacancies array

**Mock SMS API:**
- `POST /api/sms/send` - queues mock SMS
- Logs to `/tmp/sms-log.json`

### Edge Cases
- Empty states for each list view
- Validation on required fields (phone, name)
- Duplicate phone number warning

---

## 4. Acceptance Criteria

1. **Build Passes:** `npm run build` completes without errors
2. **All Pages Render:** Dashboard, Properties, Tenants, Reminders, Maintenance, Vacancies load without crash
3. **CRUD Works:** Can add a property, add a tenant, configure a reminder
4. **Responsive:** Sidebar collapses to bottom nav on mobile viewport
5. **Data Persists:** Reloading page retains added data (JSON storage)
6. **Urgency Badge Display:** Maintenance requests show correct color badge
7. **Vacancy Broadcast:** Click triggers mock broadcast log

---

## 5. Technical Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **State:** React useState + JSON file persistence
- **Fonts:** DM Sans (Google Fonts), JetBrains Mono
