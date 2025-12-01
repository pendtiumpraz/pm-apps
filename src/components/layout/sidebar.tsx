"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Wallet,
  Globe,
  Calendar,
  BarChart3,
  Settings,
  ChevronLeft,
  Plus,
} from "lucide-react"
import { cn } from "@/lib/utils"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: FolderKanban, label: "Projects", href: "/projects" },
  { icon: CheckSquare, label: "Tasks", href: "/tasks" },
  { icon: Wallet, label: "Finance", href: "/finance" },
  { icon: Globe, label: "Assets", href: "/assets" },
  { icon: Calendar, label: "Calendar", href: "/calendar" },
  { icon: BarChart3, label: "Analytics", href: "/analytics" },
  { icon: Settings, label: "Settings", href: "/settings" },
]

interface SidebarProps {
  projects?: Array<{
    id: string
    name: string
    status: string
    color?: string | null
  }>
}

export function Sidebar({ projects = [] }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const pathname = usePathname()

  const activeProjects = projects.filter(
    (p) => p.status === "ACTIVE" || p.status === "PLANNING"
  )

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-30 hidden h-[calc(100vh-4rem)] border-r border-gray-800 bg-gray-950 transition-all duration-200 lg:block",
        isCollapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Collapse button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-6 flex h-6 w-6 items-center justify-center rounded-full border border-gray-700 bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-100"
      >
        <ChevronLeft
          className={cn("h-4 w-4 transition-transform", isCollapsed && "rotate-180")}
        />
      </button>

      {/* Menu */}
      <nav className="space-y-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary-500/10 text-primary-400"
                  : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 flex-shrink-0",
                  isActive && "text-primary-400"
                )}
              />
              {!isCollapsed && <span>{item.label}</span>}
              {isActive && (
                <div className="absolute left-0 h-8 w-1 rounded-r-full bg-primary-500" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Quick Projects */}
      {!isCollapsed && activeProjects.length > 0 && (
        <div className="mt-6 px-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-gray-500">
              Active Projects
            </span>
            <Link
              href="/projects/new"
              className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
            >
              <Plus className="h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-1">
            {activeProjects.slice(0, 5).map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              >
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: project.color || "#6366F1" }}
                />
                <span className="truncate">{project.name}</span>
              </Link>
            ))}
            {activeProjects.length > 5 && (
              <Link
                href="/projects"
                className="block px-3 py-2 text-xs text-gray-500 hover:text-gray-300"
              >
                View all {activeProjects.length} projects
              </Link>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
