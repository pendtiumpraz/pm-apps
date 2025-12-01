import { z } from "zod"

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required").max(100),
  description: z.string().nullish(),
  client: z.string().nullish(),
  clientContact: z.string().nullish(),
  projectType: z.enum(["FRONTEND", "BACKEND", "FULLSTACK", "MOBILE", "AI", "OTHER"]),
  stack: z.string().nullish(),
  hosting: z.string().nullish(),
  repositoryUrl: z.string().url().nullish().or(z.literal("")),
  liveUrl: z.string().url().nullish().or(z.literal("")),
  status: z.enum(["PLANNING", "ACTIVE", "ON_HOLD", "REVIEW", "COMPLETED", "CANCELLED"]),
  priority: z.number().min(1).max(10),
  deadline: z.string().nullish(),
  progress: z.number().min(0).max(100),
  totalValue: z.number().min(0),
  paidAmount: z.number().min(0),
  currency: z.string(),
  notes: z.string().nullish(),
  color: z.string().nullish(),
})

export type ProjectInput = z.infer<typeof projectSchema>

export const taskSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Task title is required").max(200),
  description: z.string().optional().nullable(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED", "BLOCKED"]).default("TODO"),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  order: z.number().default(0),
})

export type TaskInput = z.infer<typeof taskSchema>

export const paymentSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  invoiceId: z.string().optional().nullable(),
  amount: z.number().min(0, "Amount must be positive"),
  description: z.string().optional().nullable(),
  paymentType: z.enum(["FULL", "DP", "TERMIN", "INSTALLMENT", "RECURRING", "MAINTENANCE", "RENEWAL"]).default("FULL"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "EWALLET", "QRIS", "CREDIT_CARD", "OTHER"]).default("TRANSFER"),
  paymentDate: z.string().optional(),
  status: z.enum(["PENDING", "PROCESSING", "PAID", "FAILED", "REFUNDED", "CANCELLED"]).default("PENDING"),
  installmentNo: z.number().optional().nullable(),
  proofUrl: z.string().url().optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
})

export type PaymentInput = z.infer<typeof paymentSchema>

export const invoiceSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Invoice title is required"),
  description: z.string().optional().nullable(),
  totalAmount: z.number().min(0, "Amount must be positive"),
  dueDate: z.string(),
  type: z.enum(["ONE_TIME", "DP", "TERMIN", "INSTALLMENT", "RECURRING", "RENEWAL"]).default("ONE_TIME"),
  installmentCount: z.number().optional().nullable(),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>

export const domainSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  domainName: z.string().min(1, "Domain name is required"),
  registrar: z.string().optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  expiryDate: z.string(),
  autoRenew: z.boolean().default(false),
  cost: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  reminderDays: z.number().default(30),
})

export type DomainInput = z.infer<typeof domainSchema>

export const hostingSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  provider: z.string().min(1, "Provider is required"),
  planName: z.string().optional().nullable(),
  serverType: z.enum(["SHARED", "VPS", "DEDICATED", "CLOUD", "SERVERLESS", "MANAGED"]).default("SHARED"),
  purchaseDate: z.string().optional().nullable(),
  expiryDate: z.string().optional().nullable(),
  autoRenew: z.boolean().default(false),
  cost: z.number().optional().nullable(),
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "BIYEARLY", "TRIYEARLY", "LIFETIME", "FREE"]).default("YEARLY"),
  serverIp: z.string().optional().nullable(),
  cpanelUrl: z.string().url().optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
  reminderDays: z.number().default(30),
})

export type HostingInput = z.infer<typeof hostingSchema>
