"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import Link from "next/link"
import {
    Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
    ExternalLink, Edit, Trash2, ArrowUpDown, User, Rocket
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { StatusBadge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn, formatCurrency, formatDate, getDaysUntil } from "@/lib/utils"

interface ProjectTableProps {
    onEdit: (project: any) => void
    onDelete: (project: any) => void
}

const ITEMS_PER_PAGE = 15

export function ProjectTable({ onEdit, onDelete }: ProjectTableProps) {
    const [search, setSearch] = useState("")
    const [clientFilter, setClientFilter] = useState("")
    const [statusFilter, setStatusFilter] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("")
    const [page, setPage] = useState(1)
    const [sortField, setSortField] = useState<string>("priority")
    const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

    // Fetch with pagination
    const { data, isLoading } = useQuery({
        queryKey: ["projects-table", search, clientFilter, statusFilter, categoryFilter, page],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (search) params.set("search", search)
            if (statusFilter) params.set("status", statusFilter)
            if (categoryFilter) params.set("category", categoryFilter)
            if (clientFilter) params.set("client", clientFilter)
            params.set("page", page.toString())
            params.set("limit", ITEMS_PER_PAGE.toString())
            const res = await fetch(`/api/projects?${params}`)
            if (!res.ok) throw new Error("Failed to fetch")
            return res.json()
        },
    })

    const projects = data?.data || []
    const pagination = data?.pagination || { page: 1, limit: ITEMS_PER_PAGE, total: 0, totalPages: 1 }

    // Get unique client names for dropdown filter
    const { data: allProjectsData } = useQuery({
        queryKey: ["projects-clients"],
        queryFn: async () => {
            const res = await fetch("/api/projects")
            if (!res.ok) throw new Error("Failed")
            return res.json()
        },
    })

    const uniqueClients = useMemo(() => {
        const clients = (allProjectsData?.data || [])
            .map((p: any) => p.client)
            .filter((c: any) => c && c.trim() !== "")
        return [...new Set(clients)].sort() as string[]
    }, [allProjectsData])

    // Reset page on filter change
    const handleFilterChange = (setter: (v: string) => void, value: string) => {
        setter(value)
        setPage(1)
    }

    const toggleSort = (field: string) => {
        if (sortField === field) {
            setSortDir(sortDir === "asc" ? "desc" : "asc")
        } else {
            setSortField(field)
            setSortDir("asc")
        }
    }

    // Sort projects client-side (since backend sort is basic)
    const sortedProjects = useMemo(() => {
        return [...projects].sort((a: any, b: any) => {
            let aVal = a[sortField]
            let bVal = b[sortField]

            if (sortField === "deadline") {
                aVal = aVal ? new Date(aVal).getTime() : Infinity
                bVal = bVal ? new Date(bVal).getTime() : Infinity
            }

            if (typeof aVal === "string") aVal = aVal.toLowerCase()
            if (typeof bVal === "string") bVal = bVal.toLowerCase()

            if (aVal < bVal) return sortDir === "asc" ? -1 : 1
            if (aVal > bVal) return sortDir === "asc" ? 1 : -1
            return 0
        })
    }, [projects, sortField, sortDir])

    const SortHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
        <button
            onClick={() => toggleSort(field)}
            className="group inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-gray-400 hover:text-gray-200"
        >
            {children}
            <ArrowUpDown className={cn(
                "h-3 w-3 transition-colors",
                sortField === field ? "text-primary-400" : "text-gray-600 group-hover:text-gray-400"
            )} />
        </button>
    )

    return (
        <div className="space-y-4">
            {/* Table Filters */}
            <div className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4 sm:flex-row sm:items-center">
                <div className="relative flex-1 sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                        placeholder="Search name, client, stack..."
                        value={search}
                        onChange={(e) => handleFilterChange(setSearch, e.target.value)}
                        className="pl-10"
                    />
                </div>
                <select
                    value={clientFilter}
                    onChange={(e) => handleFilterChange(setClientFilter, e.target.value)}
                    className="h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100 focus:border-primary-500 focus:outline-none"
                >
                    <option value="">All Clients</option>
                    {uniqueClients.map((c) => (
                        <option key={c} value={c}>{c}</option>
                    ))}
                </select>
                <select
                    value={statusFilter}
                    onChange={(e) => handleFilterChange(setStatusFilter, e.target.value)}
                    className="h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100 focus:border-primary-500 focus:outline-none"
                >
                    <option value="">All Status</option>
                    <option value="PLANNING">Planning</option>
                    <option value="ACTIVE">Active</option>
                    <option value="ON_HOLD">On Hold</option>
                    <option value="REVIEW">Review</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                </select>
                <select
                    value={categoryFilter}
                    onChange={(e) => handleFilterChange(setCategoryFilter, e.target.value)}
                    className="h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100 focus:border-primary-500 focus:outline-none"
                >
                    <option value="">All Category</option>
                    <option value="CLIENT">👤 Client</option>
                    <option value="OWN">🚀 Own Project</option>
                </select>
                <div className="text-sm text-gray-400">
                    {pagination.total} project{pagination.total !== 1 ? "s" : ""}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px]">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/80">
                                <th className="px-4 py-3 text-left">
                                    <SortHeader field="name">Project</SortHeader>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <SortHeader field="client">Client</SortHeader>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Category</span>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Status</span>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <SortHeader field="progress">Progress</SortHeader>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <SortHeader field="deadline">Deadline</SortHeader>
                                </th>
                                <th className="px-4 py-3 text-left">
                                    <SortHeader field="totalValue">Value</SortHeader>
                                </th>
                                <th className="px-4 py-3 text-right">
                                    <span className="text-xs font-medium uppercase tracking-wider text-gray-400">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <td key={j} className="px-4 py-3">
                                                <div className="h-4 animate-pulse rounded bg-gray-800" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : sortedProjects.length > 0 ? (
                                sortedProjects.map((project: any) => {
                                    const isOwnProject = project.category === "OWN"
                                    const daysLeft = project.deadline ? getDaysUntil(project.deadline) : null
                                    const isOverdue = daysLeft !== null && daysLeft < 0

                                    return (
                                        <tr
                                            key={project.id}
                                            className="group transition-colors hover:bg-gray-800/40"
                                        >
                                            {/* Project Name */}
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-2.5 w-2.5 flex-shrink-0 rounded-full"
                                                        style={{ backgroundColor: project.color || (isOwnProject ? "#10B981" : "#F59E0B") }}
                                                    />
                                                    <Link
                                                        href={`/projects/${project.id}`}
                                                        className="font-medium text-gray-100 hover:text-primary-400"
                                                    >
                                                        {project.name}
                                                    </Link>
                                                    {project.liveUrl && (
                                                        <a
                                                            href={project.liveUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-gray-500 opacity-0 transition-opacity hover:text-primary-400 group-hover:opacity-100"
                                                        >
                                                            <ExternalLink className="h-3 w-3" />
                                                        </a>
                                                    )}
                                                </div>
                                                {project.stack && (
                                                    <p className="mt-0.5 text-xs text-gray-500">{project.stack}</p>
                                                )}
                                            </td>

                                            {/* Client */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-300">{project.client || "—"}</span>
                                            </td>

                                            {/* Category */}
                                            <td className="px-4 py-3">
                                                <span
                                                    className={cn(
                                                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                                                        isOwnProject
                                                            ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30"
                                                            : "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30"
                                                    )}
                                                >
                                                    {isOwnProject ? (
                                                        <><Rocket className="h-3 w-3" /> Own</>
                                                    ) : (
                                                        <><User className="h-3 w-3" /> Client</>
                                                    )}
                                                </span>
                                            </td>

                                            {/* Status */}
                                            <td className="px-4 py-3">
                                                <StatusBadge status={project.status} />
                                            </td>

                                            {/* Progress */}
                                            <td className="px-4 py-3">
                                                <div className="w-24">
                                                    <Progress value={project.progress} showLabel />
                                                </div>
                                            </td>

                                            {/* Deadline */}
                                            <td className="px-4 py-3">
                                                {project.deadline ? (
                                                    <div>
                                                        <span className={cn(
                                                            "text-sm",
                                                            isOverdue ? "text-red-400" : "text-gray-300"
                                                        )}>
                                                            {formatDate(project.deadline)}
                                                        </span>
                                                        {daysLeft !== null && (
                                                            <p className={cn(
                                                                "text-xs",
                                                                isOverdue ? "text-red-400/70" : daysLeft <= 7 ? "text-yellow-400/70" : "text-gray-500"
                                                            )}>
                                                                {isOverdue ? "Overdue" : `${daysLeft}d left`}
                                                            </p>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-gray-500">—</span>
                                                )}
                                            </td>

                                            {/* Value */}
                                            <td className="px-4 py-3">
                                                <span className="text-sm text-gray-300">{formatCurrency(project.totalValue)}</span>
                                                {project.paidAmount > 0 && project.totalValue > 0 && (
                                                    <p className="text-xs text-green-400">
                                                        {Math.round((project.paidAmount / project.totalValue) * 100)}% paid
                                                    </p>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                                    <button
                                                        onClick={() => onEdit(project)}
                                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => onDelete(project)}
                                                        className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/20 hover:text-red-400"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-4 py-12 text-center text-gray-500">
                                        No projects found matching your filters
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-800 px-4 py-3">
                        <span className="text-sm text-gray-400">
                            Showing {(pagination.page - 1) * pagination.limit + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
                        </span>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setPage(1)}
                                disabled={page === 1}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
                                title="First page"
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
                                title="Previous page"
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </button>

                            {/* Page numbers */}
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                                .filter(p => {
                                    if (pagination.totalPages <= 7) return true
                                    if (p === 1 || p === pagination.totalPages) return true
                                    if (Math.abs(p - page) <= 1) return true
                                    return false
                                })
                                .reduce((acc: (number | string)[], p, idx, arr) => {
                                    if (idx > 0 && typeof arr[idx - 1] === 'number' && (p as number) - (arr[idx - 1] as number) > 1) {
                                        acc.push("...")
                                    }
                                    acc.push(p)
                                    return acc
                                }, [])
                                .map((p, idx) =>
                                    typeof p === "string" ? (
                                        <span key={`dots-${idx}`} className="px-1 text-gray-600">…</span>
                                    ) : (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p as number)}
                                            className={cn(
                                                "min-w-[32px] rounded-lg px-2 py-1 text-sm font-medium",
                                                page === p
                                                    ? "bg-primary-500/20 text-primary-400"
                                                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                                            )}
                                        >
                                            {p}
                                        </button>
                                    )
                                )}

                            <button
                                onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                                disabled={page === pagination.totalPages}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
                                title="Next page"
                            >
                                <ChevronRight className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setPage(pagination.totalPages)}
                                disabled={page === pagination.totalPages}
                                className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-800 hover:text-gray-200 disabled:opacity-30 disabled:hover:bg-transparent"
                                title="Last page"
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
