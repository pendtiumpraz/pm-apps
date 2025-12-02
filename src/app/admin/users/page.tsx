"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, MoreVertical, Shield, Trash2, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { RightPanel } from "@/components/ui/right-panel"
import { toast } from "react-hot-toast"
import { formatDate } from "@/lib/utils"

export default function AdminUsersPage() {
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", search, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      params.set("page", page.toString())
      const res = await fetch(`/api/admin/users?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const { data: userDetail, isLoading: detailLoading } = useQuery({
    queryKey: ["admin-user-detail", selectedUser?.id],
    queryFn: async () => {
      if (!selectedUser?.id) return null
      const res = await fetch(`/api/admin/users/${selectedUser.id}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    enabled: !!selectedUser?.id,
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string; role: string }) => {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("User role updated")
      setMenuOpen(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      toast.success("User deleted")
      setMenuOpen(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const handleViewDetail = (user: any) => {
    setSelectedUser(user)
    setIsDetailOpen(true)
    setMenuOpen(null)
  }

  const handleToggleAdmin = (user: any) => {
    const newRole = user.role === "ADMIN" ? "USER" : "ADMIN"
    if (confirm(`${newRole === "ADMIN" ? "Promote" : "Demote"} ${user.email} ${newRole === "ADMIN" ? "to" : "from"} admin?`)) {
      updateRoleMutation.mutate({ id: user.id, role: newRole })
    }
  }

  const handleDelete = (user: any) => {
    if (confirm(`Delete user ${user.email}? This will delete all their data.`)) {
      deleteMutation.mutate(user.id)
    }
  }

  const users = data?.data || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalCount: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Users</h1>
        <p className="mt-1 text-gray-400">Manage all registered users</p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full">
          <thead className="border-b border-gray-800 bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">User</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Role</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Projects</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">API Keys</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Joined</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-10 w-48" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-12" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-12" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-8" /></td>
                </tr>
              ))
            ) : users.length > 0 ? (
              users.map((user: any) => (
                <tr key={user.id} className="hover:bg-gray-900/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-800 text-sm font-medium text-gray-300">
                        {user.name?.charAt(0) || user.email?.charAt(0) || "?"}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-100">{user.name || "No name"}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {user.role === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                        <Shield className="h-3 w-3" /> Admin
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">User</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{user._count?.projects || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-300">{user._count?.apiKeys || 0}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{formatDate(user.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="relative">
                      <button
                        onClick={() => setMenuOpen(menuOpen === user.id ? null : user.id)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </button>
                      {menuOpen === user.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                          <div className="absolute right-0 top-full z-20 mt-1 w-40 rounded-lg border border-gray-800 bg-gray-900 py-1 shadow-xl">
                            <button
                              onClick={() => handleViewDetail(user)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                            >
                              <Eye className="h-4 w-4" /> View Detail
                            </button>
                            <button
                              onClick={() => handleToggleAdmin(user)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-300 hover:bg-gray-800"
                            >
                              <Shield className="h-4 w-4" /> 
                              {user.role === "ADMIN" ? "Remove Admin" : "Make Admin"}
                            </button>
                            <button
                              onClick={() => handleDelete(user)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-gray-800"
                            >
                              <Trash2 className="h-4 w-4" /> Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-4 py-16 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Showing {users.length} of {pagination.totalCount} users
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* User Detail Panel */}
      <RightPanel
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setSelectedUser(null) }}
        title="User Detail"
        width="md"
      >
        {detailLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : userDetail?.data ? (
          <div className="space-y-6">
            {/* User Info */}
            <div className="rounded-lg bg-gray-800/50 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-700 text-xl font-medium text-gray-300">
                  {userDetail.data.name?.charAt(0) || userDetail.data.email?.charAt(0) || "?"}
                </div>
                <div>
                  <p className="text-lg font-medium text-gray-100">{userDetail.data.name || "No name"}</p>
                  <p className="text-sm text-gray-400">{userDetail.data.email}</p>
                  {userDetail.data.role === "ADMIN" && (
                    <span className="mt-1 inline-flex items-center gap-1 rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-400">
                      <Shield className="h-3 w-3" /> Admin
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-800/50 p-4">
                <p className="text-2xl font-bold text-gray-100">{userDetail.data._count?.projects || 0}</p>
                <p className="text-sm text-gray-400">Projects</p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-4">
                <p className="text-2xl font-bold text-gray-100">{userDetail.data.apiKeyStats?.total || 0}</p>
                <p className="text-sm text-gray-400">API Keys</p>
              </div>
            </div>

            {/* API Keys by Platform (stats only) */}
            {userDetail.data.apiKeyStats?.byPlatform?.length > 0 && (
              <div>
                <h4 className="mb-3 text-sm font-medium text-gray-300">API Keys by Platform</h4>
                <div className="space-y-2">
                  {userDetail.data.apiKeyStats.byPlatform.map((stat: any, i: number) => (
                    <div key={i} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <span 
                          className="h-3 w-3 rounded-full" 
                          style={{ backgroundColor: stat.platform?.color || "#6366F1" }}
                        />
                        <span className="text-sm text-gray-200">{stat.platform?.name || "Unknown"}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-300">{stat.count} keys</p>
                        <p className="text-xs text-gray-500">
                          ${stat.creditTotal.toFixed(2)} credit
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Meta */}
            <div className="text-xs text-gray-500">
              <p>Joined: {formatDate(userDetail.data.createdAt)}</p>
              <p>Last updated: {formatDate(userDetail.data.updatedAt)}</p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No user selected</p>
        )}
      </RightPanel>
    </div>
  )
}
