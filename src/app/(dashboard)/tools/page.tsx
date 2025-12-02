"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search, Filter, ExternalLink, Download, Grid, List } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { RightPanel } from "@/components/ui/right-panel"
import { toast } from "react-hot-toast"

const pricingLabels: Record<string, { label: string; color: string }> = {
  FREE: { label: "Free", color: "bg-green-500/20 text-green-400" },
  FREEMIUM: { label: "Freemium", color: "bg-blue-500/20 text-blue-400" },
  FREE_TRIAL: { label: "Free Trial", color: "bg-yellow-500/20 text-yellow-400" },
  PAY_PER_USE: { label: "Pay per Use", color: "bg-purple-500/20 text-purple-400" },
  SUBSCRIPTION: { label: "Subscription", color: "bg-orange-500/20 text-orange-400" },
  ENTERPRISE: { label: "Enterprise", color: "bg-red-500/20 text-red-400" },
  OPEN_SOURCE: { label: "Open Source", color: "bg-emerald-500/20 text-emerald-400" },
}

export default function ToolsPage() {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const [pricingFilter, setPricingFilter] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [page, setPage] = useState(1)

  const queryClient = useQueryClient()

  const { data: categories } = useQuery({
    queryKey: ["tool-categories"],
    queryFn: async () => {
      const res = await fetch("/api/tool-categories")
      return res.json()
    },
  })

  const { data: tools, isLoading } = useQuery({
    queryKey: ["tools", search, categoryFilter, pricingFilter, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (categoryFilter) params.set("category", categoryFilter)
      if (pricingFilter) params.set("pricing", pricingFilter)
      params.set("page", page.toString())
      params.set("limit", "24")
      const res = await fetch(`/api/tools?${params}`)
      return res.json()
    },
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tools"] })
      toast.success("Tool added!")
      setIsAddOpen(false)
    },
    onError: (err: Error) => toast.error(err.message),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    createMutation.mutate({
      name: formData.get("name"),
      url: formData.get("url"),
      downloadUrl: formData.get("downloadUrl") || null,
      description: formData.get("description") || null,
      pricing: formData.get("pricing"),
      categoryId: formData.get("categoryId"),
      notes: formData.get("notes") || null,
    })
  }

  const pagination = tools?.pagination || { page: 1, totalPages: 1, totalCount: 0 }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">AI Tools Directory</h1>
          <p className="mt-1 text-gray-400">
            Browse and discover AI tools ({pagination.totalCount} tools)
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Tool
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search tools..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            className="pl-10"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100"
        >
          <option value="">All Categories</option>
          {categories?.data?.map((cat: any) => (
            <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
          ))}
        </select>
        <select
          value={pricingFilter}
          onChange={(e) => { setPricingFilter(e.target.value); setPage(1) }}
          className="h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100"
        >
          <option value="">All Pricing</option>
          {Object.entries(pricingLabels).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
        <div className="flex rounded-lg border border-gray-700 overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 ${viewMode === "grid" ? "bg-primary-500 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            <Grid className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 ${viewMode === "list" ? "bg-primary-500 text-white" : "bg-gray-800 text-gray-400"}`}
          >
            <List className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Tools Grid/List */}
      {isLoading ? (
        <div className={viewMode === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "space-y-2"}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-full" />
              <Skeleton className="mt-4 h-6 w-20" />
            </div>
          ))}
        </div>
      ) : tools?.data?.length > 0 ? (
        viewMode === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {tools.data.map((tool: any) => (
              <div key={tool.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-100 truncate">{tool.name}</h3>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs ${pricingLabels[tool.pricing]?.color || "bg-gray-800 text-gray-400"}`}>
                    {pricingLabels[tool.pricing]?.label || tool.pricing}
                  </span>
                </div>
                {tool.description && (
                  <p className="mt-2 text-sm text-gray-400 line-clamp-2">{tool.description}</p>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <span style={{ color: tool.category?.color }}>{tool.category?.icon}</span>
                  <span>{tool.category?.name}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <a
                    href={tool.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 rounded-lg bg-gray-800 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Visit
                  </a>
                  {tool.downloadUrl && (
                    <a
                      href={tool.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 rounded-lg bg-primary-500/20 px-3 py-1.5 text-xs text-primary-400 hover:bg-primary-500/30"
                    >
                      <Download className="h-3 w-3" />
                      Download
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {tools.data.map((tool: any) => (
              <div key={tool.id} className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-4 hover:border-gray-700 transition-colors">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-100">{tool.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${pricingLabels[tool.pricing]?.color || "bg-gray-800 text-gray-400"}`}>
                      {pricingLabels[tool.pricing]?.label}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate">{tool.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                    <span>{tool.category?.icon} {tool.category?.name}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <a href={tool.url} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-gray-800 p-2 text-gray-400 hover:bg-gray-700">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  {tool.downloadUrl && (
                    <a href={tool.downloadUrl} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-primary-500/20 p-2 text-primary-400 hover:bg-primary-500/30">
                      <Download className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="rounded-xl border border-dashed border-gray-800 py-16 text-center">
          <p className="text-gray-500">No tools found. Be the first to add one!</p>
          <Button onClick={() => setIsAddOpen(true)} variant="outline" className="mt-4">
            <Plus className="mr-2 h-4 w-4" />
            Add Tool
          </Button>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">
            Page {page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage(page - 1)} disabled={page === 1}>
              Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => setPage(page + 1)} disabled={page === pagination.totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Add Tool Panel */}
      <RightPanel
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Add AI Tool"
        width="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Name *</label>
            <Input name="name" required placeholder="e.g. ChatGPT" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">URL *</label>
            <Input name="url" type="url" required placeholder="https://..." />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Download URL</label>
            <Input name="downloadUrl" type="url" placeholder="https://..." />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Category *</label>
            <select
              name="categoryId"
              required
              className="h-10 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100"
            >
              <option value="">Select category...</option>
              {categories?.data?.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.icon} {cat.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Pricing *</label>
            <select
              name="pricing"
              required
              className="h-10 w-full rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100"
            >
              {Object.entries(pricingLabels).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              rows={2}
              placeholder="Brief description..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Notes</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Additional notes..."
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-gray-100"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Adding..." : "Add Tool"}
            </Button>
          </div>
        </form>
      </RightPanel>
    </div>
  )
}
