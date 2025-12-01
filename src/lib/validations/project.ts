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
  description: z.string().nullish(),
  status: z.enum(["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED", "BLOCKED"]),
  priority: z.enum(["URGENT", "HIGH", "MEDIUM", "LOW"]),
  dueDate: z.string().nullish(),
  order: z.number(),
})

export type TaskInput = z.infer<typeof taskSchema>

export const paymentSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  invoiceId: z.string().nullish(),
  amount: z.number().min(0, "Amount must be positive"),
  description: z.string().nullish(),
  paymentType: z.enum(["FULL", "DP", "TERMIN", "INSTALLMENT", "RECURRING", "MAINTENANCE", "RENEWAL"]),
  paymentMethod: z.enum(["CASH", "TRANSFER", "EWALLET", "QRIS", "CREDIT_CARD", "OTHER"]),
  paymentDate: z.string().nullish(),
  status: z.enum(["PENDING", "PROCESSING", "PAID", "FAILED", "REFUNDED", "CANCELLED"]),
  installmentNo: z.number().nullish(),
  proofUrl: z.string().url().nullish().or(z.literal("")),
  notes: z.string().nullish(),
})

export type PaymentInput = z.infer<typeof paymentSchema>

export const invoiceSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().min(1, "Invoice title is required"),
  description: z.string().nullish(),
  totalAmount: z.number().min(0, "Amount must be positive"),
  dueDate: z.string(),
  type: z.enum(["ONE_TIME", "DP", "TERMIN", "INSTALLMENT", "RECURRING", "RENEWAL"]),
  installmentCount: z.number().nullish(),
})

export type InvoiceInput = z.infer<typeof invoiceSchema>

export const domainSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  domainName: z.string().min(1, "Domain name is required"),
  registrar: z.string().nullish(),
  purchaseDate: z.string().nullish(),
  expiryDate: z.string(),
  autoRenew: z.boolean(),
  cost: z.number().nullish(),
  notes: z.string().nullish(),
  reminderDays: z.number(),
})

export type DomainInput = z.infer<typeof domainSchema>

export const hostingSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  provider: z.string().min(1, "Provider is required"),
  planName: z.string().nullish(),
  serverType: z.enum(["SHARED", "VPS", "DEDICATED", "CLOUD", "SERVERLESS", "MANAGED"]),
  purchaseDate: z.string().nullish(),
  expiryDate: z.string().nullish(),
  autoRenew: z.boolean(),
  cost: z.number().nullish(),
  billingCycle: z.enum(["MONTHLY", "QUARTERLY", "YEARLY", "BIYEARLY", "TRIYEARLY", "LIFETIME", "FREE"]),
  serverIp: z.string().nullish(),
  cpanelUrl: z.string().url().nullish().or(z.literal("")),
  notes: z.string().nullish(),
  reminderDays: z.number(),
})

export type HostingInput = z.infer<typeof hostingSchema>
