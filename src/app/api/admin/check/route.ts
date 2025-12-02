import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ isAdmin: false })
    }

    // Check role from session
    const isAdminRole = (session.user as any).role === "ADMIN"
    
    // Check ENV fallback
    const adminEmails = process.env.SUPER_ADMIN_EMAILS?.split(",").map(e => e.trim().toLowerCase()) || []
    const isAdminEmail = session.user.email && adminEmails.includes(session.user.email.toLowerCase())

    return NextResponse.json({ 
      isAdmin: isAdminRole || isAdminEmail,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
      }
    })
  } catch (error) {
    console.error("GET /api/admin/check error:", error)
    return NextResponse.json({ isAdmin: false })
  }
}
