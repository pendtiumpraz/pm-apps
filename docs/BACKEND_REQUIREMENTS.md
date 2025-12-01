# 📦 BACKEND REQUIREMENTS - ProjectHub

## 📋 Overview

ProjectHub adalah aplikasi manajemen project untuk developer/freelancer yang menangani banyak project sekaligus. Aplikasi ini membantu:
- Prioritas project berdasarkan deadline & value
- Tracking income dari setiap project
- Monitoring progress dan tasks
- Daily focus management

---

## 🗄️ COMPLETE ERD (Entity Relationship Diagram)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                    DATABASE SCHEMA                                       │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│      USER        │       │     PROJECT      │       │      TASK        │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │──┐    │ id (PK)          │──┐    │ id (PK)          │
│ email            │  │    │ userId (FK)      │  │    │ projectId (FK)   │
│ password         │  └───>│ name             │  └───>│ title            │
│ name             │       │ description      │       │ description      │
│ avatar           │       │ client           │       │ status           │
│ role             │       │ clientContact    │       │ priority         │
│ createdAt        │       │ projectType      │       │ dueDate          │
│ updatedAt        │       │ stack            │       │ order            │
└──────────────────┘       │ hosting          │       │ completedAt      │
                           │ repositoryUrl    │       │ createdAt        │
                           │ liveUrl          │       │ updatedAt        │
┌──────────────────┐       │ status           │       └──────────────────┘
│     PAYMENT      │       │ priority         │
├──────────────────┤       │ deadline         │       ┌──────────────────┐
│ id (PK)          │       │ progress         │       │    ACTIVITY      │
│ projectId (FK)   │<──────│ totalValue       │       ├──────────────────┤
│ amount           │       │ paidAmount       │       │ id (PK)          │
│ description      │       │ currency         │       │ projectId (FK)   │
│ paymentDate      │       │ notes            │       │ userId (FK)      │
│ paymentMethod    │       │ order            │       │ action           │
│ status           │       │ createdAt        │       │ description      │
│ invoiceUrl       │       │ updatedAt        │       │ metadata         │
│ createdAt        │       └──────────────────┘       │ createdAt        │
└──────────────────┘                                  └──────────────────┘
         │
         │         ┌──────────────────┐
         │         │     INCOME       │
         │         ├──────────────────┤
         └────────>│ id (PK)          │
                   │ projectId (FK)   │
                   │ paymentId (FK)   │
                   │ amount           │
                   │ type             │
                   │ month            │
                   │ year             │
                   │ createdAt        │
                   └──────────────────┘

RELATIONSHIP SUMMARY:
─────────────────────
• User (1) ──────< Project (N)     : Satu user punya banyak project
• Project (1) ───< Task (N)        : Satu project punya banyak task
• Project (1) ───< Payment (N)     : Satu project punya banyak payment
• Project (1) ───< Activity (N)    : Satu project punya banyak activity log
• Project (1) ───< Income (N)      : Satu project punya banyak income record
• Project (1) ───< Domain (N)      : Satu project bisa punya banyak domain
• Project (1) ───< Hosting (N)     : Satu project bisa punya banyak hosting
• Project (1) ───< Subscription (N): Satu project bisa punya subscription (SaaS)
• Project (1) ───< Invoice (N)     : Satu project punya banyak invoice
• Payment (1) ───< Income (N)      : Satu payment bisa generate income records
• Invoice (1) ───< Payment (N)     : Satu invoice bisa punya banyak payment (cicilan)
```

ADDITIONAL TABLES:
──────────────────

┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│     DOMAIN       │       │     HOSTING      │       │   SUBSCRIPTION   │
├──────────────────┤       ├──────────────────┤       ├──────────────────┤
│ id (PK)          │       │ id (PK)          │       │ id (PK)          │
│ projectId (FK)   │       │ projectId (FK)   │       │ projectId (FK)   │
│ domainName       │       │ provider         │       │ planName         │
│ registrar        │       │ planName         │       │ amount           │
│ purchaseDate     │       │ serverType       │       │ billingCycle     │
│ expiryDate       │       │ purchaseDate     │       │ startDate        │
│ autoRenew        │       │ expiryDate       │       │ nextBillingDate  │
│ cost             │       │ autoRenew        │       │ status           │
│ status           │       │ cost             │       │ createdAt        │
│ notes            │       │ credentials      │       └──────────────────┘
│ createdAt        │       │ status           │
└──────────────────┘       │ notes            │       ┌──────────────────┐
                           │ createdAt        │       │     INVOICE      │
                           └──────────────────┘       ├──────────────────┤
                                                      │ id (PK)          │
┌──────────────────┐                                  │ projectId (FK)   │
│   INSTALLMENT    │                                  │ invoiceNumber    │
├──────────────────┤                                  │ title            │
│ id (PK)          │                                  │ totalAmount      │
│ paymentId (FK)   │                                  │ paidAmount       │
│ installmentNo    │                                  │ dueDate          │
│ amount           │                                  │ status           │
│ dueDate          │                                  │ type             │
│ paidDate         │                                  │ pdfUrl           │
│ status           │                                  │ sentAt           │
│ createdAt        │                                  │ createdAt        │
└──────────────────┘                                  └──────────────────┘

---

## 📊 DATABASE SCHEMA (Prisma)

### schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Untuk Vercel Postgres / Neon pooling
}

// ============================================
// USER - Pengguna aplikasi
// ============================================
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String?   // Null jika login via OAuth
  name          String?
  avatar        String?
  role          UserRole  @default(USER)
  
  // OAuth fields
  emailVerified DateTime?
  accounts      Account[]
  sessions      Session[]
  
  // Relations
  projects      Project[]
  activities    Activity[]
  
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

enum UserRole {
  USER
  ADMIN
}

// ============================================
// PROJECT - Data project/client
// ============================================
model Project {
  id            String        @id @default(cuid())
  userId        String
  
  // Basic Info
  name          String
  description   String?
  client        String?       // Nama client (Pak Ayubi, dll)
  clientContact String?       // Kontak client (WA/Email)
  
  // Technical Info
  projectType   ProjectType   @default(FULLSTACK)
  stack         String?       // "Next.js, Laravel, etc"
  hosting       String?       // "Vercel, Domainesia, Local"
  repositoryUrl String?       // GitHub URL
  liveUrl       String?       // Production URL
  
  // Status & Progress
  status        ProjectStatus @default(PLANNING)
  priority      Int           @default(5) // 1-10, 1 = highest
  deadline      DateTime?
  progress      Int           @default(0) // 0-100%
  
  // Financial
  totalValue    Float         @default(0) // Total nilai project (Rupiah)
  paidAmount    Float         @default(0) // Jumlah yang sudah dibayar
  currency      String        @default("IDR")
  
  // Additional
  notes         String?
  color         String?       // Warna label project
  order         Int           @default(0) // Untuk drag & drop ordering
  
  // Relations
  user          User          @relation(fields: [userId], references: [id], onDelete: Cascade)
  tasks         Task[]
  payments      Payment[]
  invoices      Invoice[]
  incomes       Income[]
  activities    Activity[]
  domains       Domain[]
  hostings      Hosting[]
  subscriptions Subscription[]
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@index([userId])
  @@index([status])
  @@index([deadline])
}

enum ProjectType {
  FRONTEND      // Frontend only
  BACKEND       // Backend/API only
  FULLSTACK     // Full stack
  MOBILE        // Mobile app
  AI            // AI/ML project
  OTHER         // Lainnya
}

enum ProjectStatus {
  PLANNING      // Masih planning/requirement
  ACTIVE        // Sedang dikerjakan
  ON_HOLD       // Ditunda
  REVIEW        // Menunggu review client
  COMPLETED     // Selesai
  CANCELLED     // Dibatalkan
}

// ============================================
// TASK - Task per project
// ============================================
model Task {
  id          String      @id @default(cuid())
  projectId   String
  
  title       String
  description String?
  status      TaskStatus  @default(TODO)
  priority    TaskPriority @default(MEDIUM)
  dueDate     DateTime?
  
  order       Int         @default(0) // Untuk drag & drop
  
  // Relations
  project     Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  completedAt DateTime?
  createdAt   DateTime    @default(now())
  updatedAt   DateTime    @updatedAt
  
  @@index([projectId])
  @@index([status])
}

enum TaskStatus {
  TODO          // Belum mulai
  IN_PROGRESS   // Sedang dikerjakan
  REVIEW        // Perlu review
  COMPLETED     // Selesai
  BLOCKED       // Terblokir
}

enum TaskPriority {
  URGENT        // Sangat mendesak
  HIGH          // Prioritas tinggi
  MEDIUM        // Normal
  LOW           // Bisa ditunda
}

// ============================================
// INVOICE - Tagihan ke client
// ============================================
model Invoice {
  id            String        @id @default(cuid())
  projectId     String
  
  invoiceNumber String        @unique // INV-2024-001
  title         String        // "Pembayaran Website Pondok Imam Syafii"
  description   String?
  totalAmount   Float         // Total tagihan
  paidAmount    Float         @default(0)
  dueDate       DateTime
  
  type          InvoiceType   @default(ONE_TIME)
  status        InvoiceStatus @default(DRAFT)
  
  // For installment
  installmentCount Int?       // Jumlah cicilan (null = tidak cicilan)
  
  pdfUrl        String?       // URL PDF invoice
  sentAt        DateTime?     // Kapan dikirim ke client
  
  // Relations
  project       Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  payments      Payment[]
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@index([projectId])
  @@index([dueDate])
  @@index([status])
}

enum InvoiceType {
  ONE_TIME      // Pembayaran sekali (project)
  DP            // Down Payment
  TERMIN        // Pembayaran per termin
  INSTALLMENT   // Cicilan
  RECURRING     // Berulang (SaaS, maintenance)
  RENEWAL       // Perpanjangan (domain/hosting)
}

enum InvoiceStatus {
  DRAFT         // Belum dikirim
  SENT          // Sudah dikirim
  VIEWED        // Sudah dilihat client
  PARTIAL       // Sebagian dibayar
  PAID          // Lunas
  OVERDUE       // Telat bayar
  CANCELLED     // Dibatalkan
}

// ============================================
// PAYMENT - Pembayaran dari client
// ============================================
model Payment {
  id            String        @id @default(cuid())
  projectId     String
  invoiceId     String?       // Link ke invoice (optional)
  
  amount        Float         // Jumlah pembayaran
  description   String?       // Keterangan (DP, Termin 1, Cicilan ke-3, dll)
  
  paymentType   PaymentType   @default(FULL)
  paymentMethod PaymentMethod @default(TRANSFER)
  
  paymentDate   DateTime      @default(now())
  status        PaymentStatus @default(PENDING)
  
  // For installment tracking
  installmentNo Int?          // Cicilan ke berapa (1, 2, 3, ...)
  
  proofUrl      String?       // Bukti transfer
  notes         String?
  
  // Relations
  project       Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  invoice       Invoice?      @relation(fields: [invoiceId], references: [id], onDelete: SetNull)
  incomes       Income[]
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@index([projectId])
  @@index([invoiceId])
  @@index([paymentDate])
}

enum PaymentType {
  FULL          // Pembayaran penuh
  DP            // Down Payment (uang muka)
  TERMIN        // Pembayaran per termin
  INSTALLMENT   // Cicilan bulanan
  RECURRING     // SaaS/subscription
  MAINTENANCE   // Maintenance fee
  RENEWAL       // Perpanjangan domain/hosting
}

enum PaymentMethod {
  CASH          // Tunai
  TRANSFER      // Transfer bank
  EWALLET       // GoPay, OVO, Dana, dll
  QRIS          // QRIS
  CREDIT_CARD   // Kartu kredit
  OTHER         // Lainnya
}

enum PaymentStatus {
  PENDING       // Menunggu pembayaran
  PROCESSING    // Sedang diproses
  PAID          // Sudah dibayar
  FAILED        // Gagal
  REFUNDED      // Dikembalikan
  CANCELLED     // Dibatalkan
}

// ============================================
// INCOME - Record pendapatan bulanan
// ============================================
model Income {
  id          String      @id @default(cuid())
  projectId   String
  paymentId   String?     // Optional, bisa manual input
  
  amount      Float
  type        IncomeType  @default(PROJECT)
  description String?
  month       Int         // 1-12
  year        Int         // 2024, 2025, etc
  
  // Relations
  project     Project     @relation(fields: [projectId], references: [id], onDelete: Cascade)
  payment     Payment?    @relation(fields: [paymentId], references: [id], onDelete: SetNull)
  
  createdAt   DateTime    @default(now())
  
  @@index([projectId])
  @@index([month, year])
}

enum IncomeType {
  PROJECT       // Dari project client
  AI_PRODUCT    // Dari AI product (SaaS, dll)
  MAINTENANCE   // Maintenance fee
  CONSULTATION  // Konsultasi
  OTHER         // Lainnya
}

// ============================================
// ACTIVITY - Activity log
// ============================================
model Activity {
  id          String    @id @default(cuid())
  projectId   String?
  userId      String
  
  action      String    // CREATE, UPDATE, DELETE, etc
  entityType  String    // PROJECT, TASK, PAYMENT
  entityId    String?
  description String
  metadata    String?   // JSON string untuk data tambahan
  
  // Relations
  project     Project?  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime  @default(now())
  
  @@index([projectId])
  @@index([userId])
  @@index([createdAt])
}

// ============================================
// DOMAIN - Tracking domain client
// ============================================
model Domain {
  id            String        @id @default(cuid())
  projectId     String
  
  domainName    String        // example.com
  registrar     String?       // Niagahoster, Domainesia, Cloudflare, dll
  purchaseDate  DateTime?
  expiryDate    DateTime      // Tanggal expired
  autoRenew     Boolean       @default(false)
  cost          Float?        // Biaya per tahun
  
  status        AssetStatus   @default(ACTIVE)
  notes         String?
  
  // Credentials (encrypted)
  registrarUsername String?
  registrarPassword String?   // Should be encrypted
  
  // Reminder settings
  reminderDays  Int           @default(30) // Remind X days before expiry
  lastReminder  DateTime?
  
  // Relations
  project       Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@index([projectId])
  @@index([expiryDate])
}

// ============================================
// HOSTING - Tracking hosting client
// ============================================
model Hosting {
  id            String        @id @default(cuid())
  projectId     String
  
  provider      String        // Domainesia, Niagahoster, Vercel, Railway, dll
  planName      String?       // Starter, Pro, Enterprise
  serverType    HostingType   @default(SHARED)
  
  purchaseDate  DateTime?
  expiryDate    DateTime?     // Null jika lifetime/free tier
  autoRenew     Boolean       @default(false)
  cost          Float?        // Biaya per periode
  billingCycle  BillingCycle  @default(YEARLY)
  
  status        AssetStatus   @default(ACTIVE)
  
  // Server details
  serverIp      String?
  cpanelUrl     String?
  sshHost       String?
  sshPort       Int?
  
  // Credentials (encrypted)
  username      String?
  password      String?       // Should be encrypted
  
  notes         String?
  
  // Reminder settings
  reminderDays  Int           @default(30)
  lastReminder  DateTime?
  
  // Relations
  project       Project       @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  
  @@index([projectId])
  @@index([expiryDate])
}

enum HostingType {
  SHARED        // Shared hosting
  VPS           // Virtual Private Server
  DEDICATED     // Dedicated server
  CLOUD         // Cloud hosting (AWS, GCP, Azure)
  SERVERLESS    // Vercel, Netlify, dll
  MANAGED       // Managed WordPress, dll
}

enum BillingCycle {
  MONTHLY       // Bulanan
  QUARTERLY     // 3 bulan
  YEARLY        // Tahunan
  BIYEARLY      // 2 tahun
  TRIYEARLY     // 3 tahun
  LIFETIME      // Sekali bayar selamanya
  FREE          // Gratis
}

enum AssetStatus {
  ACTIVE        // Aktif
  EXPIRING_SOON // Akan expired dalam 30 hari
  EXPIRED       // Sudah expired
  SUSPENDED     // Disuspend
  CANCELLED     // Dibatalkan
}

// ============================================
// SUBSCRIPTION - SaaS/Recurring revenue
// ============================================
model Subscription {
  id              String            @id @default(cuid())
  projectId       String
  
  planName        String            // Basic, Pro, Enterprise
  description     String?
  
  amount          Float             // Harga per cycle
  billingCycle    BillingCycle      @default(MONTHLY)
  
  startDate       DateTime          @default(now())
  nextBillingDate DateTime
  endDate         DateTime?         // Null jika ongoing
  
  status          SubscriptionStatus @default(ACTIVE)
  
  // Customer info (for SaaS products)
  customerName    String?
  customerEmail   String?
  customerPhone   String?
  
  // Auto-charge settings
  autoCharge      Boolean           @default(false)
  
  notes           String?
  
  // Relations
  project         Project           @relation(fields: [projectId], references: [id], onDelete: Cascade)
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@index([projectId])
  @@index([nextBillingDate])
  @@index([status])
}

enum SubscriptionStatus {
  TRIAL         // Masa trial
  ACTIVE        // Aktif
  PAST_DUE      // Telat bayar
  PAUSED        // Dijeda
  CANCELLED     // Dibatalkan
  EXPIRED       // Berakhir
}

// ============================================
// REMINDER - Scheduled reminders
// ============================================
model Reminder {
  id            String        @id @default(cuid())
  userId        String
  
  title         String
  description   String?
  
  type          ReminderType
  entityType    String?       // DOMAIN, HOSTING, INVOICE, SUBSCRIPTION
  entityId      String?
  
  reminderDate  DateTime
  isRead        Boolean       @default(false)
  isDismissed   Boolean       @default(false)
  
  // Repeat settings
  isRecurring   Boolean       @default(false)
  recurringDays Int?          // Repeat every X days
  
  createdAt     DateTime      @default(now())
  
  @@index([userId])
  @@index([reminderDate])
  @@index([isRead])
}

enum ReminderType {
  DOMAIN_EXPIRY     // Domain akan expired
  HOSTING_EXPIRY    // Hosting akan expired
  INVOICE_DUE       // Invoice jatuh tempo
  PAYMENT_REMINDER  // Reminder pembayaran
  SUBSCRIPTION_RENEW // Subscription akan renew
  PROJECT_DEADLINE  // Deadline project
  TASK_DUE          // Task jatuh tempo
  CUSTOM            // Custom reminder
}
```

---

## 🔌 API ENDPOINTS

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register dengan email/password |
| POST | `/api/auth/login` | Login dengan email/password |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/session` | Get current session |
| GET | `/api/auth/providers` | Get OAuth providers |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | Get all projects (with filters) |
| GET | `/api/projects/:id` | Get single project |
| POST | `/api/projects` | Create new project |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| PATCH | `/api/projects/reorder` | Reorder projects (drag & drop) |
| GET | `/api/projects/:id/stats` | Get project statistics |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/tasks` | Get tasks by project |
| GET | `/api/tasks` | Get all tasks (with filters) |
| POST | `/api/tasks` | Create new task |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |
| PATCH | `/api/tasks/:id/status` | Update task status |
| PATCH | `/api/tasks/reorder` | Reorder tasks (drag & drop) |

### Payments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/payments` | Get payments by project |
| GET | `/api/payments` | Get all payments |
| POST | `/api/payments` | Create new payment |
| PUT | `/api/payments/:id` | Update payment |
| DELETE | `/api/payments/:id` | Delete payment |

### Income & Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/income` | Get income records |
| GET | `/api/income/summary` | Get income summary (monthly/yearly) |
| POST | `/api/income` | Add manual income |
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/projects` | Project analytics |
| GET | `/api/analytics/income` | Income analytics |

### Activity

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/activities` | Get activity log |
| GET | `/api/projects/:id/activities` | Get project activities |

### Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/invoices` | Get all invoices (with filters) |
| GET | `/api/invoices/:id` | Get single invoice |
| POST | `/api/invoices` | Create new invoice |
| PUT | `/api/invoices/:id` | Update invoice |
| DELETE | `/api/invoices/:id` | Delete invoice |
| POST | `/api/invoices/:id/send` | Send invoice to client |
| GET | `/api/invoices/:id/pdf` | Generate/download PDF |
| GET | `/api/projects/:id/invoices` | Get invoices by project |

### Domains

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/domains` | Get all domains |
| GET | `/api/domains/:id` | Get single domain |
| POST | `/api/domains` | Create new domain |
| PUT | `/api/domains/:id` | Update domain |
| DELETE | `/api/domains/:id` | Delete domain |
| GET | `/api/domains/expiring` | Get expiring domains (next 30 days) |
| GET | `/api/projects/:id/domains` | Get domains by project |

### Hostings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/hostings` | Get all hostings |
| GET | `/api/hostings/:id` | Get single hosting |
| POST | `/api/hostings` | Create new hosting |
| PUT | `/api/hostings/:id` | Update hosting |
| DELETE | `/api/hostings/:id` | Delete hosting |
| GET | `/api/hostings/expiring` | Get expiring hostings |
| GET | `/api/projects/:id/hostings` | Get hostings by project |

### Subscriptions (SaaS)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/subscriptions` | Get all subscriptions |
| GET | `/api/subscriptions/:id` | Get single subscription |
| POST | `/api/subscriptions` | Create new subscription |
| PUT | `/api/subscriptions/:id` | Update subscription |
| DELETE | `/api/subscriptions/:id` | Delete subscription |
| PATCH | `/api/subscriptions/:id/status` | Update status (pause/cancel) |
| GET | `/api/subscriptions/upcoming` | Get upcoming renewals |
| GET | `/api/projects/:id/subscriptions` | Get subscriptions by project |

### Reminders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reminders` | Get all reminders |
| GET | `/api/reminders/today` | Get today's reminders |
| GET | `/api/reminders/upcoming` | Get upcoming reminders |
| POST | `/api/reminders` | Create custom reminder |
| PUT | `/api/reminders/:id` | Update reminder |
| DELETE | `/api/reminders/:id` | Delete reminder |
| PATCH | `/api/reminders/:id/read` | Mark as read |
| PATCH | `/api/reminders/:id/dismiss` | Dismiss reminder |

---

## 🔐 AUTHENTICATION FLOW

### 1. Email/Password Login
```
1. User submit email + password
2. Backend validate credentials
3. Create session dengan NextAuth
4. Return session token
5. Store di cookie (httpOnly)
```

### 2. Google OAuth Login
```
1. User click "Login with Google"
2. Redirect ke Google OAuth consent
3. Google callback dengan authorization code
4. Exchange code untuk access token
5. Get user info dari Google
6. Create/update user di database
7. Create session
8. Redirect ke dashboard
```

---

## 📐 BUSINESS LOGIC

### Priority Calculation Algorithm
```typescript
function calculatePriority(project: Project): number {
  let score = 0;
  
  // 1. Deadline urgency (40% weight)
  if (project.deadline) {
    const daysUntilDeadline = differenceInDays(project.deadline, new Date());
    if (daysUntilDeadline < 0) score += 100; // Overdue
    else if (daysUntilDeadline <= 3) score += 80;
    else if (daysUntilDeadline <= 7) score += 60;
    else if (daysUntilDeadline <= 14) score += 40;
    else if (daysUntilDeadline <= 30) score += 20;
  }
  
  // 2. Project value (30% weight)
  if (project.totalValue > 0) {
    if (project.totalValue >= 50000000) score += 30; // >= 50jt
    else if (project.totalValue >= 20000000) score += 25;
    else if (project.totalValue >= 10000000) score += 20;
    else if (project.totalValue >= 5000000) score += 15;
    else score += 10;
  }
  
  // 3. Client vs Personal (20% weight)
  if (project.client) score += 20; // Client project
  
  // 4. Progress (10% weight) - prioritize almost done
  if (project.progress >= 80) score += 10;
  else if (project.progress >= 50) score += 5;
  
  return score;
}
```

### Income Summary Calculation
```typescript
interface IncomeSummary {
  totalIncome: number;
  monthlyIncome: { month: number; year: number; amount: number }[];
  projectIncome: { projectId: string; projectName: string; amount: number }[];
  pendingPayments: number;
  averageMonthlyIncome: number;
}

function calculateIncomeSummary(projects: Project[], payments: Payment[]): IncomeSummary {
  // Calculate total paid
  const totalIncome = payments
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);
  
  // Calculate pending
  const pendingPayments = projects.reduce((sum, p) => {
    return sum + (p.totalValue - p.paidAmount);
  }, 0);
  
  // Group by month
  // Group by project
  // Calculate average
  
  return { ... };
}
```

### Smart Suggestion System
```typescript
interface Suggestion {
  type: 'FOCUS' | 'WARNING' | 'REMINDER';
  message: string;
  projectId?: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
}

function generateSuggestions(projects: Project[], tasks: Task[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  
  // 1. Overdue projects
  projects.filter(p => p.deadline && p.deadline < new Date() && p.status !== 'COMPLETED')
    .forEach(p => suggestions.push({
      type: 'WARNING',
      message: `${p.name} sudah melewati deadline!`,
      projectId: p.id,
      priority: 'HIGH'
    }));
  
  // 2. Deadline dalam 3 hari
  projects.filter(p => {
    if (!p.deadline || p.status === 'COMPLETED') return false;
    const days = differenceInDays(p.deadline, new Date());
    return days >= 0 && days <= 3;
  }).forEach(p => suggestions.push({
    type: 'FOCUS',
    message: `${p.name} deadline ${formatDistance(p.deadline, new Date())}`,
    projectId: p.id,
    priority: 'HIGH'
  }));
  
  // 3. Payment reminder
  projects.filter(p => p.totalValue > 0 && p.paidAmount < p.totalValue && p.progress >= 80)
    .forEach(p => suggestions.push({
      type: 'REMINDER',
      message: `${p.name} hampir selesai, belum lunas (${formatCurrency(p.totalValue - p.paidAmount)} tersisa)`,
      projectId: p.id,
      priority: 'MEDIUM'
    }));
  
  return suggestions;
}
```

---

## 🔧 ENVIRONMENT VARIABLES

```env
# ====================================
# DATABASE (PostgreSQL)
# ====================================
# Pilih salah satu provider:

# Option 1: Vercel Postgres (Recommended untuk Vercel)
DATABASE_URL="postgres://default:xxxxx@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require&pgbouncer=true"
DIRECT_URL="postgres://default:xxxxx@ep-xxx.us-east-1.postgres.vercel-storage.com:5432/verceldb?sslmode=require"

# Option 2: Neon (Free tier generous)
# DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"
# DIRECT_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Option 3: Supabase
# DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:6543/postgres?pgbouncer=true"
# DIRECT_URL="postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres"

# Option 4: Railway
# DATABASE_URL="postgresql://postgres:xxxx@containers-us-west-xxx.railway.app:5432/railway"

# Local Development (Docker)
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/projecthub"

# ====================================
# NEXTAUTH
# ====================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-chars"

# ====================================
# GOOGLE OAUTH (Optional - isi nanti)
# ====================================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# ====================================
# APP CONFIG
# ====================================
NEXT_PUBLIC_APP_NAME="ProjectHub"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ====================================
# ENCRYPTION (untuk credentials hosting/domain)
# ====================================
ENCRYPTION_KEY="32-character-encryption-key-here"
```

---

## 🗄️ DATABASE PROVIDER COMPARISON

| Provider | Free Tier | Pros | Cons |
|----------|-----------|------|------|
| **Vercel Postgres** | 256MB storage | Native Vercel integration, auto-scaling | Tied to Vercel |
| **Neon** | 512MB storage, 3GB transfer | Generous free tier, branching | Relatively new |
| **Supabase** | 500MB storage | Full BaaS features, Auth included | Heavier if only need DB |
| **Railway** | $5 credit/month | Simple, good DX | Not truly free |
| **PlanetScale** | 5GB storage | MySQL compatible, branching | Not PostgreSQL |

**Recommendation:** Gunakan **Neon** untuk development (free tier besar) dan **Vercel Postgres** untuk production (integrasi seamless).

---

## 📁 API FOLDER STRUCTURE

```
src/app/api/
├── auth/
│   ├── [...nextauth]/
│   │   └── route.ts          # NextAuth handler
│   └── register/
│       └── route.ts          # Email registration
│
├── projects/
│   ├── route.ts              # GET all, POST create
│   ├── [id]/
│   │   ├── route.ts          # GET, PUT, DELETE single
│   │   ├── stats/
│   │   │   └── route.ts      # GET project stats
│   │   ├── tasks/
│   │   │   └── route.ts      # GET tasks by project
│   │   ├── payments/
│   │   │   └── route.ts      # GET payments by project
│   │   └── activities/
│   │       └── route.ts      # GET activities by project
│   └── reorder/
│       └── route.ts          # PATCH reorder
│
├── tasks/
│   ├── route.ts              # GET all, POST create
│   ├── [id]/
│   │   ├── route.ts          # GET, PUT, DELETE single
│   │   └── status/
│   │       └── route.ts      # PATCH update status
│   └── reorder/
│       └── route.ts          # PATCH reorder
│
├── payments/
│   ├── route.ts              # GET all, POST create
│   └── [id]/
│       └── route.ts          # GET, PUT, DELETE single
│
├── income/
│   ├── route.ts              # GET all, POST create
│   └── summary/
│       └── route.ts          # GET summary
│
├── analytics/
│   ├── dashboard/
│   │   └── route.ts          # GET dashboard stats
│   ├── projects/
│   │   └── route.ts          # GET project analytics
│   └── income/
│       └── route.ts          # GET income analytics
│
└── activities/
    └── route.ts              # GET all activities
```

---

## ✅ API RESPONSE FORMAT

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [ ... ]
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

---

## 🔒 SECURITY CONSIDERATIONS

1. **Authentication Required** - Semua endpoint kecuali auth harus authenticated
2. **User Isolation** - User hanya bisa akses data miliknya sendiri
3. **Input Validation** - Validate semua input dengan Zod
4. **Rate Limiting** - Implement rate limiting untuk API
5. **SQL Injection** - Prisma sudah handle secara default
6. **XSS Prevention** - Sanitize output
7. **CORS** - Configure CORS dengan benar

---

## 📝 NOTES

- Gunakan transactions untuk operasi yang melibatkan multiple tables
- Implement soft delete jika diperlukan (add deletedAt field)
- Cache frequently accessed data (dashboard stats, etc.)
- Log semua activity untuk audit trail
