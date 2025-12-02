"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  Layers,
  Activity,
  ArrowLeft,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

const adminMenuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/admin" },
  { icon: Users, label: "Users", href: "/admin/users" },
  { icon: Layers, label: "Platforms", href: "/admin/platforms" },
  { icon: Activity, label: "Activity Logs", href: "/admin/logs" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetch("/api/admin/check")
      .then(res => res.json())
      .then(data => {
        if (data.isAdmin) {
          setIsAdmin(true)
        } else {
          setIsAdmin(false)
          router.push("/dashboard")
        }
      })
      .catch(() => {
        setIsAdmin(false)
        router.push("/dashboard")
      })
  }, [router])

  if (isAdmin === null) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="text-gray-400">Checking admin access...</div>
      </div>
    )
  }

  if (!isAdmin) {
    return null
  }

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-800 bg-gray-900">
        <div className="flex h-16 items-center gap-2 border-b border-gray-800 px-6">
          <Shield className="h-6 w-6 text-red-500" />
          <span className="text-lg font-bold text-gray-100">Admin Panel</span>
        </div>

        <nav className="p-4 space-y-1">
          {adminMenuItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-red-500/10 text-red-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-64 border-t border-gray-800 p-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-200"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
