# Desktop/PC Design Specifications

**Version:** 1.0.0  
**Last Updated:** February 9, 2026  
**Target Devices:** Desktop (1024px+), Laptop, Large Tablets

---

## Table of Contents

1. [Overview](#overview)
2. [Layout Architecture](#layout-architecture)
3. [Navigation System](#navigation-system)
4. [Dashboard Layout](#dashboard-layout)
5. [Page-Specific Layouts](#page-specific-layouts)
6. [Responsive Behavior](#responsive-behavior)
7. [Desktop-Specific Components](#desktop-specific-components)
8. [Keyboard Shortcuts](#keyboard-shortcuts)
9. [Multi-Window Support](#multi-window-support)

---

## Overview

### Design Philosophy

The desktop experience is designed to maximize productivity for veterinary professionals working from their offices or clinics. Unlike the mobile version which focuses on quick access to information, the desktop version emphasizes:

1. **Information Density**: Show more data per screen to reduce scrolling
2. **Multi-Panel Layouts**: Use sidebar + main content + detail panels
3. **Hover Interactions**: Rich tooltips, quick previews, contextual menus
4. **Keyboard Navigation**: Full keyboard support for power users
5. **Wide Content**: Utilize horizontal space for tables, multi-column layouts

---

## Layout Architecture

### Core Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Top Bar (64px height)                                      │
│  [Logo] [Org Switcher] [Search] [Notifications] [Profile]  │
├─────────┬───────────────────────────────────────────────────┤
│         │                                                   │
│  Sidebar│  Main Content Area                               │
│  (280px)│                                                   │
│         │                                                   │
│ [Nav 1] │  ┌─────────────────────────────────────────┐   │
│ [Nav 2] │  │  Page Header                            │   │
│ [Nav 3] │  │  [Title] [Actions]                      │   │
│ [Nav 4] │  └─────────────────────────────────────────┘   │
│ [Nav 5] │                                                   │
│         │  ┌─────────────────────────────────────────┐   │
│ [---]   │  │  Content Cards/Tables                   │   │
│         │  │                                          │   │
│ [Teams] │  │                                          │   │
│ [Settings]  │                                          │   │
│         │  └─────────────────────────────────────────┘   │
│         │                                                   │
└─────────┴───────────────────────────────────────────────────┘
```

### Dimensions

```css
/* Desktop Layout */
--topbar-height: 64px;
--sidebar-width: 280px;
--sidebar-collapsed-width: 80px;
--main-content-max-width: 1440px;
--main-content-padding: 32px;
```

---

## Navigation System

### 1. Top Bar

**Height:** 64px  
**Background:** White  
**Border Bottom:** 1px solid gray-200  
**Shadow:** Subtle (0 1px 3px rgba(0,0,0,0.1))

#### Components:

```
┌────────────────────────────────────────────────────────────────┐
│ [🏥 VetReg] [📍 Greenleaf Clinic ▼] [🔍 Search...]          │
│                                  [🔔 3] [👤 Dr. Johnson ▼]   │
└────────────────────────────────────────────────────────────────┘
```

**1. Logo/Brand (Left)**
- Size: 120px width
- Logo + "VetReg" text
- Clickable → Returns to dashboard

**2. Organization Switcher**
- Dropdown with all organizations
- Current org name + icon
- Badge showing unread notifications per org
- Max width: 280px

**3. Global Search**
- Centered or left-aligned after org switcher
- Width: 400px (expands to 600px on focus)
- Placeholder: "Search clients, animals, treatments..."
- Keyboard shortcut: `Cmd/Ctrl + K`
- Shows recent searches and quick actions

**4. Notifications (Right)**
- Bell icon with badge count
- Dropdown panel (350px width)
- Shows last 10 notifications
- "View All" link at bottom

**5. User Profile (Far Right)**
- Avatar + Name
- Dropdown menu:
  - My Profile
  - Settings
  - Help & Support
  - ---
  - Sign Out

### 2. Sidebar Navigation

**Width:** 280px (expanded), 80px (collapsed)  
**Background:** gray-50  
**Position:** Fixed

#### Structure:

```
┌─────────────────────────┐
│ Main Navigation         │
├─────────────────────────┤
│ 🏠 Dashboard            │
│ 👥 Clients              │
│ 🐾 Animals              │
│ 💊 Treatments           │
│ 📅 Schedule             │
│ 💰 Revenue              │
│ 📊 Reports              │
├─────────────────────────┤
│ Organization            │
├─────────────────────────┤
│ 🏢 Clinics              │
│ 👨‍⚕️ Team Members         │
│ ⚙️  Settings            │
├─────────────────────────┤
│ [Collapse Button]       │
└─────────────────────────┘
```

#### Nav Item Styling:

```css
.nav-item {
  padding: 12px 16px;
  border-radius: 8px;
  margin: 4px 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-700);
  transition: all 0.2s;
}

.nav-item:hover {
  background-color: var(--gray-100);
  color: var(--gray-900);
}

.nav-item.active {
  background-color: var(--primary-100);
  color: var(--primary-700);
  font-weight: 600;
}

.nav-item-icon {
  width: 20px;
  height: 20px;
}

.nav-item-badge {
  margin-left: auto;
  background-color: var(--primary-600);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}
```

#### Collapsed State:

```
┌─────┐
│ 🏠  │  (Tooltip: Dashboard)
│ 👥  │
│ 🐾  │
│ 💊  │
│ 📅  │
│ 💰  │
│ 📊  │
├─────┤
│ 🏢  │
│ 👨‍⚕️  │
│ ⚙️   │
├─────┤
│ ◀   │
└─────┘
```

---

## Dashboard Layout

### Desktop Dashboard (1280px+)

```
┌───────────────────────────────────────────────────────────────┐
│  Greeting Section (160px height)                              │
│  Good morning, Dr. Johnson        🌄 Illustration            │
│  Monday, February 9, 2026                                     │
└───────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Quick Stats Grid (4 columns)                                │
├──────────┬──────────┬──────────┬──────────────────────────┐
│ 🏥       │ 👥       │ 🐾       │ 🐄                       │
│ Clinics  │ Clients  │ Pets     │ Livestock                │
│ 3        │ 45       │ 62       │ 12 batches               │
└──────────┴──────────┴──────────┴──────────────────────────┘
├──────────┬──────────┬──────────┬──────────────────────────┐
│ 💰       │ 📋       │ 📅       │                          │
│ Revenue  │ Pending  │ Schedule │                          │
│ ₦350k    │ 8        │ 23       │                          │
└──────────┴──────────┴──────────┴──────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  Today's Agenda (2 columns: 60% + 40%)                       │
├───────────────────────────────┬──────────────────────────────┤
│  Unsettled Schedules          │  Don't Forget                │
│                               │                              │
│  ⏰ 9:00 AM - Vaccination     │  ⚠️ 3 follow-ups today      │
│  🐕 Bella (Emma Walker)       │  ⚠️ 2 unpaid invoices       │
│  [Settle]                     │                              │
│                               │  [View All →]                │
│  ⏰ 11:00 AM - Farm Visit     │                              │
│  🐄 Batch 23 (Greenfield)     │                              │
│  [Settle]                     │                              │
└───────────────────────────────┴──────────────────────────────┘

[Add New Button - Bottom Right]
```

### Stats Widget (Desktop)

```css
.stats-widget-desktop {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 160px;
}

.stats-widget-desktop:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  border-color: var(--primary-300);
}

.stats-icon-desktop {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, var(--primary-50), var(--primary-100));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stats-value-desktop {
  font-size: 32px;
  font-weight: 700;
  color: var(--gray-900);
  line-height: 1;
}

.stats-label-desktop {
  font-size: 14px;
  font-weight: 500;
  color: var(--gray-600);
  text-align: center;
}

.stats-badge-desktop {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--primary-600);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 8px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

---

## Page-Specific Layouts

### 1. Clinics/Organizations Page

**Layout:** 3-column grid (desktop), 2-column (laptop)

```
┌─────────────────────────────────────────────────────────────┐
│  Page Header                                                │
│  Vet Clinics (3)                           [+ Add New]      │
│  Manage the veterinary clinics in your network.            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  [🔍 Search clinics...]                   [Filter ▼]        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┬─────────────────┬─────────────────────────┐
│ Clinic Card 1   │ Clinic Card 2   │ Clinic Card 3           │
│                 │                 │                         │
│ 🏥 Greenleaf    │ 🏥 Valley       │ 🏥 Harmony              │
│ Veterinary      │ Animal Hospital │ Pet Care                │
│                 │                 │                         │
│ 18 clients      │ 9 clients       │ 15 clients              │
│                 │                 │                         │
│ [View]          │ [View]          │ [View]                  │
└─────────────────┴─────────────────┴─────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ⚠️ Pending Verification (3)                 [View All →]   │
│  New clinics awaiting approval                              │
└─────────────────────────────────────────────────────────────┘
```

**Clinic Card (Desktop):**

```css
.clinic-card-desktop {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.2s;
  min-height: 280px;
}

.clinic-card-desktop:hover {
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--primary-300);
}

.clinic-card-header-desktop {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.clinic-card-icon-desktop {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  background: var(--primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
}

.clinic-card-badge-desktop {
  position: absolute;
  top: -8px;
  right: -8px;
  background: var(--primary-600);
  color: white;
  font-size: 14px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
```

### 2. Animals Page

**Layout:** Master-Detail (on wide screens 1440px+)

```
┌────────────────────────────┬──────────────────────────────────┐
│ Animal List (60%)          │ Animal Detail Panel (40%)        │
│                            │                                  │
│ [Search...] [Filter]       │ [Animal Photo]                   │
│                            │                                  │
│ [All] [Dogs] [Cats] [Other]│ Bella                            │
│                            │ Golden Retriever • Female        │
│ ┌─────────────────────┐    │                                  │
│ │ 🐕 Bella            │ ←──┤ Owner: Emma Walker              │
│ │ Emma Walker         │    │ 📞 9876543210                   │
│ │ Golden Retriever    │    │ ✉️  emma@email.com              │
│ │ ✓ Vaccination due   │    │                                  │
│ └─────────────────────┘    │ Bio:                             │
│                            │ • Location: Oakwood              │
│ ┌─────────────────────┐    │ • Age: 3 years old              │
│ │ 🐱 Max              │    │ • Vaccination: Up-to-date        │
│ │ James Parker        │    │                                  │
│ │ Vaccination due     │    │ Medical History:                 │
│ └─────────────────────┘    │ [Timeline view...]               │
│                            │                                  │
│ [...more animals]          │ [Add Treatment] [Edit]           │
└────────────────────────────┴──────────────────────────────────┘
```

**Animal List Item (Desktop):**

```css
.animal-list-item-desktop {
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  gap: 16px;
  align-items: center;
  margin-bottom: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.animal-list-item-desktop:hover {
  background: var(--gray-50);
  border-color: var(--primary-300);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.animal-list-item-desktop.active {
  background: var(--primary-50);
  border-color: var(--primary-500);
}

.animal-avatar-desktop {
  width: 64px;
  height: 64px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;
}

.animal-info-desktop {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.animal-name-desktop {
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
}

.animal-owner-desktop {
  font-size: 14px;
  color: var(--gray-600);
}

.animal-meta-desktop {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 13px;
  color: var(--gray-500);
}
```

### 3. Revenue Page

**Layout:** Table View (primary) + Card View (toggle)

```
┌─────────────────────────────────────────────────────────────┐
│  Revenue                                                    │
│  Manage all payments and invoices.                         │
│                                                             │
│  [📅 Apr 1, 2024 - Apr 25, 2024]            [Export CSV]   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Revenue ₦350,000     Pending (8)     Paid (14)            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  [🔍 Search invoices...]                                    │
│  [All Payments] [Pet Payment] [Livestock] [Farm]           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  Table View                                                 │
├────────┬──────────────┬──────────┬──────────┬──────────────┤
│ Image  │ Description  │ Clinic   │ Amount   │ Status       │
├────────┼──────────────┼──────────┼──────────┼──────────────┤
│ 🐕     │ Batch 23     │ Harmony  │ ₦25,000 │ ✓ Paid       │
│        │ 100 cattle   │ Pet Care │          │              │
├────────┼──────────────┼──────────┼──────────┼──────────────┤
│ 🐄     │ Valley Hosp. │ Greenf.  │ ₦75,000 │ ⚠️ Overdue   │
│        │ Batch visit  │ Farms    │          │              │
└────────┴──────────────┴──────────┴──────────┴──────────────┘

[Pagination: ← 1 2 3 ... 10 →]
```

**Table Styling:**

```css
.data-table-desktop {
  width: 100%;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  overflow: hidden;
}

.data-table-desktop thead {
  background: var(--gray-50);
  border-bottom: 1px solid var(--gray-200);
}

.data-table-desktop th {
  padding: 12px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table-desktop td {
  padding: 16px;
  border-bottom: 1px solid var(--gray-100);
  font-size: 14px;
  color: var(--gray-900);
}

.data-table-desktop tbody tr {
  transition: background 0.2s;
}

.data-table-desktop tbody tr:hover {
  background: var(--gray-50);
}

.data-table-desktop tbody tr:last-child td {
  border-bottom: none;
}
```

### 4. Treatment Detail Page

**Layout:** Full-width with sidebar

```
┌────────────────────────────┬──────────────────────────────────┐
│ Treatment Record           │ Related Actions                  │
│                            │                                  │
│ [Back to List]             │ [📄 Print]                       │
│                            │ [📧 Email to Client]             │
│ Treatment ID: TR-2024-001  │ [💰 Mark as Paid]               │
│ Date: Feb 14, 2024         │ [✏️  Edit Record]                │
│                            │                                  │
│ Patient: Bella             │ Quick Info:                      │
│ [🐕 Photo]                 │ • Client: Emma Walker            │
│ Golden Retriever • Female  │ • Phone: 9876543210              │
│                            │ • Total Revenue: ₦45,000         │
│ Chief Complaint:           │                                  │
│ Annual check-up and        │ Payment:                         │
│ vaccination                │ Amount: ₦15,000                  │
│                            │ Status: Paid ✓                   │
│ Clinical Findings:         │ Paid: Feb 14, 2024               │
│ • Heart rate: 110 bpm      │                                  │
│ • Temperature: 38.5°C      │ Version History:                 │
│ • Weight: 28.5 kg          │ v2 (Current) Feb 15, 2024        │
│                            │ v1 (Original) Feb 14, 2024       │
│ Diagnosis:                 │                                  │
│ Healthy, annual check      │ [View Changes]                   │
│                            │                                  │
│ Treatment Given:           │                                  │
│ • Rabies vaccination       │                                  │
│ • DHPP booster             │                                  │
│ • Deworming                │                                  │
│                            │                                  │
│ Prescription:              │                                  │
│ [Table of medications...]  │                                  │
│                            │                                  │
│ Follow-up:                 │                                  │
│ Next visit: Feb 14, 2025   │                                  │
│ (1 year - annual check)    │                                  │
└────────────────────────────┴──────────────────────────────────┘
```

---

## Responsive Behavior

### Breakpoint Strategy

```css
/* Mobile: < 768px */
/* - Bottom tab navigation
 * - Single column layouts
 * - Stacked cards
 */

/* Tablet: 768px - 1023px */
@media (min-width: 768px) {
  /* - Side drawer (collapsible)
   * - 2-column grids
   * - Table view for lists
   */
}

/* Laptop: 1024px - 1279px */
@media (min-width: 1024px) {
  /* - Persistent sidebar (collapsible)
   * - 3-column grids
   * - Full table views
   */
}

/* Desktop: 1280px - 1535px */
@media (min-width: 1280px) {
  /* - Master-detail layouts
   * - 4-column grids on dashboard
   * - Side panels for quick actions
   */
}

/* Large Desktop: 1536px+ */
@media (min-width: 1536px) {
  /* - Max width containers (1440px)
   * - More whitespace
   * - Larger images/avatars
   */
}
```

### Layout Transitions

```typescript
// Sidebar collapse on 1024px
const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

// Auto-collapse on tablet
useEffect(() => {
  const handleResize = () => {
    if (window.innerWidth < 1024 && window.innerWidth >= 768) {
      setSidebarCollapsed(true);
    }
  };
  
  window.addEventListener('resize', handleResize);
  handleResize();
  
  return () => window.removeEventListener('resize', handleResize);
}, []);

// Master-detail view toggle
const [showDetailPanel, setShowDetailPanel] = useState(
  window.innerWidth >= 1440
);
```

---

## Desktop-Specific Components

### 1. Hover Cards (Quick Preview)

```css
.hover-card {
  position: absolute;
  z-index: 1000;
  width: 320px;
  background: white;
  border: 1px solid var(--gray-200);
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: fadeInUp 0.2s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Example: Client Hover Card**

```
┌─────────────────────────────────┐
│ [Avatar] Emma Walker            │
│                                 │
│ 📞 9876543210                   │
│ ✉️  emma@email.com              │
│ 📍 123 Maple St, Oakwood        │
│                                 │
│ Pets: 2 (1 dog, 1 cat)         │
│ Total Revenue: ₦45,000          │
│ Last visit: 1 week ago          │
│                                 │
│ [View Profile →]                │
└─────────────────────────────────┘
```

### 2. Context Menus (Right-Click)

```typescript
const contextMenuItems = [
  { icon: <EyeIcon />, label: 'View Details', shortcut: 'Enter' },
  { icon: <PencilIcon />, label: 'Edit', shortcut: 'E' },
  { icon: <MessageIcon />, label: 'Send Message', shortcut: 'M' },
  { divider: true },
  { icon: <TrashIcon />, label: 'Delete', shortcut: 'Del', danger: true }
];

<ContextMenu items={contextMenuItems} />
```

### 3. Command Palette (`Cmd+K`)

```
┌──────────────────────────────────────────────────────┐
│  🔍 Search or jump to...                             │
├──────────────────────────────────────────────────────┤
│  Recent                                              │
│  🐕 Bella - Emma Walker                              │
│  👤 James Parker                                     │
│  💊 Treatment TR-2024-105                            │
├──────────────────────────────────────────────────────┤
│  Quick Actions                                       │
│  ➕ Add new client                                   │
│  ➕ Register animal                                  │
│  ➕ Create treatment record                          │
│  📅 View schedule                                    │
├──────────────────────────────────────────────────────┤
│  Navigation                                          │
│  🏠 Go to Dashboard                                  │
│  👥 Go to Clients                                    │
│  🐾 Go to Animals                                    │
└──────────────────────────────────────────────────────┘
```

### 4. Quick Filters Panel

```
┌────────────────────────┐
│ Filters                │
├────────────────────────┤
│ Status                 │
│ ☐ Active               │
│ ☐ Inactive             │
│ ☐ Deleted              │
├────────────────────────┤
│ Species                │
│ ☐ Dogs (32)            │
│ ☐ Cats (18)            │
│ ☐ Cattle (12)          │
│ ☐ Other (8)            │
├────────────────────────┤
│ Payment Status         │
│ ☐ Paid                 │
│ ☐ Owed                 │
│ ☐ Partially Paid       │
├────────────────────────┤
│ Date Range             │
│ [From: ___]            │
│ [To:   ___]            │
├────────────────────────┤
│ [Apply] [Reset]        │
└────────────────────────┘
```

---

## Keyboard Shortcuts

### Global Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl + K` | Open command palette |
| `Cmd/Ctrl + B` | Toggle sidebar |
| `Cmd/Ctrl + /` | Open keyboard shortcuts help |
| `Cmd/Ctrl + ,` | Open settings |
| `Esc` | Close modal/dialog |
| `?` | Show help overlay |

### Navigation

| Shortcut | Action |
|----------|--------|
| `G then D` | Go to Dashboard |
| `G then C` | Go to Clients |
| `G then A` | Go to Animals |
| `G then T` | Go to Treatments |
| `G then S` | Go to Schedule |
| `G then R` | Go to Revenue |

### Actions

| Shortcut | Action |
|----------|--------|
| `N` | New (context-dependent) |
| `E` | Edit selected item |
| `Del` | Delete selected item |
| `Enter` | View selected item |
| `Cmd/Ctrl + S` | Save form |
| `Cmd/Ctrl + Enter` | Submit form |

### List Navigation

| Shortcut | Action |
|----------|--------|
| `↑` / `↓` | Navigate list items |
| `Cmd/Ctrl + ↑` | Jump to top |
| `Cmd/Ctrl + ↓` | Jump to bottom |
| `Space` | Select item |
| `Cmd/Ctrl + A` | Select all |

---

## Multi-Window Support

### Opening in New Windows

```typescript
// Allow opening items in new window
const handleClick = (e: React.MouseEvent, itemId: string) => {
  if (e.ctrlKey || e.metaKey) {
    // Cmd/Ctrl + Click opens in new tab
    window.open(`/dashboard/animals/${itemId}`, '_blank');
  } else {
    router.push(`/dashboard/animals/${itemId}`);
  }
};
```

### State Synchronization

```typescript
// Sync state across tabs using BroadcastChannel
const channel = new BroadcastChannel('vet-reg-sync');

// Send updates
channel.postMessage({
  type: 'TREATMENT_UPDATED',
  treatmentId: 'TR-123',
  timestamp: Date.now()
});

// Listen for updates
channel.addEventListener('message', (event) => {
  if (event.data.type === 'TREATMENT_UPDATED') {
    queryClient.invalidateQueries(['treatments', event.data.treatmentId]);
  }
});
```

---

## Desktop-Specific Optimizations

### 1. Larger Touch Targets (Hover Zones)

Since desktop users use mouse, we can:
- Use smaller buttons (min 32x32px instead of 44x44px)
- Tighter spacing between elements
- Hover zones larger than visible buttons

### 2. Richer Interactions

- Drag & drop for file uploads
- Right-click context menus
- Inline editing (click to edit)
- Multi-select with Shift/Cmd

### 3. Information Density

- Show more columns in tables
- Smaller fonts acceptable (14px body, 12px captions)
- Compact card layouts
- Visible metadata (created by, updated at, etc.)

### 4. Advanced Filtering

- Multi-select filters
- Date range pickers (dual calendars)
- Advanced search (boolean operators)
- Saved filter presets

---

## Implementation Checklist

- [ ] **Layout Components**
  - [ ] TopBar component
  - [ ] Sidebar component (with collapse)
  - [ ] MainContent wrapper
  - [ ] PageHeader component
  
- [ ] **Navigation**
  - [ ] Breadcrumbs
  - [ ] Back button
  - [ ] Organization switcher
  - [ ] User menu dropdown
  
- [ ] **Desktop Components**
  - [ ] DataTable with sorting/filtering
  - [ ] MasterDetail layout
  - [ ] HoverCard component
  - [ ] ContextMenu component
  - [ ] CommandPalette component
  - [ ] QuickFilters panel
  
- [ ] **Interactions**
  - [ ] Keyboard shortcuts system
  - [ ] Drag & drop support
  - [ ] Multi-select support
  - [ ] Inline editing
  
- [ ] **Responsive**
  - [ ] Breakpoint utilities
  - [ ] Layout transitions
  - [ ] Sidebar collapse logic
  - [ ] Mobile menu fallback

---

## Next Steps

1. Implement base layout components
2. Build responsive grid system
3. Create desktop-specific components library
4. Test keyboard navigation
5. Optimize for large screens (4K, ultrawide)
6. Performance testing (render large lists)

---

**Version History:**

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 9, 2026 | Initial desktop design specifications |
