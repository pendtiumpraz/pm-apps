# 🎨 FRONTEND REQUIREMENTS - ProjectHub

## 📋 Overview

Dokumen ini berisi spesifikasi lengkap untuk frontend ProjectHub termasuk:
- Design System (Colors, Typography, Spacing)
- Component Library
- Page Layouts
- Animations & Interactions
- Responsive Design

---

## 🎨 DESIGN SYSTEM

### Color Palette

```scss
// ===========================================
// PRIMARY COLORS
// ===========================================
$primary-50:  #EEF2FF;   // Lightest - backgrounds
$primary-100: #E0E7FF;   // Light hover
$primary-200: #C7D2FE;   // Light active
$primary-300: #A5B4FC;   // Borders
$primary-400: #818CF8;   // Icons
$primary-500: #6366F1;   // Primary buttons - MAIN
$primary-600: #4F46E5;   // Primary hover
$primary-700: #4338CA;   // Primary active
$primary-800: #3730A3;   // Dark elements
$primary-900: #312E81;   // Darkest

// ===========================================
// NEUTRAL COLORS (Dark Theme Base)
// ===========================================
$gray-50:  #FAFAFA;      // Light text on dark
$gray-100: #F4F4F5;      
$gray-200: #E4E4E7;      // Borders light
$gray-300: #D4D4D8;      
$gray-400: #A1A1AA;      // Muted text
$gray-500: #71717A;      // Secondary text
$gray-600: #52525B;      
$gray-700: #3F3F46;      // Card borders
$gray-800: #27272A;      // Card backgrounds
$gray-900: #18181B;      // Main background
$gray-950: #09090B;      // Darkest - sidebar

// ===========================================
// SEMANTIC COLORS
// ===========================================
// Success
$success-50:  #ECFDF5;
$success-100: #D1FAE5;
$success-500: #10B981;   // Main
$success-600: #059669;

// Warning  
$warning-50:  #FFFBEB;
$warning-100: #FEF3C7;
$warning-500: #F59E0B;   // Main
$warning-600: #D97706;

// Error/Danger
$error-50:  #FEF2F2;
$error-100: #FEE2E2;
$error-500: #EF4444;     // Main
$error-600: #DC2626;

// Info
$info-50:  #EFF6FF;
$info-100: #DBEAFE;
$info-500: #3B82F6;      // Main
$info-600: #2563EB;

// ===========================================
// PROJECT STATUS COLORS
// ===========================================
$status-planning:  #8B5CF6;   // Purple
$status-active:    #10B981;   // Green
$status-on-hold:   #F59E0B;   // Yellow
$status-review:    #3B82F6;   // Blue
$status-completed: #6B7280;   // Gray
$status-cancelled: #EF4444;   // Red

// ===========================================
// PRIORITY COLORS
// ===========================================
$priority-urgent: #EF4444;    // Red
$priority-high:   #F59E0B;    // Orange
$priority-medium: #3B82F6;    // Blue
$priority-low:    #6B7280;    // Gray

// ===========================================
// PAYMENT STATUS COLORS
// ===========================================
$payment-pending:   #F59E0B;  // Yellow
$payment-paid:      #10B981;  // Green
$payment-overdue:   #EF4444;  // Red
$payment-partial:   #3B82F6;  // Blue

// ===========================================
// GRADIENTS
// ===========================================
$gradient-primary: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%);
$gradient-success: linear-gradient(135deg, #10B981 0%, #34D399 100%);
$gradient-warning: linear-gradient(135deg, #F59E0B 0%, #FBBF24 100%);
$gradient-danger:  linear-gradient(135deg, #EF4444 0%, #F87171 100%);
$gradient-dark:    linear-gradient(180deg, #18181B 0%, #09090B 100%);
$gradient-card:    linear-gradient(145deg, #27272A 0%, #1F1F23 100%);

// ===========================================
// GLASSMORPHISM
// ===========================================
$glass-bg: rgba(39, 39, 42, 0.7);
$glass-border: rgba(255, 255, 255, 0.1);
$glass-blur: blur(12px);
```

### Typography

```scss
// ===========================================
// FONT FAMILY
// ===========================================
$font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
$font-mono: 'JetBrains Mono', 'Fira Code', monospace;

// ===========================================
// FONT SIZES
// ===========================================
$text-xs:   0.75rem;    // 12px
$text-sm:   0.875rem;   // 14px
$text-base: 1rem;       // 16px
$text-lg:   1.125rem;   // 18px
$text-xl:   1.25rem;    // 20px
$text-2xl:  1.5rem;     // 24px
$text-3xl:  1.875rem;   // 30px
$text-4xl:  2.25rem;    // 36px
$text-5xl:  3rem;       // 48px

// ===========================================
// FONT WEIGHTS
// ===========================================
$font-light:    300;
$font-normal:   400;
$font-medium:   500;
$font-semibold: 600;
$font-bold:     700;

// ===========================================
// LINE HEIGHTS
// ===========================================
$leading-none:    1;
$leading-tight:   1.25;
$leading-snug:    1.375;
$leading-normal:  1.5;
$leading-relaxed: 1.625;
$leading-loose:   2;
```

### Spacing System

```scss
// ===========================================
// SPACING SCALE (4px base)
// ===========================================
$space-0:   0;
$space-1:   0.25rem;   // 4px
$space-2:   0.5rem;    // 8px
$space-3:   0.75rem;   // 12px
$space-4:   1rem;      // 16px
$space-5:   1.25rem;   // 20px
$space-6:   1.5rem;    // 24px
$space-8:   2rem;      // 32px
$space-10:  2.5rem;    // 40px
$space-12:  3rem;      // 48px
$space-16:  4rem;      // 64px
$space-20:  5rem;      // 80px
$space-24:  6rem;      // 96px
```

### Border Radius

```scss
$rounded-none: 0;
$rounded-sm:   0.125rem;  // 2px
$rounded:      0.25rem;   // 4px
$rounded-md:   0.375rem;  // 6px
$rounded-lg:   0.5rem;    // 8px
$rounded-xl:   0.75rem;   // 12px
$rounded-2xl:  1rem;      // 16px
$rounded-3xl:  1.5rem;    // 24px
$rounded-full: 9999px;
```

### Shadows

```scss
// ===========================================
// BOX SHADOWS (Dark theme optimized)
// ===========================================
$shadow-sm:   0 1px 2px 0 rgba(0, 0, 0, 0.3);
$shadow:      0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4);
$shadow-md:   0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4);
$shadow-lg:   0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4);
$shadow-xl:   0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
$shadow-2xl:  0 25px 50px -12px rgba(0, 0, 0, 0.6);

// Glow effects
$shadow-glow-primary: 0 0 20px rgba(99, 102, 241, 0.3);
$shadow-glow-success: 0 0 20px rgba(16, 185, 129, 0.3);
$shadow-glow-warning: 0 0 20px rgba(245, 158, 11, 0.3);
$shadow-glow-danger:  0 0 20px rgba(239, 68, 68, 0.3);
```

---

## 🖼️ LAYOUT STRUCTURE

### Main Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ NAVBAR (Height: 64px, Fixed Top)                                              │
│ ┌────────────────────────────────────────────────────────────────────────────┐│
│ │ [☰] ProjectHub        🔍 Search...        [🔔] [📅] [👤 User ▾]           ││
│ └────────────────────────────────────────────────────────────────────────────┘│
├──────────────┬───────────────────────────────────────────────────────────────┤
│ SIDEBAR      │ MAIN CONTENT                                                   │
│ Width: 260px │                                                                │
│ Fixed Left   │ ┌─────────────────────────────────────────────────────────────┐│
│              │ │ Page Header + Breadcrumb                                    ││
│ ┌──────────┐ │ └─────────────────────────────────────────────────────────────┘│
│ │ 📊 Dash  │ │                                                                │
│ │ 📁 Proj  │ │ ┌─────────────────────────────────────────────────────────────┐│
│ │ ✅ Tasks │ │ │                                                             ││
│ │ 💰 Fin   │ │ │                    CONTENT AREA                             ││
│ │ 🌐 Assets│ │ │                                                             ││
│ │ 📆 Cal   │ │ │                                                             ││
│ │ ⚙️ Set   │ │ │                                                             ││
│ └──────────┘ │ └─────────────────────────────────────────────────────────────┘│
│              │                                                                │
│   ─────────  │                                                 ┌─────────────┐│
│   PROJECTS   │                                                 │ RIGHT PANEL ││
│   ─────────  │                                                 │ (Modal/Form)││
│ • Lembata NTT│                                                 │ Width: 480px││
│ • Dobeon     │                                                 │             ││
│ • SIAKAD     │                                                 │             ││
│ • PIS Jimbe  │                                                 │             ││
│ + Add New    │                                                 └─────────────┘│
└──────────────┴───────────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints

```scss
$breakpoint-sm:  640px;   // Mobile landscape
$breakpoint-md:  768px;   // Tablet portrait
$breakpoint-lg:  1024px;  // Tablet landscape / Small desktop
$breakpoint-xl:  1280px;  // Desktop
$breakpoint-2xl: 1536px;  // Large desktop
```

---

## 🧩 COMPONENT SPECIFICATIONS

### 1. Navbar

```tsx
// Height: 64px
// Position: Fixed top
// Background: $gray-950 with glass effect
// Border bottom: 1px solid $gray-800

interface NavbarProps {
  user: User;
  notifications: Notification[];
  onMenuToggle: () => void;
}
```

**Elements:**
| Element | Specification |
|---------|---------------|
| Logo | SVG icon + "ProjectHub" text, font-semibold, text-xl |
| Hamburger | Mobile only, toggles sidebar |
| Search | Width 320px, rounded-lg, bg-gray-800, placeholder text |
| Notifications | Icon button with badge, dropdown on click |
| Calendar | Icon button, opens calendar modal |
| User Menu | Avatar + name, dropdown with profile/settings/logout |

**Interactions:**
- Search: Focus expands width, shows search suggestions
- Notifications: Badge shows unread count (max 99+)
- User dropdown: Fade in 150ms, arrow indicator

### 2. Sidebar

```tsx
// Width: 260px (desktop), full width (mobile overlay)
// Position: Fixed left
// Background: $gray-950
// Collapsible to 72px (icon only mode)

interface SidebarProps {
  isCollapsed: boolean;
  activeRoute: string;
  projects: Project[];
  onCollapse: () => void;
}
```

**Menu Items:**
| Icon | Label | Route |
|------|-------|-------|
| 📊 LayoutDashboard | Dashboard | /dashboard |
| 📁 FolderKanban | Projects | /projects |
| ✅ CheckSquare | Tasks | /tasks |
| 💰 Wallet | Finance | /finance |
| 🌐 Globe | Assets | /assets |
| 📄 FileText | Invoices | /invoices |
| 📆 Calendar | Calendar | /calendar |
| 📈 BarChart3 | Analytics | /analytics |
| ⚙️ Settings | Settings | /settings |

**Project Quick Access Section:**
- Shows top 5 active projects
- Color dot indicator for status
- Click to go to project detail
- "View All" link at bottom

**Interactions:**
- Hover: bg-gray-800, slight left border glow
- Active: bg-primary-500/10, left border primary-500
- Collapse: Smooth width transition 200ms
- Project dot: Pulse animation if deadline near

### 3. Cards

#### Project Card
```tsx
interface ProjectCardProps {
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
}

// Dimensions
// Min width: 320px
// Padding: 20px
// Border radius: 12px
// Background: $gradient-card
// Border: 1px solid $gray-700
```

**Layout:**
```
┌─────────────────────────────────────────────┐
│ [●] Project Name                    [⋮ Menu]│
│ Client Name • Stack                          │
├─────────────────────────────────────────────┤
│ Progress ████████████░░░░░ 75%              │
├─────────────────────────────────────────────┤
│ 📅 Dec 15, 2024        💰 Rp 15.000.000     │
│ ⏱️ 5 days left         💵 Rp 7.500.000 paid │
├─────────────────────────────────────────────┤
│ [🔵 Active] [3 Tasks] [2 Payments]          │
└─────────────────────────────────────────────┘
```

**Hover Effects:**
- Transform: translateY(-4px)
- Shadow: shadow-xl + glow based on status
- Border: brighten to gray-600
- Transition: 200ms ease-out

**Drag & Drop:**
- Cursor: grab → grabbing
- Opacity: 0.8 when dragging
- Drop zone: dashed border, bg highlight
- Placeholder: Same size, dotted border

#### Stats Card
```tsx
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number; // +/- percentage
  icon: LucideIcon;
  trend: 'up' | 'down' | 'neutral';
}
```

**Layout:**
```
┌─────────────────────────────────┐
│ [📊]                            │
│                                 │
│ Total Revenue                   │
│ Rp 125.000.000        ↑ +12%   │
│ ━━━━━━━━ Sparkline ━━━━━━━━━━  │
└─────────────────────────────────┘
```

### 4. Buttons

```scss
// Base styles
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-weight: 500;
  border-radius: $rounded-lg;
  transition: all 150ms ease;
  
  // Sizes
  &-sm { height: 32px; padding: 0 12px; font-size: 14px; }
  &-md { height: 40px; padding: 0 16px; font-size: 14px; }
  &-lg { height: 48px; padding: 0 24px; font-size: 16px; }
}
```

**Variants:**
| Variant | Background | Text | Hover | Active |
|---------|------------|------|-------|--------|
| Primary | $primary-500 | white | $primary-600 | $primary-700 |
| Secondary | $gray-800 | $gray-100 | $gray-700 | $gray-600 |
| Outline | transparent | $primary-500 | $primary-500/10 | $primary-500/20 |
| Ghost | transparent | $gray-300 | $gray-800 | $gray-700 |
| Danger | $error-500 | white | $error-600 | $error-700 |
| Success | $success-500 | white | $success-600 | $success-700 |

**Interactions:**
- Hover: Slight scale(1.02), shadow
- Active: scale(0.98)
- Disabled: opacity 0.5, cursor not-allowed
- Loading: Spinner icon, text "Loading..."

### 5. Form Inputs

```scss
.input {
  height: 40px;
  padding: 0 12px;
  background: $gray-800;
  border: 1px solid $gray-700;
  border-radius: $rounded-lg;
  color: $gray-100;
  font-size: 14px;
  transition: all 150ms ease;
  
  &:hover {
    border-color: $gray-600;
  }
  
  &:focus {
    outline: none;
    border-color: $primary-500;
    box-shadow: 0 0 0 3px rgba($primary-500, 0.2);
  }
  
  &::placeholder {
    color: $gray-500;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &.error {
    border-color: $error-500;
    &:focus {
      box-shadow: 0 0 0 3px rgba($error-500, 0.2);
    }
  }
}
```

### 6. Right Panel (Slide-over Modal)

```tsx
interface RightPanelProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: 'sm' | 'md' | 'lg'; // 400px, 480px, 640px
}
```

**Specifications:**
```
// Position: Fixed right
// Width: 480px (default)
// Height: 100vh - navbar height
// Background: $gray-900
// Border left: 1px solid $gray-800
// Shadow: shadow-2xl

// Animation:
// Enter: translateX(100%) → translateX(0), 300ms ease-out
// Exit: translateX(0) → translateX(100%), 200ms ease-in
// Backdrop: opacity 0 → 0.5, 200ms
```

**Layout:**
```
┌─────────────────────────────────────────────┐
│ HEADER                            [✕ Close] │
│ Create New Project                          │
├─────────────────────────────────────────────┤
│                                             │
│ FORM CONTENT (Scrollable)                   │
│                                             │
│ Project Name *                              │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Client Name                                 │
│ ┌─────────────────────────────────────────┐ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ ... more fields ...                         │
│                                             │
├─────────────────────────────────────────────┤
│ FOOTER (Sticky)                             │
│            [Cancel]  [Save Project]         │
└─────────────────────────────────────────────┘
```

### 7. Data Table

```tsx
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
  isLoading?: boolean;
  emptyMessage?: string;
}
```

**Specifications:**
- Header: bg-gray-800, font-medium, text-gray-400
- Rows: border-b border-gray-800
- Row hover: bg-gray-800/50
- Alternating: Subtle zebra striping
- Sorting: Arrow indicators, click to toggle

### 8. Status Badge

```tsx
interface BadgeProps {
  status: 'planning' | 'active' | 'on-hold' | 'review' | 'completed' | 'cancelled';
  size?: 'sm' | 'md';
}
```

**Styles:**
| Status | Background | Text | Dot Color |
|--------|------------|------|-----------|
| Planning | purple-500/10 | purple-400 | purple-500 |
| Active | green-500/10 | green-400 | green-500 (pulse) |
| On Hold | yellow-500/10 | yellow-400 | yellow-500 |
| Review | blue-500/10 | blue-400 | blue-500 |
| Completed | gray-500/10 | gray-400 | gray-500 |
| Cancelled | red-500/10 | red-400 | red-500 |

### 9. Progress Bar

```tsx
interface ProgressBarProps {
  value: number; // 0-100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'striped';
}
```

**Animation:**
- Initial render: Width 0 → actual value, 500ms ease-out
- Value change: Smooth transition 300ms
- Striped: Moving diagonal stripes animation

### 10. Toast Notifications

```tsx
interface ToastProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number; // default 5000ms
  action?: { label: string; onClick: () => void };
}
```

**Position:** Bottom-right, stacked
**Animation:** 
- Enter: slideInRight + fadeIn, 200ms
- Exit: slideOutRight + fadeOut, 150ms
- Progress bar at bottom showing remaining time

---

## 📱 PAGE SPECIFICATIONS

### 1. Dashboard Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Welcome back, [Name]! 👋                                                     │
│ Here's what's happening with your projects today.                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ Total Proj   │ │ Active Tasks │ │ This Month   │ │ Pending Pay  │        │
│ │     8        │ │     23       │ │ Rp 45.5jt    │ │ Rp 28.0jt    │        │
│ │   ↑ +2       │ │   ↓ -5       │ │   ↑ +15%     │ │   3 invoices │        │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ⚠️ ALERTS & REMINDERS                                                       │
│ ┌───────────────────────────────────────────────────────────────────────┐  │
│ │ 🔴 Deadline: SIAKAD Al Fatih - 3 days left!                           │  │
│ │ 🟡 Domain: pondokimamsyafii.id expires in 15 days                     │  │
│ │ 🟢 Payment received: Rp 5.000.000 from Pak Ayubi                      │  │
│ └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
├─────────────────────────────────────┬───────────────────────────────────────┤
│ 📊 PROJECT OVERVIEW                 │ 📅 UPCOMING DEADLINES                 │
│ (Drag & drop Kanban/List view)      │                                       │
│                                     │ Dec 5  - SIAKAD Al Fatih             │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │ Dec 10 - Lembata NTT                  │
│ │Plan │ │ Act │ │Hold │ │Done │   │ Dec 15 - Dobeon Tech                  │
│ │  2  │ │  4  │ │  1  │ │  1  │   │ Dec 20 - PIS Jimbe                    │
│ └─────┘ └─────┘ └─────┘ └─────┘   │                                       │
│                                     │                                       │
├─────────────────────────────────────┼───────────────────────────────────────┤
│ 💰 REVENUE THIS MONTH               │ 📈 INCOME TREND                       │
│                                     │                                       │
│ Client Projects: Rp 35.000.000      │     ╭────────╮                        │
│ SaaS Revenue:    Rp  5.500.000      │    ╱          ╲                       │
│ Maintenance:     Rp  5.000.000      │   ╱            ╲__                    │
│ ─────────────────────────────       │ _╱                                    │
│ Total:           Rp 45.500.000      │ Jan Feb Mar Apr May Jun               │
└─────────────────────────────────────┴───────────────────────────────────────┘
```

### 2. Projects Page (Main CRUD)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Projects                                           [+ New Project]           │
│ Manage all your client and personal projects                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ 🔍 Search projects...    [Filter ▾] [Sort ▾] [📊 Grid] [≡ List] [▦ Kanban] │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐    │
│ │ 🟢 Lembata NTT      │ │ 🟢 Dobeon Tech      │ │ 🟡 SIAKAD Al Fatih  │    │
│ │ Pak Ayubi           │ │ Pak Ayubi           │ │ STAI Client         │    │
│ │ Next.js • Vercel    │ │ Next.js • Vercel    │ │ Laravel • Domainesia│    │
│ │ ████████░░ 80%      │ │ █████░░░░░ 50%      │ │ ███░░░░░░░ 30%      │    │
│ │ Dec 10 • Rp 15jt    │ │ Dec 15 • Rp 20jt    │ │ Dec 5 • Rp 25jt     │    │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘    │
│                                                                             │
│ ┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐    │
│ │ 🟢 PIS Jimbe        │ │ 🔵 Voice AI         │ │ 🔵 Security AI      │    │
│ │ Personal            │ │ Personal            │ │ Personal            │    │
│ │ Next.js • Vercel    │ │ Python • Local      │ │ Python • TBD        │    │
│ │ ██████░░░░ 60%      │ │ ██░░░░░░░░ 20%      │ │ █░░░░░░░░░ 10%      │    │
│ │ Dec 20 • -          │ │ - • AI Product      │ │ - • MVP             │    │
│ └─────────────────────┘ └─────────────────────┘ └─────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**When clicking a project or "+ New Project":**
→ Right Panel slides in with form

### 3. Finance Page

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Finance Overview                                                            │
│ Track your income, payments, and financial health                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│ │ Total Value  │ │ Received     │ │ Pending      │ │ This Month   │        │
│ │ Rp 150jt     │ │ Rp 85jt      │ │ Rp 65jt      │ │ Rp 45.5jt    │        │
│ │ 8 projects   │ │ 56.7%        │ │ 5 invoices   │ │ ↑ +15%       │        │
│ └──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘        │
│                                                                             │
├───────────────────────────────────────┬─────────────────────────────────────┤
│ 💰 PAYMENT BREAKDOWN                  │ 📊 INCOME BY PROJECT                │
│                                       │                                     │
│ [DP] [Termin] [Cicilan] [SaaS] [All] │     PIE CHART                       │
│                                       │     ┌─────────┐                     │
│ ┌────────────────────────────────┐   │    /  SIAKAD   \                    │
│ │ SIAKAD Al Fatih                │   │   │  Rp 25jt   │                    │
│ │ DP - Rp 7.500.000 - Paid ✓     │   │   │   Dobeon   │                    │
│ │ Termin 1 - Rp 10jt - Pending   │   │    \  Rp 20jt /                     │
│ └────────────────────────────────┘   │     └─────────┘                     │
│                                       │                                     │
│ ┌────────────────────────────────┐   │                                     │
│ │ Voice AI (SaaS)                │   │                                     │
│ │ Monthly - Rp 500.000/mo        │   │                                     │
│ │ 3 subscribers                  │   │                                     │
│ └────────────────────────────────┘   │                                     │
└───────────────────────────────────────┴─────────────────────────────────────┘
```

### 4. Assets Page (Domain & Hosting)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Digital Assets                                     [+ Add Domain] [+ Host]  │
│ Track domains, hosting, and their expiry dates                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ [🌐 Domains] [🖥️ Hosting] [📦 Subscriptions]                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│ ⚠️ EXPIRING SOON                                                            │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ 🔴 pondokimamsyafii.id - Expires in 15 days - [Renew Now]               │ │
│ │ 🟡 siakad-alfatih.com - Expires in 45 days                              │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│ DOMAINS (8 total)                                                           │
│ ┌─────────────────────────────────────────────────────────────────────────┐ │
│ │ Domain              │ Project        │ Registrar   │ Expiry     │ Cost  │ │
│ ├─────────────────────────────────────────────────────────────────────────┤ │
│ │ pondokimamsyafii.id │ PIS Jimbe      │ Niagahoster │ Dec 15, 24 │ 150k  │ │
│ │ siakad-alfatih.com  │ SIAKAD         │ Domainesia  │ Jan 30, 25 │ 140k  │ │
│ │ dobeon.tech         │ Dobeon Tech    │ Cloudflare  │ Mar 15, 25 │ 120k  │ │
│ │ lembata-ntt.id      │ Lembata NTT    │ Niagahoster │ Apr 20, 25 │ 150k  │ │
│ └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ ANIMATIONS & INTERACTIONS

### Page Transitions

```css
/* Fade + slide up */
.page-enter {
  opacity: 0;
  transform: translateY(10px);
}
.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 200ms ease-out, transform 200ms ease-out;
}
.page-exit {
  opacity: 1;
}
.page-exit-active {
  opacity: 0;
  transition: opacity 150ms ease-in;
}
```

### Card Hover Effects

```css
.card {
  transition: transform 200ms ease-out, box-shadow 200ms ease-out;
}
.card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 20px 25px -5px rgba(0, 0, 0, 0.4),
    0 0 20px rgba(99, 102, 241, 0.15); /* Subtle glow */
}
```

### Button Click

```css
.btn {
  transition: transform 100ms ease;
}
.btn:active {
  transform: scale(0.97);
}
```

### Loading States

```css
/* Skeleton loading */
.skeleton {
  background: linear-gradient(
    90deg,
    $gray-800 0%,
    $gray-700 50%,
    $gray-800 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Spinner */
.spinner {
  border: 2px solid $gray-700;
  border-top-color: $primary-500;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

### Drag & Drop

```css
/* Dragging item */
.dragging {
  opacity: 0.8;
  transform: rotate(2deg) scale(1.02);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  cursor: grabbing;
}

/* Drop zone active */
.drop-zone-active {
  border: 2px dashed $primary-500;
  background: rgba($primary-500, 0.05);
}

/* Drop zone hover */
.drop-zone-hover {
  border-color: $primary-400;
  background: rgba($primary-500, 0.1);
}
```

### Notification Badge Pulse

```css
.badge-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

### Progress Bar Animation

```css
.progress-bar {
  transition: width 500ms ease-out;
}

.progress-bar-striped {
  background-image: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1) 25%,
    transparent 25%,
    transparent 50%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.1) 75%,
    transparent 75%
  );
  background-size: 1rem 1rem;
  animation: stripes 1s linear infinite;
}

@keyframes stripes {
  from { background-position: 1rem 0; }
  to { background-position: 0 0; }
}
```

### Modal/Panel Animations

```css
/* Right panel slide */
.panel-enter {
  transform: translateX(100%);
}
.panel-enter-active {
  transform: translateX(0);
  transition: transform 300ms cubic-bezier(0.16, 1, 0.3, 1);
}
.panel-exit-active {
  transform: translateX(100%);
  transition: transform 200ms ease-in;
}

/* Backdrop fade */
.backdrop-enter {
  opacity: 0;
}
.backdrop-enter-active {
  opacity: 1;
  transition: opacity 200ms ease;
}
.backdrop-exit-active {
  opacity: 0;
  transition: opacity 150ms ease;
}
```

### Toast Notifications

```css
.toast-enter {
  transform: translateX(100%);
  opacity: 0;
}
.toast-enter-active {
  transform: translateX(0);
  opacity: 1;
  transition: all 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-exit-active {
  transform: translateX(100%);
  opacity: 0;
  transition: all 150ms ease-in;
}
```

### Micro-interactions

```css
/* Checkbox check animation */
.checkbox-icon {
  transform: scale(0);
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
.checkbox-checked .checkbox-icon {
  transform: scale(1);
}

/* Switch toggle */
.switch-thumb {
  transition: transform 200ms cubic-bezier(0.16, 1, 0.3, 1);
}
.switch-checked .switch-thumb {
  transform: translateX(20px);
}

/* Dropdown open */
.dropdown-content {
  transform-origin: top;
  transform: scaleY(0.95);
  opacity: 0;
  transition: all 150ms ease;
}
.dropdown-open .dropdown-content {
  transform: scaleY(1);
  opacity: 1;
}

/* Menu item hover */
.menu-item {
  position: relative;
}
.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: $primary-500;
  transform: scaleY(0);
  transition: transform 150ms ease;
}
.menu-item:hover::before,
.menu-item.active::before {
  transform: scaleY(1);
}
```

---

## 🖱️ MOUSE INTERACTIONS

### Cursor States

| Element | Cursor |
|---------|--------|
| Button, Link | pointer |
| Disabled | not-allowed |
| Draggable | grab |
| Dragging | grabbing |
| Text input | text |
| Resize | ew-resize, ns-resize |
| Loading | wait / progress |

### Hover States

| Element | Effect |
|---------|--------|
| Card | Lift + shadow + glow |
| Button | Background darken + slight scale |
| Link | Underline + color change |
| Table row | Background highlight |
| Icon button | Background circle + scale |
| Menu item | Left border + background |

### Focus States

- All interactive elements MUST have visible focus states
- Focus ring: `box-shadow: 0 0 0 3px rgba($primary-500, 0.3)`
- Tab navigation should work logically

### Click Feedback

- Buttons: Scale down briefly (100ms)
- Cards: Brief shadow reduction
- Checkboxes: Bounce animation
- Toggles: Smooth slide

---

## 📐 RESPONSIVE BEHAVIOR

### Mobile (< 768px)
- Sidebar: Hidden, accessible via hamburger menu (overlay)
- Cards: Full width, stacked
- Table: Horizontal scroll or card view
- Right panel: Full screen modal
- Navbar: Simplified, search in expandable

### Tablet (768px - 1024px)
- Sidebar: Collapsed (icon only), expand on hover
- Cards: 2 columns
- Right panel: 70% width

### Desktop (> 1024px)
- Full layout as designed
- Sidebar: Expanded by default
- Cards: 3-4 columns
- Right panel: 480px fixed

---

## 🔌 REQUIRED DEPENDENCIES

```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "next-auth": "^5.0.0-beta",
    "prisma": "^5.6.0",
    "@prisma/client": "^5.6.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.48.0",
    "@hookform/resolvers": "^3.3.0",
    "date-fns": "^2.30.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "framer-motion": "^10.16.0",
    "@dnd-kit/core": "^6.1.0",
    "@dnd-kit/sortable": "^8.0.0",
    "recharts": "^2.10.0",
    "react-hot-toast": "^2.4.0"
  },
  "devDependencies": {
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "typescript": "^5.3.0",
    "@types/react": "^18.2.0",
    "@types/node": "^20.10.0"
  }
}
```

---

## 📝 NOTES

1. **Dark Mode First** - Ini dark theme by default, light mode bisa ditambahkan nanti
2. **Performance** - Gunakan React Query untuk caching, lazy loading untuk routes
3. **Accessibility** - Pastikan contrast ratio, focus states, keyboard navigation
4. **Mobile First CSS** - Tulis mobile styles dulu, lalu override untuk desktop
5. **Component Library** - Bisa pakai shadcn/ui sebagai base, customize sesuai design system
