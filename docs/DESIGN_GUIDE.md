# Design Guide — Veterinary Practice Management Platform

**Version:** 1.0.0  
**Last Updated:** February 9, 2026  
**Platform:** Web (Mobile-first, Responsive Desktop)

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Icons & Imagery](#icons--imagery)
7. [Interaction Patterns](#interaction-patterns)
8. [Responsive Breakpoints](#responsive-breakpoints)
9. [Accessibility](#accessibility)
10. [Motion & Animation](#motion--animation)

---

## Design Philosophy

### Core Principles

1. **Clarity First**: Veterinary professionals need quick access to critical information. Every design decision prioritizes clarity and scanability.

2. **Mobile-First, Desktop-Enhanced**: The platform is designed primarily for mobile use (vets on-the-go) but provides enhanced productivity features on desktop.

3. **Visual Hierarchy**: Use color, size, and spacing to establish clear information hierarchy. Critical data (animal health status, payment status, schedules) must be immediately visible.

4. **Calm & Professional**: Use calming colors (greens, soft blues) with professional typography. Avoid aggressive reds except for critical alerts.

5. **Data Density with Breathing Room**: Pack information efficiently while maintaining comfortable spacing for touch targets and readability.

6. **Contextual Actions**: Actions appear contextually near relevant data (Message button next to client info, View button on cards).

---

## Color System

### Primary Colors

```css
/* Primary Green (Main Brand Color) */
--primary-50:  #ECFDF5;   /* Lightest - backgrounds */
--primary-100: #D1FAE5;   /* Light - hover states */
--primary-200: #A7F3D0;
--primary-300: #6EE7B7;
--primary-400: #34D399;
--primary-500: #10B981;   /* Base primary - buttons, links */
--primary-600: #059669;   /* Dark - button hover */
--primary-700: #047857;   /* Darker */
--primary-800: #065F46;   /* Darkest - text on light bg */
--primary-900: #064E3B;
```

### Semantic Colors

```css
/* Success (Green) */
--success-50:  #F0FDF4;
--success-500: #22C55E;   /* Success messages, "Paid" status */
--success-700: #15803D;

/* Warning (Amber/Orange) */
--warning-50:  #FFFBEB;
--warning-500: #F59E0B;   /* Warning badges, "Overdue" status */
--warning-700: #B45309;

/* Error (Red) */
--error-50:  #FEF2F2;
--error-500: #EF4444;     /* Error messages, critical alerts */
--error-700: #B91C1C;

/* Info (Blue) */
--info-50:  #EFF6FF;
--info-500: #3B82F6;      /* Info messages, "In Network" badges */
--info-700: #1D4ED8;
```

### Neutral Colors (Grays)

```css
--gray-50:  #F9FAFB;     /* Page backgrounds */
--gray-100: #F3F4F6;     /* Card backgrounds, subtle borders */
--gray-200: #E5E7EB;     /* Borders, dividers */
--gray-300: #D1D5DB;     /* Disabled states */
--gray-400: #9CA3AF;     /* Placeholder text */
--gray-500: #6B7280;     /* Secondary text */
--gray-600: #4B5563;     /* Body text */
--gray-700: #374151;     /* Headings */
--gray-800: #1F2937;     /* Dark headings */
--gray-900: #111827;     /* Darkest text */
```

### Background Colors

```css
--background-primary:   #FFFFFF;   /* Main content area */
--background-secondary: #F9FAFB;   /* Page background */
--background-tertiary:  #F3F4F6;   /* Sidebar, cards */
--background-accent:    #ECFDF5;   /* Soft green highlight areas */
```

---

## Typography

### Font Family

```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
--font-mono: 'JetBrains Mono', 'Courier New', monospace; /* For IDs, codes */
```

### Font Sizes

```css
/* Mobile-first sizes */
--text-xs:   0.75rem;   /* 12px - Small labels, badges */
--text-sm:   0.875rem;  /* 14px - Body text, captions */
--text-base: 1rem;      /* 16px - Standard body text */
--text-lg:   1.125rem;  /* 18px - Emphasized text */
--text-xl:   1.25rem;   /* 20px - Card titles */
--text-2xl:  1.5rem;    /* 24px - Section headers */
--text-3xl:  1.875rem;  /* 30px - Page titles */
--text-4xl:  2.25rem;   /* 36px - Hero text */
```

### Font Weights

```css
--font-normal:    400;  /* Regular text */
--font-medium:    500;  /* Emphasized text, button labels */
--font-semibold:  600;  /* Subheadings, important labels */
--font-bold:      700;  /* Headings, hero text */
```

### Line Heights

```css
--leading-tight:   1.25;  /* Headings */
--leading-snug:    1.375; /* Subheadings */
--leading-normal:  1.5;   /* Body text */
--leading-relaxed: 1.625; /* Long-form content */
```

### Text Styles

```css
/* Page Title */
.text-page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  line-height: var(--leading-tight);
  color: var(--gray-900);
}

/* Section Heading */
.text-section-heading {
  font-size: var(--text-2xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--gray-800);
}

/* Card Title */
.text-card-title {
  font-size: var(--text-xl);
  font-weight: var(--font-semibold);
  line-height: var(--leading-snug);
  color: var(--gray-800);
}

/* Body Text */
.text-body {
  font-size: var(--text-base);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-600);
}

/* Caption */
.text-caption {
  font-size: var(--text-sm);
  font-weight: var(--font-normal);
  line-height: var(--leading-normal);
  color: var(--gray-500);
}

/* Label */
.text-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  line-height: var(--leading-normal);
  color: var(--gray-700);
}
```

---

## Spacing & Layout

### Spacing Scale

```css
--space-0:  0;
--space-1:  0.25rem;   /* 4px */
--space-2:  0.5rem;    /* 8px */
--space-3:  0.75rem;   /* 12px */
--space-4:  1rem;      /* 16px */
--space-5:  1.25rem;   /* 20px */
--space-6:  1.5rem;    /* 24px */
--space-8:  2rem;      /* 32px */
--space-10: 2.5rem;    /* 40px */
--space-12: 3rem;      /* 48px */
--space-16: 4rem;      /* 64px */
--space-20: 5rem;      /* 80px */
```

### Layout Containers

```css
/* Mobile Container */
.container-mobile {
  max-width: 100%;
  padding: var(--space-4);
}

/* Tablet Container */
.container-tablet {
  max-width: 768px;
  padding: var(--space-6);
  margin: 0 auto;
}

/* Desktop Container */
.container-desktop {
  max-width: 1280px;
  padding: var(--space-8);
  margin: 0 auto;
}

/* Dashboard Content Area */
.dashboard-content {
  max-width: 1440px;
  margin: 0 auto;
  padding: var(--space-6);
}
```

### Grid System

```css
/* Card Grid (Responsive) */
.grid-cards {
  display: grid;
  grid-template-columns: 1fr;           /* Mobile: 1 column */
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .grid-cards {
    grid-template-columns: repeat(2, 1fr);  /* Tablet: 2 columns */
    gap: var(--space-6);
  }
}

@media (min-width: 1024px) {
  .grid-cards {
    grid-template-columns: repeat(3, 1fr);  /* Desktop: 3 columns */
    gap: var(--space-6);
  }
}

/* Stats Grid */
.grid-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: var(--space-4);
}
```

---

## Components

### 1. Buttons

#### Primary Button
```css
.btn-primary {
  background-color: var(--primary-600);
  color: white;
  padding: 0.625rem 1.25rem;      /* 10px 20px */
  border-radius: 0.5rem;          /* 8px */
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  transition: all 0.2s;
}

.btn-primary:hover {
  background-color: var(--primary-700);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.btn-primary:active {
  transform: translateY(1px);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

#### Secondary Button
```css
.btn-secondary {
  background-color: white;
  color: var(--gray-700);
  padding: 0.625rem 1.25rem;
  border: 1px solid var(--gray-300);
  border-radius: 0.5rem;
  font-weight: var(--font-medium);
  font-size: var(--text-base);
  transition: all 0.2s;
}

.btn-secondary:hover {
  background-color: var(--gray-50);
  border-color: var(--gray-400);
}
```

#### Icon Button
```css
.btn-icon {
  background-color: transparent;
  color: var(--gray-600);
  padding: 0.5rem;               /* 8px */
  border-radius: 0.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.btn-icon:hover {
  background-color: var(--gray-100);
  color: var(--gray-900);
}
```

### 2. Cards

#### Standard Card
```css
.card {
  background-color: white;
  border-radius: 0.75rem;         /* 12px */
  padding: var(--space-4);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  transition: all 0.2s;
}

.card:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: var(--gray-300);
}
```

#### Clinic Card (Organizational View)
```css
.clinic-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: var(--space-4);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.clinic-card-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
}

.clinic-card-icon {
  width: 48px;
  height: 48px;
  border-radius: 0.5rem;
  background-color: var(--primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.clinic-card-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: var(--primary-600);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  min-width: 20px;
  text-align: center;
}

.clinic-card-content {
  flex: 1;
}

.clinic-card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
  margin-bottom: var(--space-1);
}

.clinic-card-address {
  font-size: var(--text-sm);
  color: var(--gray-500);
  margin-bottom: var(--space-2);
}

.clinic-card-stats {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-bottom: var(--space-1);
}

.clinic-card-meta {
  font-size: var(--text-xs);
  color: var(--gray-400);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.clinic-card-status {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--error-600);
}

.clinic-card-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--error-500);
}

.clinic-card-footer {
  display: flex;
  justify-content: flex-end;
}
```

#### Pet/Animal Card
```css
.pet-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: var(--space-4);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  display: flex;
  gap: var(--space-3);
}

.pet-card-image {
  width: 56px;
  height: 56px;
  border-radius: 0.5rem;
  object-fit: cover;
  flex-shrink: 0;
}

.pet-card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.pet-card-name {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
}

.pet-card-owner {
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.pet-card-species {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--gray-600);
}

.pet-card-status {
  font-size: var(--text-sm);
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.pet-card-actions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  align-items: flex-end;
}
```

#### Revenue/Payment Card
```css
.payment-card {
  background-color: white;
  border-radius: 0.75rem;
  padding: var(--space-4);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  display: flex;
  gap: var(--space-3);
}

.payment-card-image {
  width: 56px;
  height: 56px;
  border-radius: 0.5rem;
  object-fit: cover;
  flex-shrink: 0;
}

.payment-card-content {
  flex: 1;
}

.payment-card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-2);
}

.payment-card-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
}

.payment-card-amount {
  font-size: var(--text-lg);
  font-weight: var(--font-bold);
  color: var(--gray-900);
}

.payment-card-clinic {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-bottom: var(--space-1);
}

.payment-card-description {
  font-size: var(--text-sm);
  color: var(--gray-600);
  margin-bottom: var(--space-2);
}

.payment-card-meta {
  font-size: var(--text-xs);
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.payment-card-schedule {
  font-size: var(--text-xs);
  color: var(--gray-500);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.payment-card-status {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;
  border-radius: 9999px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.payment-card-status.paid {
  background-color: var(--success-50);
  color: var(--success-700);
}

.payment-card-status.overdue {
  background-color: var(--warning-50);
  color: var(--warning-700);
}
```

### 3. Badges

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.625rem;   /* 4px 10px */
  border-radius: 9999px;
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  line-height: 1;
}

/* Status Badges */
.badge-success {
  background-color: var(--success-50);
  color: var(--success-700);
}

.badge-warning {
  background-color: var(--warning-50);
  color: var(--warning-700);
}

.badge-error {
  background-color: var(--error-50);
  color: var(--error-700);
}

.badge-info {
  background-color: var(--info-50);
  color: var(--info-700);
}

.badge-neutral {
  background-color: var(--gray-100);
  color: var(--gray-700);
}

/* Count Badge (Notification bubble) */
.badge-count {
  background-color: var(--error-500);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 0.125rem 0.5rem;
  border-radius: 9999px;
  min-width: 20px;
  text-align: center;
}
```

### 4. Search Bar

```css
.search-bar {
  position: relative;
  width: 100%;
}

.search-input {
  width: 100%;
  padding: 0.75rem 3rem 0.75rem 3rem;  /* Space for icons */
  background-color: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: 0.75rem;
  font-size: var(--text-base);
  color: var(--gray-900);
  transition: all 0.2s;
}

.search-input:focus {
  outline: none;
  background-color: white;
  border-color: var(--primary-500);
  box-shadow: 0 0 0 3px var(--primary-50);
}

.search-input::placeholder {
  color: var(--gray-400);
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  width: 20px;
  height: 20px;
}

.search-voice-icon {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--gray-400);
  width: 20px;
  height: 20px;
  cursor: pointer;
}

.search-voice-icon:hover {
  color: var(--primary-600);
}
```

### 5. Tabs / Filter Chips

```css
.tab-list {
  display: flex;
  gap: var(--space-2);
  border-bottom: 1px solid var(--gray-200);
  overflow-x: auto;
  scrollbar-width: none;
}

.tab-list::-webkit-scrollbar {
  display: none;
}

.tab-item {
  padding: 0.75rem 1rem;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-600);
  border-bottom: 2px solid transparent;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-item:hover {
  color: var(--gray-900);
}

.tab-item.active {
  color: var(--primary-600);
  border-bottom-color: var(--primary-600);
}

/* Filter Chips (Alternative style) */
.chip-list {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  scrollbar-width: none;
}

.chip {
  padding: 0.5rem 1rem;
  background-color: var(--gray-100);
  border: 1px solid var(--gray-200);
  border-radius: 9999px;
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-700);
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
}

.chip:hover {
  background-color: var(--gray-200);
}

.chip.active {
  background-color: var(--primary-600);
  border-color: var(--primary-600);
  color: white;
}

.chip-count {
  margin-left: var(--space-1);
  padding: 0.125rem 0.375rem;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 9999px;
  font-size: var(--text-xs);
}
```

### 6. Stats Widget

```css
.stats-widget {
  background-color: white;
  border-radius: 0.75rem;
  padding: var(--space-4);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--gray-200);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: all 0.2s;
}

.stats-widget:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.stats-icon-wrapper {
  width: 56px;
  height: 56px;
  border-radius: 0.75rem;
  background-color: var(--primary-50);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.stats-icon {
  width: 32px;
  height: 32px;
  color: var(--primary-600);
}

.stats-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: var(--primary-600);
  color: white;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 20px;
}

.stats-value {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
}

.stats-label {
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  color: var(--gray-600);
}
```

### 7. Bottom Navigation (Mobile)

```css
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-top: 1px solid var(--gray-200);
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
  z-index: 50;
}

.bottom-nav-list {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 0.5rem 0;
}

.bottom-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem 1rem;
  color: var(--gray-500);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
}

.bottom-nav-item:hover {
  color: var(--gray-700);
}

.bottom-nav-item.active {
  color: var(--primary-600);
}

.bottom-nav-icon {
  width: 24px;
  height: 24px;
}

.bottom-nav-label {
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.bottom-nav-badge {
  position: absolute;
  top: 0.25rem;
  right: 0.5rem;
  background-color: var(--error-500);
  color: white;
  font-size: 10px;
  font-weight: var(--font-bold);
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 16px;
  text-align: center;
}
```

### 8. Don't Forget Section

```css
.dont-forget-section {
  background: linear-gradient(135deg, #FFF7ED 0%, #FEF3C7 100%);
  border-radius: 0.75rem;
  padding: var(--space-4);
  margin-top: var(--space-6);
  border: 1px solid var(--warning-200);
}

.dont-forget-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-3);
}

.dont-forget-title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--gray-900);
}

.dont-forget-icon {
  width: 24px;
  height: 24px;
  color: var(--warning-600);
}

.dont-forget-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.dont-forget-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: var(--text-sm);
  color: var(--gray-700);
}

.dont-forget-bullet {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--warning-600);
  flex-shrink: 0;
}
```

### 9. Floating Action Button (FAB)

```css
.fab {
  position: fixed;
  bottom: 88px;  /* Above bottom nav on mobile */
  right: 1rem;
  width: 56px;
  height: 56px;
  background-color: var(--primary-600);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.2s;
  z-index: 40;
}

.fab:hover {
  background-color: var(--primary-700);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  transform: scale(1.05);
}

.fab:active {
  transform: scale(0.95);
}

.fab-icon {
  width: 24px;
  height: 24px;
}
```

### 10. Header / Page Title Section

```css
.page-header {
  padding: var(--space-6) var(--space-4);
  background: linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%);
  border-bottom: 1px solid var(--gray-200);
}

.page-title-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.page-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
}

.page-subtitle {
  font-size: var(--text-base);
  color: var(--gray-600);
  margin-top: var(--space-1);
}

.page-header-actions {
  display: flex;
  gap: var(--space-2);
}

/* Greeting Section (Dashboard) */
.greeting-section {
  padding: var(--space-6) var(--space-4);
  background: linear-gradient(135deg, #E0F2F1 0%, #B2DFDB 100%);
  position: relative;
  overflow: hidden;
}

.greeting-content {
  position: relative;
  z-index: 10;
}

.greeting-title {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--gray-900);
  margin-bottom: var(--space-2);
}

.greeting-subtitle {
  font-size: var(--text-lg);
  color: var(--gray-700);
  margin-bottom: var(--space-4);
}

.greeting-illustration {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  height: 200px;
  opacity: 0.5;
  z-index: 1;
}
```

---

## Icons & Imagery

### Icon Library

Use **Lucide Icons** or **Heroicons** for consistency.

**Common Icons:**
- Home: `Home`
- Clients: `Users`
- Animals/Pets: `PawPrint`
- Schedule: `Calendar`
- More: `MoreHorizontal`
- Search: `Search`
- Voice: `Mic`
- Notification: `Bell`
- Settings: `Settings`
- Add: `Plus`
- Edit: `Pencil`
- Delete: `Trash2`
- View: `Eye`
- Message: `MessageSquare`
- Phone: `Phone`
- Email: `Mail`
- Revenue: `DollarSign`
- Clinic: `Building2`
- Livestock: `Tractor`

### Icon Sizes

```css
--icon-xs:  16px;  /* Small badges, inline text */
--icon-sm:  20px;  /* Buttons, tabs */
--icon-md:  24px;  /* Navigation, headers */
--icon-lg:  32px;  /* Stats widgets */
--icon-xl:  48px;  /* Large feature icons */
```

### Images

**Animal Photos:**
- Aspect ratio: 1:1 (square)
- Border radius: 8px
- Sizes: 56px (cards), 80px (details), 120px (profile)

**Clinic Logos:**
- Aspect ratio: 1:1
- Border radius: 8px
- Sizes: 48px (cards), 64px (headers)

**Illustrations:**
- Use soft, pastel-colored illustrations for empty states and hero sections
- Style: Friendly, approachable, veterinary-themed

---

## Interaction Patterns

### 1. Navigation

**Mobile:**
- Bottom tab bar (5 items max)
- Active state: Color change + icon weight change
- Badge notifications on icons

**Desktop:**
- Sidebar navigation (persistent)
- Top bar with organization switcher, search, notifications, profile
- Breadcrumbs for deep navigation

### 2. Actions

**Primary Actions:**
- Use primary green buttons
- Placed at bottom-right or top-right of sections
- Labels: "View", "Message", "Add New", "Settle", "Save"

**Secondary Actions:**
- Icon buttons (Edit, Delete, More)
- Dropdowns for multiple options

**Destructive Actions:**
- Use red/error color
- Require confirmation dialogs

### 3. Feedback

**Success:**
- Toast notification (top-right, 3s duration)
- Green checkmark icon

**Error:**
- Toast notification (top-right, 5s duration)
- Red X icon
- Inline form errors (below fields)

**Loading:**
- Skeleton screens for initial load
- Spinners for actions (button-level)
- Progress bars for multi-step processes

### 4. Forms

**Input Fields:**
- Labels above fields
- Placeholder text for examples
- Error messages below fields (red text + icon)
- Success indicators (green checkmark)

**Required Fields:**
- Asterisk (*) in label
- Validation on blur or submit

**Multi-step Forms:**
- Progress indicator at top
- Back/Next buttons at bottom
- Auto-save drafts

---

## Responsive Breakpoints

```css
/* Mobile First */
@media (min-width: 640px) {  /* sm: Small tablets */
  /* Adjust spacing, 2-column grids */
}

@media (min-width: 768px) {  /* md: Tablets */
  /* 2-3 column grids, show more info per card */
}

@media (min-width: 1024px) { /* lg: Small desktops */
  /* 3-4 column grids, sidebar navigation */
}

@media (min-width: 1280px) { /* xl: Large desktops */
  /* Max width containers, more spacing */
}

@media (min-width: 1536px) { /* 2xl: Extra large */
  /* Wider containers, dashboard layouts */
}
```

### Layout Adjustments

**Mobile (< 768px):**
- Single column layouts
- Bottom tab navigation
- Stacked cards
- Hamburger menu for secondary nav

**Tablet (768px - 1023px):**
- 2-column grids
- Side drawer navigation (collapsible)
- Larger touch targets

**Desktop (1024px+):**
- 3-4 column grids
- Persistent sidebar navigation
- Hover states prominent
- Keyboard shortcuts enabled

---

## Accessibility

### 1. Color Contrast

- Text on light backgrounds: Minimum contrast ratio 4.5:1 (WCAG AA)
- Large text (18px+): Minimum 3:1
- Interactive elements: 3:1 against background

### 2. Focus States

```css
.focusable:focus {
  outline: 2px solid var(--primary-500);
  outline-offset: 2px;
}

.focusable:focus:not(:focus-visible) {
  outline: none;
}
```

### 3. Keyboard Navigation

- All interactive elements must be keyboard accessible
- Logical tab order
- Escape key closes modals/dropdowns
- Enter key submits forms

### 4. Screen Readers

- Use semantic HTML (`<nav>`, `<main>`, `<article>`, etc.)
- `aria-label` for icon-only buttons
- `alt` text for all images
- `role` attributes where appropriate

### 5. Touch Targets

- Minimum size: 44x44px (iOS), 48x48px (Android)
- Adequate spacing between targets (8px minimum)

---

## Motion & Animation

### 1. Transitions

```css
/* Standard transition */
transition: all 0.2s ease-in-out;

/* Color transitions */
transition: color 0.15s ease;

/* Transform transitions */
transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
```

### 2. Hover Effects

- Scale: `transform: scale(1.02)` for cards
- Shadow lift: Increase box-shadow
- Color shift: Darken/lighten by 10%

### 3. Loading States

- Skeleton screens with shimmer effect
- Button spinners (disable button during load)
- Progress bars for uploads

### 4. Page Transitions

- Fade in: New pages fade in (200ms)
- Slide in: Modals slide up from bottom (300ms)
- No animations for users with `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Notes

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Icons**: Lucide Icons
- **Forms**: React Hook Form + Zod
- **State**: TanStack Query + Zustand

### File Structure

```
components/
├── ui/              # shadcn/ui primitives
├── layout/          # Headers, sidebars, navigation
├── cards/           # Card components
├── forms/           # Form components
├── feedback/        # Toasts, alerts, modals
└── domain/          # Feature-specific components
```

### Naming Conventions

- Components: PascalCase (`ClinicCard.tsx`)
- CSS classes: kebab-case (`.clinic-card`)
- Variables: camelCase (`primaryColor`)
- Files: kebab-case (`clinic-card.tsx`)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | Feb 9, 2026 | Initial design guide based on mobile designs |

---

**Next Steps:**
1. Implement design system in Tailwind config
2. Build component library with Storybook
3. Create responsive layout templates
4. Document accessibility testing results
