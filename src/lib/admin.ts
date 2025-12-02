import { auth } from "@/lib/auth"

// Check if user is admin from database role or ENV fallback
export async function isAdmin(userId?: string, userEmail?: string): Promise<boolean> {
  // Check ENV fallback first
  const adminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || []
  if (userEmail && adminEmails.includes(userEmail.toLowerCase())) {
    return true
  }
  
  // Will be checked via session role
  return false
}

// Get admin session - returns null if not admin
export async function getAdminSession() {
  const session = await auth()
  
  if (!session?.user?.id) {
    return null
  }

  // Check role from session
  const isAdminRole = (session.user as any).role === "ADMIN"
  
  // Check ENV fallback
  const adminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || []
  const isAdminEmail = session.user.email && adminEmails.includes(session.user.email.toLowerCase())

  if (isAdminRole || isAdminEmail) {
    return session
  }

  return null
}

// Helper to check admin in API routes
export async function requireAdmin() {
  const session = await getAdminSession()
  if (!session) {
    throw new Error("Unauthorized - Admin access required")
  }
  return session
}
