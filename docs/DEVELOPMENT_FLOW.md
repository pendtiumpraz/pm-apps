# 🚀 DEVELOPMENT FLOW - ProjectHub

## 📋 Overview

Dokumen ini berisi urutan development step-by-step dari awal hingga production.

---

## 🎯 DEVELOPMENT PHASES

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DEVELOPMENT ROADMAP                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  PHASE 1          PHASE 2          PHASE 3          PHASE 4                │
│  ────────         ────────         ────────         ────────               │
│  Setup &          Backend          Frontend         Polish &               │
│  Database         Logic            CRUD             Deploy                 │
│                                                                             │
│  ┌───────┐       ┌───────┐        ┌───────┐       ┌───────┐               │
│  │ 2-3h  │ ───▶  │ 4-5h  │  ───▶  │ 6-8h  │ ───▶  │ 2-3h  │              │
│  └───────┘       └───────┘        └───────┘       └───────┘               │
│                                                                             │
│  • Next.js init   • Auth logic     • Layout         • Testing              │
│  • Prisma setup   • API routes     • Components     • Optimization         │
│  • DB migration   • Validation     • Forms          • Deploy Vercel        │
│  • Auth config    • CRUD logic     • State mgmt     • Domain setup         │
│                                                                             │
│  Total Estimated: 14-19 hours                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 PHASE 1: Project Setup & Database (2-3 hours)

### Step 1.1: Initialize Next.js Project

```bash
# Create Next.js project dengan TypeScript
npx create-next-app@latest project-hub --typescript --tailwind --eslint --app --src-dir

cd project-hub

# Install dependencies
npm install @prisma/client next-auth@beta @auth/prisma-adapter
npm install @tanstack/react-query zustand zod react-hook-form @hookform/resolvers
npm install lucide-react clsx tailwind-merge date-fns
npm install framer-motion @dnd-kit/core @dnd-kit/sortable
npm install recharts react-hot-toast bcryptjs
npm install -D prisma @types/bcryptjs
```

### Step 1.2: Project Structure

```bash
# Create folder structure
mkdir -p src/app/(auth)/login
mkdir -p src/app/(auth)/register
mkdir -p src/app/(dashboard)/dashboard
mkdir -p src/app/(dashboard)/projects
mkdir -p src/app/(dashboard)/tasks
mkdir -p src/app/(dashboard)/finance
mkdir -p src/app/(dashboard)/assets
mkdir -p src/app/(dashboard)/invoices
mkdir -p src/app/(dashboard)/calendar
mkdir -p src/app/(dashboard)/analytics
mkdir -p src/app/(dashboard)/settings
mkdir -p src/app/api/auth
mkdir -p src/app/api/projects
mkdir -p src/app/api/tasks
mkdir -p src/app/api/payments
mkdir -p src/app/api/invoices
mkdir -p src/app/api/domains
mkdir -p src/app/api/hostings
mkdir -p src/app/api/subscriptions
mkdir -p src/app/api/reminders
mkdir -p src/app/api/analytics
mkdir -p src/components/ui
mkdir -p src/components/layout
mkdir -p src/components/forms
mkdir -p src/components/cards
mkdir -p src/components/charts
mkdir -p src/lib
mkdir -p src/hooks
mkdir -p src/store
mkdir -p src/types
mkdir -p prisma
```

### Step 1.3: Initialize Prisma

```bash
# Initialize Prisma
npx prisma init
```

### Step 1.4: Configure Prisma Schema

Copy schema from `BACKEND_REQUIREMENTS.md` ke `prisma/schema.prisma`

### Step 1.5: Setup Database

```bash
# Option A: Local PostgreSQL dengan Docker
docker run --name projecthub-db -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=projecthub -p 5432:5432 -d postgres:15

# Option B: Neon (recommended untuk development)
# 1. Go to https://neon.tech
# 2. Create new project
# 3. Copy connection string ke .env
```

### Step 1.6: Environment Variables

```bash
# Create .env file
cp .env.example .env
```

```env
# .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/projecthub"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="super-secret-key-change-in-production"
```

### Step 1.7: Run Migration

```bash
# Generate Prisma client
npx prisma generate

# Run migration
npx prisma migrate dev --name init

# (Optional) Seed data
npx prisma db seed
```

### Step 1.8: Verify Database

```bash
# Open Prisma Studio
npx prisma studio
```

---

## 🔐 PHASE 2: Backend Logic (4-5 hours)

### Step 2.1: Setup NextAuth

**File: `src/lib/auth.ts`**
```typescript
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { prisma } from "./prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string }
        })
        
        if (!user || !user.password) return null
        
        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )
        
        if (!isValid) return null
        
        return { id: user.id, email: user.email, name: user.name }
      }
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  }
})
```

**File: `src/app/api/auth/[...nextauth]/route.ts`**
```typescript
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

### Step 2.2: Create Prisma Client

**File: `src/lib/prisma.ts`**
```typescript
import { PrismaClient } from "@prisma/client"

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma
```

### Step 2.3: Create Validation Schemas

**File: `src/lib/validations/project.ts`**
```typescript
import { z } from "zod"

export const projectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().optional(),
  client: z.string().optional(),
  clientContact: z.string().optional(),
  projectType: z.enum(["FRONTEND", "BACKEND", "FULLSTACK", "MOBILE", "AI", "OTHER"]),
  stack: z.string().optional(),
  hosting: z.string().optional(),
  repositoryUrl: z.string().url().optional().or(z.literal("")),
  liveUrl: z.string().url().optional().or(z.literal("")),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "REVIEW", "COMPLETED", "CANCELLED"]),
  priority: z.number().min(1).max(10),
  deadline: z.string().optional(),
  totalValue: z.number().min(0),
  currency: z.string().default("IDR"),
  notes: z.string().optional(),
  color: z.string().optional(),
})

export type ProjectInput = z.infer<typeof projectSchema>
```

### Step 2.4: Create API Routes

**File: `src/app/api/projects/route.ts`**
```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { projectSchema } from "@/lib/validations/project"

// GET all projects
export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get("status")
    const search = searchParams.get("search")

    const projects = await prisma.project.findMany({
      where: {
        userId: session.user.id,
        ...(status && { status: status as any }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { client: { contains: search, mode: "insensitive" } },
          ]
        })
      },
      include: {
        tasks: { select: { id: true, status: true } },
        payments: { select: { id: true, amount: true, status: true } },
        _count: { select: { tasks: true, payments: true } }
      },
      orderBy: [
        { priority: "asc" },
        { deadline: "asc" }
      ]
    })

    return NextResponse.json({ data: projects })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

// POST create project
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = projectSchema.parse(body)

    const project = await prisma.project.create({
      data: {
        ...validated,
        userId: session.user.id,
        deadline: validated.deadline ? new Date(validated.deadline) : null,
      }
    })

    return NextResponse.json({ data: project }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}
```

**File: `src/app/api/projects/[id]/route.ts`**
```typescript
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { projectSchema } from "@/lib/validations/project"

// GET single project
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.findFirst({
      where: { id: params.id, userId: session.user.id },
      include: {
        tasks: true,
        payments: true,
        domains: true,
        hostings: true,
        invoices: true,
      }
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ data: project })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

// PUT update project
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const validated = projectSchema.partial().parse(body)

    const project = await prisma.project.updateMany({
      where: { id: params.id, userId: session.user.id },
      data: {
        ...validated,
        deadline: validated.deadline ? new Date(validated.deadline) : undefined,
      }
    })

    if (project.count === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    const updated = await prisma.project.findUnique({ where: { id: params.id } })
    return NextResponse.json({ data: updated })
  } catch (error) {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

// DELETE project
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const project = await prisma.project.deleteMany({
      where: { id: params.id, userId: session.user.id }
    })

    if (project.count === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Project deleted" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}
```

### Step 2.5: Create Similar Routes for Other Entities

Repeat pattern untuk:
- `/api/tasks/route.ts` & `/api/tasks/[id]/route.ts`
- `/api/payments/route.ts` & `/api/payments/[id]/route.ts`
- `/api/invoices/route.ts` & `/api/invoices/[id]/route.ts`
- `/api/domains/route.ts` & `/api/domains/[id]/route.ts`
- `/api/hostings/route.ts` & `/api/hostings/[id]/route.ts`
- `/api/subscriptions/route.ts` & `/api/subscriptions/[id]/route.ts`
- `/api/reminders/route.ts`
- `/api/analytics/dashboard/route.ts`

### Step 2.6: Create Analytics Endpoint

**File: `src/app/api/analytics/dashboard/route.ts`**
```typescript
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { startOfMonth, endOfMonth, subMonths } from "date-fns"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)

    // Parallel queries
    const [
      totalProjects,
      activeProjects,
      completedProjects,
      totalTasks,
      pendingTasks,
      monthlyPayments,
      totalValue,
      paidAmount,
      upcomingDeadlines,
      expiringDomains,
      expiringHostings,
    ] = await Promise.all([
      prisma.project.count({ where: { userId } }),
      prisma.project.count({ where: { userId, status: "ACTIVE" } }),
      prisma.project.count({ where: { userId, status: "COMPLETED" } }),
      prisma.task.count({ where: { project: { userId } } }),
      prisma.task.count({ where: { project: { userId }, status: { in: ["TODO", "IN_PROGRESS"] } } }),
      prisma.payment.aggregate({
        where: {
          project: { userId },
          status: "PAID",
          paymentDate: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
      }),
      prisma.project.aggregate({
        where: { userId },
        _sum: { totalValue: true }
      }),
      prisma.project.aggregate({
        where: { userId },
        _sum: { paidAmount: true }
      }),
      prisma.project.findMany({
        where: {
          userId,
          status: { in: ["ACTIVE", "PLANNING"] },
          deadline: { gte: now }
        },
        orderBy: { deadline: "asc" },
        take: 5
      }),
      prisma.domain.findMany({
        where: {
          project: { userId },
          expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        }
      }),
      prisma.hosting.findMany({
        where: {
          project: { userId },
          expiryDate: { lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }
        }
      }),
    ])

    return NextResponse.json({
      data: {
        projects: {
          total: totalProjects,
          active: activeProjects,
          completed: completedProjects,
        },
        tasks: {
          total: totalTasks,
          pending: pendingTasks,
        },
        finance: {
          totalValue: totalValue._sum.totalValue || 0,
          paidAmount: paidAmount._sum.paidAmount || 0,
          pendingAmount: (totalValue._sum.totalValue || 0) - (paidAmount._sum.paidAmount || 0),
          monthlyIncome: monthlyPayments._sum.amount || 0,
        },
        upcomingDeadlines,
        alerts: {
          expiringDomains: expiringDomains.length,
          expiringHostings: expiringHostings.length,
        }
      }
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
```

---

## 🎨 PHASE 3: Frontend CRUD (6-8 hours)

### Step 3.1: Create UI Components

**File: `src/components/ui/button.tsx`**
```typescript
import { forwardRef } from "react"
import { clsx } from "clsx"
import { Loader2 } from "lucide-react"

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger"
  size?: "sm" | "md" | "lg"
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
    
    const variants = {
      primary: "bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700",
      secondary: "bg-gray-800 text-gray-100 hover:bg-gray-700 active:bg-gray-600",
      outline: "border border-primary-500 text-primary-500 hover:bg-primary-500/10",
      ghost: "text-gray-300 hover:bg-gray-800 active:bg-gray-700",
      danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
    }
    
    const sizes = {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-12 px-6 text-base",
    }
    
    return (
      <button
        ref={ref}
        className={clsx(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    )
  }
)
Button.displayName = "Button"
```

### Step 3.2: Create Layout Components

**File: `src/components/layout/sidebar.tsx`**
```typescript
"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { clsx } from "clsx"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Wallet,
  Globe,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  Plus,
} from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: Wallet, label: "Finance", href: "/finance" },
  { icon: Globe, label: "Assets", href: "/assets" },
  { icon: FileText, label: "Invoices", href: "/invoices" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

interface SidebarProps {
  projects?: { id: string; name: string; status: string; color?: string }[]
}

export function Sidebar({ projects = [] }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()
  
  return (
    <aside
      className={clsx(
        "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-950 border-r border-gray-800 transition-all duration-200 z-40",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Collapse button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 w-6 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center justify-center hover:bg-gray-700"
      >
        <ChevronLeft className={clsx("h-4 w-4 transition-transform", isCollapsed && "rotate-180")} />
      </button>
      
      {/* Menu */}
      <nav className="p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all",
                isActive
                  ? "bg-primary-500/10 text-primary-400 border-l-2 border-primary-500"
                  : "text-gray-400 hover:text-gray-100 hover:bg-gray-800"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          )
        })}
      </nav>
      
      {/* Projects section */}
      {!isCollapsed && (
        <div className="px-4 mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 uppercase">Projects</span>
            <Link href="/projects/new" className="p-1 hover:bg-gray-800 rounded">
              <Plus className="h-4 w-4 text-gray-400" />
            </Link>
          </div>
          <div className="space-y-1">
            {projects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-400 hover:text-gray-100 hover:bg-gray-800 rounded-lg"
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: project.color || "#6366F1" }}
                />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </aside>
  )
}
```

### Step 3.3: Create Right Panel (Slide-over Modal)

**File: `src/components/ui/right-panel.tsx`**
```typescript
"use client"

import { Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { clsx } from "clsx"

interface RightPanelProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
  width?: "sm" | "md" | "lg"
}

export function RightPanel({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "md"
}: RightPanelProps) {
  const widths = {
    sm: "max-w-[400px]",
    md: "max-w-[480px]",
    lg: "max-w-[640px]",
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={clsx(
              "fixed right-0 top-0 h-full bg-gray-900 border-l border-gray-800 shadow-2xl z-50 flex flex-col",
              widths[width],
              "w-full"
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-400" />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
            
            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-gray-800 bg-gray-900/50">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
```

### Step 3.4: Create Project Form

**File: `src/components/forms/project-form.tsx`**
```typescript
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { projectSchema, ProjectInput } from "@/lib/validations/project"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface ProjectFormProps {
  initialData?: Partial<ProjectInput>
  onSubmit: (data: ProjectInput) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function ProjectForm({ initialData, onSubmit, onCancel, isLoading }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      status: "PLANNING",
      projectType: "FULLSTACK",
      priority: 5,
      totalValue: 0,
      currency: "IDR",
      ...initialData,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Project Name */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Project Name *
        </label>
        <Input
          {...register("name")}
          placeholder="e.g., Website Pondok Imam Syafii"
          error={errors.name?.message}
        />
      </div>

      {/* Client */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Client Name
          </label>
          <Input
            {...register("client")}
            placeholder="e.g., Pak Ayubi"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Client Contact
          </label>
          <Input
            {...register("clientContact")}
            placeholder="e.g., 08123456789"
          />
        </div>
      </div>

      {/* Type & Stack */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project Type
          </label>
          <Select {...register("projectType")}>
            <option value="FRONTEND">Frontend</option>
            <option value="BACKEND">Backend</option>
            <option value="FULLSTACK">Full Stack</option>
            <option value="MOBILE">Mobile</option>
            <option value="AI">AI/ML</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Tech Stack
          </label>
          <Input
            {...register("stack")}
            placeholder="e.g., Next.js, Laravel"
          />
        </div>
      </div>

      {/* Status & Priority */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Status
          </label>
          <Select {...register("status")}>
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="REVIEW">Review</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Priority (1-10)
          </label>
          <Input
            type="number"
            min={1}
            max={10}
            {...register("priority", { valueAsNumber: true })}
          />
        </div>
      </div>

      {/* Deadline & Value */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Deadline
          </label>
          <Input
            type="date"
            {...register("deadline")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Project Value (Rp)
          </label>
          <Input
            type="number"
            min={0}
            {...register("totalValue", { valueAsNumber: true })}
            placeholder="0"
          />
        </div>
      </div>

      {/* Hosting */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Hosting
        </label>
        <Input
          {...register("hosting")}
          placeholder="e.g., Vercel, Domainesia"
        />
      </div>

      {/* URLs */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Repository URL
          </label>
          <Input
            {...register("repositoryUrl")}
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Live URL
          </label>
          <Input
            {...register("liveUrl")}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Notes
        </label>
        <Textarea
          {...register("notes")}
          placeholder="Additional notes..."
          rows={3}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {initialData ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  )
}
```

### Step 3.5: Create Projects Page with CRUD

**File: `src/app/(dashboard)/projects/page.tsx`**
```typescript
"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Filter, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RightPanel } from "@/components/ui/right-panel"
import { ProjectCard } from "@/components/cards/project-card"
import { ProjectForm } from "@/components/forms/project-form"
import { toast } from "react-hot-toast"

export default function ProjectsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  
  const queryClient = useQueryClient()

  // Fetch projects
  const { data: projects, isLoading } = useQuery({
    queryKey: ["projects", search],
    queryFn: async () => {
      const res = await fetch(`/api/projects?search=${search}`)
      const data = await res.json()
      return data.data
    }
  })

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to create")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success("Project created!")
      handleCloseForm()
    },
    onError: () => {
      toast.error("Failed to create project")
    }
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed to update")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success("Project updated!")
      handleCloseForm()
    },
    onError: () => {
      toast.error("Failed to update project")
    }
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] })
      toast.success("Project deleted!")
    },
    onError: () => {
      toast.error("Failed to delete project")
    }
  })

  const handleOpenForm = (project?: any) => {
    setSelectedProject(project || null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setSelectedProject(null)
    setIsFormOpen(false)
  }

  const handleSubmit = async (data: any) => {
    if (selectedProject) {
      await updateMutation.mutateAsync({ id: selectedProject.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Projects</h1>
          <p className="text-gray-400">Manage all your client and personal projects</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4" />
          Filter
        </Button>
        <div className="flex border border-gray-700 rounded-lg">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 ${viewMode === "grid" ? "bg-gray-700" : ""}`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 ${viewMode === "list" ? "bg-gray-700" : ""}`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Projects Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          : "space-y-4"
        }>
          {projects?.map((project: any) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={() => handleOpenForm(project)}
              onDelete={() => {
                if (confirm("Are you sure?")) {
                  deleteMutation.mutate(project.id)
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Right Panel Form */}
      <RightPanel
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedProject ? "Edit Project" : "Create New Project"}
      >
        <ProjectForm
          initialData={selectedProject}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      </RightPanel>
    </div>
  )
}
```

### Step 3.6: Setup React Query Provider

**File: `src/components/providers/query-provider.tsx`**
```typescript
"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
      }
    }
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

## 🚀 PHASE 4: Polish & Deploy (2-3 hours)

### Step 4.1: Add Loading States & Error Handling

- Skeleton loaders untuk cards
- Error boundaries
- Empty states
- Toast notifications

### Step 4.2: Add Animations

- Page transitions dengan Framer Motion
- Card hover effects
- Micro-interactions

### Step 4.3: Mobile Responsive

- Test di berbagai screen sizes
- Sidebar responsive
- Touch-friendly interactions

### Step 4.4: Performance Optimization

```bash
# Analyze bundle
npm run build
npx @next/bundle-analyzer
```

- Lazy load components
- Image optimization
- API response caching

### Step 4.5: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables di Vercel Dashboard
# atau via CLI:
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
```

### Step 4.6: Setup Database di Vercel

1. Go to Vercel Dashboard
2. Storage → Create Database → Postgres
3. Copy connection strings ke environment variables
4. Run migration:

```bash
# Di local dengan production DATABASE_URL
npx prisma migrate deploy
```

### Step 4.7: Final Testing

- [ ] Login/Logout flow
- [ ] CRUD Projects
- [ ] CRUD Tasks
- [ ] CRUD Payments
- [ ] Dashboard analytics
- [ ] Responsive design
- [ ] Error handling

---

## 📋 CHECKLIST

### Phase 1: Setup
- [ ] Create Next.js project
- [ ] Install dependencies
- [ ] Setup folder structure
- [ ] Configure Prisma schema
- [ ] Setup PostgreSQL database
- [ ] Run initial migration

### Phase 2: Backend
- [ ] Setup NextAuth
- [ ] Create Prisma client
- [ ] Create validation schemas
- [ ] Create API routes for Projects
- [ ] Create API routes for Tasks
- [ ] Create API routes for Payments
- [ ] Create API routes for Invoices
- [ ] Create API routes for Domains/Hostings
- [ ] Create Analytics endpoints

### Phase 3: Frontend
- [ ] Create UI components (Button, Input, Select, etc.)
- [ ] Create Layout (Navbar, Sidebar)
- [ ] Create Right Panel component
- [ ] Create Project Form
- [ ] Create Projects page with CRUD
- [ ] Create Tasks page
- [ ] Create Finance page
- [ ] Create Assets page
- [ ] Create Dashboard page
- [ ] Setup React Query

### Phase 4: Polish
- [ ] Add loading states
- [ ] Add error handling
- [ ] Add animations
- [ ] Mobile responsive
- [ ] Performance optimization
- [ ] Deploy to Vercel
- [ ] Setup production database
- [ ] Final testing

---

## 🎉 DONE!

Setelah semua phase selesai, kamu akan punya:
- ✅ Full-stack project management app
- ✅ Authentication (email + Google OAuth ready)
- ✅ CRUD untuk Projects, Tasks, Payments, dll
- ✅ Dashboard analytics
- ✅ Domain/Hosting tracking
- ✅ Invoice management
- ✅ Dark theme dengan animasi smooth
- ✅ Deployed di Vercel

**Total waktu: ~14-19 jam kerja**
