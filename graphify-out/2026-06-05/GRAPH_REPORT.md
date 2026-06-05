# Graph Report - .  (2026-06-05)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 410 nodes · 759 edges · 41 communities (22 shown, 19 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b25ab8be`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Admin Dashboard UI|Admin Dashboard UI]]
- [[_COMMUNITY_Admin API & Lists|Admin API & Lists]]
- [[_COMMUNITY_Admin Auth Middleware|Admin Auth Middleware]]
- [[_COMMUNITY_Dependencies & Scripts|Dependencies & Scripts]]
- [[_COMMUNITY_Database Models|Database Models]]
- [[_COMMUNITY_Package Config|Package Config]]
- [[_COMMUNITY_TypeScript Config|TypeScript Config]]
- [[_COMMUNITY_Project Domain Hosting API|Project Domain Hosting API]]
- [[_COMMUNITY_Admin Registration API|Admin Registration API]]
- [[_COMMUNITY_Auth Pages & Routes|Auth Pages & Routes]]
- [[_COMMUNITY_Invoice API|Invoice API]]
- [[_COMMUNITY_Payment API|Payment API]]
- [[_COMMUNITY_Project API|Project API]]
- [[_COMMUNITY_Task API|Task API]]
- [[_COMMUNITY_App Layout & Providers|App Layout & Providers]]
- [[_COMMUNITY_Project Requirements|Project Requirements]]
- [[_COMMUNITY_Admin Verification Routes|Admin Verification Routes]]
- [[_COMMUNITY_Best AI Page|Best AI Page]]
- [[_COMMUNITY_Development Phases|Development Phases]]
- [[_COMMUNITY_Default Platforms API|Default Platforms API]]
- [[_COMMUNITY_Seed Best Lists|Seed Best Lists]]
- [[_COMMUNITY_Seed Tools|Seed Tools]]
- [[_COMMUNITY_Admin Update Delete Routes|Admin Update Delete Routes]]
- [[_COMMUNITY_Admin Read Route|Admin Read Route]]
- [[_COMMUNITY_Admin Read Route|Admin Read Route]]
- [[_COMMUNITY_ESLint Config|ESLint Config]]
- [[_COMMUNITY_Best AI Models|Best AI Models]]
- [[_COMMUNITY_Best CLI Models|Best CLI Models]]
- [[_COMMUNITY_Best IDE Models|Best IDE Models]]
- [[_COMMUNITY_Best Orchestrator Models|Best Orchestrator Models]]
- [[_COMMUNITY_Right Panel Slide-over|Right Panel Slide-over]]
- [[_COMMUNITY_Next.js Logo|Next.js Logo]]
- [[_COMMUNITY_API Route Exports|API Route Exports]]
- [[_COMMUNITY_Vercel Logo|Vercel Logo]]

## God Nodes (most connected - your core abstractions)
1. `requireAdmin()` - 27 edges
2. `cn()` - 26 edges
3. `Button` - 20 edges
4. `Input` - 17 edges
5. `formatDate()` - 16 edges
6. `formatCurrency()` - 15 edges
7. `compilerOptions` - 15 edges
8. `Project Model` - 13 edges
9. `getDaysUntil()` - 11 edges
10. `Badge()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `DashboardPage()` --references--> `Navbar Component Spec`  [EXTRACTED]
  src/app/(dashboard)/dashboard/page.tsx → docs/FRONTEND_REQUIREMENTS.md
- `DashboardPage()` --references--> `Sidebar Component Spec`  [EXTRACTED]
  src/app/(dashboard)/dashboard/page.tsx → docs/FRONTEND_REQUIREMENTS.md
- `AI Tools Features Requirements` --conceptually_related_to--> `Backend Requirements`  [INFERRED]
  NEW-REQUIREMENTS.md → docs/BACKEND_REQUIREMENTS.md
- `ToolCategory Model` --references--> `User Model`  [EXTRACTED]
  NEW-REQUIREMENTS.md → docs/BACKEND_REQUIREMENTS.md
- `AdminUsersPage()` --calls--> `formatDate()`  [EXTRACTED]
  src/app/admin/users/page.tsx → src/lib/utils.ts

## Import Cycles
- None detected.

## Communities (41 total, 19 thin omitted)

### Community 0 - "Admin Dashboard UI"
Cohesion: 0.08
Nodes (39): adminMenuItems, AnalyticsPage(), COLORS, CalendarEvent, categoryStyles, DraggableCard(), KanbanCardContent(), KanbanColumn() (+31 more)

### Community 1 - "Admin API & Lists"
Cohesion: 0.07
Nodes (30): listConfig, ListType, DomainForm(), DomainFormProps, HostingFormProps, PaymentFormProps, PROJECT_COLORS, ProjectForm() (+22 more)

### Community 2 - "Admin Auth Middleware"
Cohesion: 0.10
Nodes (17): POST(), POST(), POST(), POST(), getAdminSession(), requireAdmin(), DELETE(), PUT() (+9 more)

### Community 3 - "Dependencies & Scripts"
Cohesion: 0.07
Nodes (24): prisma, dependencies, @auth/prisma-adapter, bcryptjs, clsx, date-fns, @dnd-kit/core, @dnd-kit/sortable (+16 more)

### Community 4 - "Database Models"
Cohesion: 0.16
Nodes (21): Account Model, Activity Model, Domain Model, Hosting Model, Income Model, Invoice Model, Payment Model, Project Model (+13 more)

### Community 5 - "Package Config"
Cohesion: 0.10
Nodes (19): devDependencies, eslint, eslint-config-next, postcss, prisma, tailwindcss, @types/bcryptjs, @types/node (+11 more)

### Community 6 - "TypeScript Config"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 7 - "Project Domain Hosting API"
Cohesion: 0.14
Nodes (3): domainSchema, hostingSchema, InvoiceInput

### Community 8 - "Admin Registration API"
Cohesion: 0.14
Nodes (4): globalForPrisma, registerSchema, checkAdmin(), GET()

### Community 9 - "Auth Pages & Routes"
Cohesion: 0.14
Nodes (3): { handlers, auth, signIn, signOut }, checkAdmin(), GET()

### Community 10 - "Invoice API"
Cohesion: 0.25
Nodes (3): POST(), generateInvoiceNumber(), invoiceSchema

### Community 15 - "Project Requirements"
Cohesion: 0.29
Nodes (7): Backend Requirements, Button Component, Development Flow, Design System, Frontend Requirements, AI Tools Features Requirements, ProjectHub

### Community 16 - "Admin Verification Routes"
Cohesion: 0.70
Nodes (4): checkAdmin(), DELETE(), GET(), PUT()

### Community 18 - "Development Phases"
Cohesion: 0.50
Nodes (4): Phase 1: Setup & Database, Phase 2: Backend Logic, Phase 3: Frontend CRUD, Phase 4: Polish & Deploy

### Community 22 - "Admin Update Delete Routes"
Cohesion: 0.83
Nodes (3): checkAdmin(), DELETE(), PUT()

## Knowledge Gaps
- **123 isolated node(s):** `extends`, `prisma`, `name`, `version`, `private` (+118 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **19 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Project Model` connect `Database Models` to `Admin Dashboard UI`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Why does `cn()` connect `Admin Dashboard UI` to `Admin API & Lists`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **Are the 11 inferred relationships involving `requireAdmin()` (e.g. with `DELETE()` and `PUT()`) actually correct?**
  _`requireAdmin()` has 11 INFERRED edges - model-reasoned connections that need verification._
- **What connects `extends`, `prisma`, `name` to the rest of the system?**
  _123 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Admin Dashboard UI` be split into smaller, more focused modules?**
  _Cohesion score 0.07688828584350972 - nodes in this community are weakly interconnected._
- **Should `Admin API & Lists` be split into smaller, more focused modules?**
  _Cohesion score 0.07431693989071038 - nodes in this community are weakly interconnected._
- **Should `Admin Auth Middleware` be split into smaller, more focused modules?**
  _Cohesion score 0.10084033613445378 - nodes in this community are weakly interconnected._