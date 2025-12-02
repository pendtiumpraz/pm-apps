"use client"

import { useQuery } from "@tanstack/react-query"
import { Users, FolderKanban, Key, Layers, TrendingUp } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const stats = data?.data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Admin Dashboard</h1>
        <p className="mt-1 text-gray-400">Overview of all users and content</p>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="mt-4 h-8 w-20" />
              <Skeleton className="mt-2 h-4 w-24" />
            </div>
          ))
        ) : (
          <>
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2.5">
                  <Users className="h-6 w-6 text-blue-400" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-100">{stats?.users?.total || 0}</p>
              <p className="mt-1 text-sm text-gray-400">Total Users</p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-green-500/10 p-2.5">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-100">{stats?.users?.today || 0}</p>
              <p className="mt-1 text-sm text-gray-400">
                New Today 
                <span className="ml-2 text-gray-500">
                  ({stats?.users?.thisWeek || 0} this week)
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-purple-500/10 p-2.5">
                  <FolderKanban className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-100">{stats?.content?.projects || 0}</p>
              <p className="mt-1 text-sm text-gray-400">
                Total Projects
                <span className="ml-2 text-gray-500">
                  ({stats?.content?.tasks || 0} tasks)
                </span>
              </p>
            </div>

            <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-yellow-500/10 p-2.5">
                  <Key className="h-6 w-6 text-yellow-400" />
                </div>
              </div>
              <p className="mt-4 text-3xl font-bold text-gray-100">{stats?.content?.apiKeys || 0}</p>
              <p className="mt-1 text-sm text-gray-400">
                API Keys
                <span className="ml-2 text-gray-500">
                  ({stats?.content?.platforms || 0} platforms)
                </span>
              </p>
            </div>
          </>
        )}
      </div>

      {/* Recent Users */}
      <div className="rounded-xl border border-gray-800 bg-gray-900">
        <div className="border-b border-gray-800 px-6 py-4">
          <h2 className="text-lg font-semibold text-gray-100">Recent Registrations</h2>
        </div>
        <div className="divide-y divide-gray-800">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-1 h-3 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
            ))
          ) : stats?.recentUsers?.length > 0 ? (
            stats.recentUsers.map((user: any) => (
              <div key={user.id} className="flex items-center gap-4 px-6 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-sm font-medium text-gray-300">
                  {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium text-gray-100">
                    {user.name || "No name"}
                  </p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">{user._count?.projects || 0} projects</p>
                  <p className="text-xs text-gray-500">{formatDate(user.createdAt)}</p>
                </div>
                {user.role === "ADMIN" && (
                  <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                    Admin
                  </span>
                )}
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500">No users yet</div>
          )}
        </div>
      </div>
    </div>
  )
}
