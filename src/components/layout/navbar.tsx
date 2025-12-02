"use client"

import { useState } from "react"
import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavbarProps {
  onMenuClick?: () => void
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  
  const isAdmin = (session?.user as any)?.role === "ADMIN"

  return (
    <header className="fixed left-0 right-0 top-0 z-40 h-16 border-b border-gray-800 bg-gray-950/80 backdrop-blur-lg">
      <div className="flex h-full items-center justify-between px-4 lg:px-6">
        {/* Left */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100 lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
              <span className="text-sm font-bold text-white">P</span>
            </div>
            <span className="hidden text-lg font-semibold text-gray-100 sm:block">
              Project<span className="text-primary-500">Hub</span>
            </span>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="hidden max-w-md flex-1 px-8 md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search projects, tasks..."
              className="h-10 w-full rounded-lg border border-gray-800 bg-gray-900 pl-10 pr-4 text-sm text-gray-100 placeholder:text-gray-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 rounded-xl border border-gray-800 bg-gray-900 p-4 shadow-xl">
                <h3 className="font-medium text-gray-100">Notifications</h3>
                <p className="mt-2 text-sm text-gray-400">No new notifications</p>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 rounded-lg p-2 text-gray-400 hover:bg-gray-800"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/20 text-sm font-medium text-primary-400">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </div>
              <span className="hidden text-sm text-gray-300 md:block">
                {session?.user?.name || "User"}
              </span>
              <ChevronDown className="hidden h-4 w-4 text-gray-500 md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-gray-800 bg-gray-900 py-2 shadow-xl">
                <div className="border-b border-gray-800 px-4 py-3">
                  <p className="text-sm font-medium text-gray-100">
                    {session?.user?.name}
                  </p>
                  <p className="text-xs text-gray-400">{session?.user?.email}</p>
                </div>
                <div className="py-1">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </div>
                <div className="border-t border-gray-800 py-1">
                  <button
                    onClick={() => signOut({ callbackUrl: "/login" })}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-400 hover:bg-gray-800"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
