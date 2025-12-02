"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Search, Filter, Activity } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"

const entityTypes = [
  { value: "", label: "All Types" },
  { value: "project", label: "Projects" },
  { value: "task", label: "Tasks" },
  { value: "payment", label: "Payments" },
  { value: "invoice", label: "Invoices" },
  { value: "domain", label: "Domains" },
  { value: "hosting", label: "Hostings" },
]

const actionColors: Record<string, string> = {
  CREATE: "text-green-400 bg-green-500/10",
  UPDATE: "text-blue-400 bg-blue-500/10",
  DELETE: "text-red-400 bg-red-500/10",
}

export default function AdminLogsPage() {
  const [entityType, setEntityType] = useState("")
  const [page, setPage] = useState(1)

  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs", entityType, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (entityType) params.set("entityType", entityType)
      params.set("page", page.toString())
      params.set("limit", "50")
      const res = await fetch(`/api/admin/logs?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const logs = data?.data || []
  const pagination = data?.pagination || { page: 1, totalPages: 1, totalCount: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Activity Logs</h1>
        <p className="mt-1 text-gray-400">View all user activities across the platform</p>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={entityType}
          onChange={(e) => { setEntityType(e.target.value); setPage(1) }}
          className="h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100"
        >
          {entityTypes.map((type) => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>
      </div>

      {/* Logs */}
      <div className="space-y-2">
        {isLoading ? (
          [...Array(10)].map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-64" />
                <Skeleton className="mt-1 h-3 w-40" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
          ))
        ) : logs.length > 0 ? (
          logs.map((log: any) => (
            <div key={log.id} className="flex items-start gap-4 rounded-lg border border-gray-800 bg-gray-900 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800">
                <Activity className="h-5 w-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-100">{log.description}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                  <span>{log.user?.email || "Unknown user"}</span>
                  {log.project && (
                    <>
                      <span>•</span>
                      <span>{log.project.name}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span className={`rounded px-2 py-0.5 text-xs font-medium ${actionColors[log.action] || "text-gray-400 bg-gray-800"}`}>
                  {log.action}
                </span>
                <span className="text-xs text-gray-500">{formatDate(log.createdAt)}</span>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-gray-800 py-16 text-center">
            <Activity className="mx-auto h-12 w-12 text-gray-700" />
            <p className="mt-4 text-gray-500">No activity logs found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400">
          Showing {logs.length > 0 ? ((page - 1) * 50) + 1 : 0} - {Math.min(page * 50, pagination.totalCount)} of {pagination.totalCount} logs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, pagination.totalPages || 1) }, (_, i) => {
              let pageNum
              const totalPages = pagination.totalPages || 1
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (page <= 3) {
                pageNum = i + 1
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = page - 2 + i
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`h-8 w-8 rounded text-sm ${
                    page === pageNum
                      ? "bg-red-500 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  {pageNum}
                </button>
              )
            })}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={page === pagination.totalPages || pagination.totalPages === 0}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
