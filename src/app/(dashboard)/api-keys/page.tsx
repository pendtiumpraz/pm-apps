"use client"

import { useState, useRef } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Plus,
  Search,
  Upload,
  Download,
  Eye,
  EyeOff,
  Copy,
  MoreVertical,
  Edit,
  Trash2,
  Check,
  Key,
  DollarSign,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RightPanel } from "@/components/ui/right-panel"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "react-hot-toast"
import { formatCurrency } from "@/lib/utils"

// Mask API key for display
function maskApiKey(key: string) {
  if (key.length <= 8) return key.slice(0, 4) + "..."
  return key.slice(0, 4) + "..." + key.slice(-4)
}

// CSV Template
const CSV_TEMPLATE = `platform,email,password,loginMethod,apiKey,creditTotal,creditUsed,tokenTotal,tokenUsed,referralCode,referralLink,notes
Groq,user@example.com,password123,email,gsk_xxxxxxxxxxxx,10,0,0,0,REF123,https://groq.com/ref/123,My first key
Hyperbolic,user2@example.com,,google,hyp_xxxxxxxxxxxx,0,0,1000000,50000,,,Token based account`

export default function ApiKeysPage() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isPlatformFormOpen, setIsPlatformFormOpen] = useState(false)
  const [selectedKey, setSelectedKey] = useState<any>(null)
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null)
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [platformFilter, setPlatformFilter] = useState("")
  const [page, setPage] = useState(1)
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const limit = 20

  // Debounce search
  useState(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300)
    return () => clearTimeout(timer)
  })

  const queryClient = useQueryClient()

  // Fetch platforms
  const { data: platformsData } = useQuery({
    queryKey: ["platforms"],
    queryFn: async () => {
      const res = await fetch("/api/platforms")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  // Fetch API keys
  const { data, isLoading } = useQuery({
    queryKey: ["api-keys", platformFilter, debouncedSearch, page],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (platformFilter) params.set("platformId", platformFilter)
      if (debouncedSearch) params.set("search", debouncedSearch)
      params.set("page", page.toString())
      params.set("limit", limit.toString())
      const res = await fetch(`/api/api-keys?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  // Reset page when filters change
  const handleSearch = (value: string) => {
    setSearch(value)
    setDebouncedSearch(value)
    setPage(1)
  }

  const handlePlatformFilter = (value: string) => {
    setPlatformFilter(value)
    setPage(1)
  }

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
      queryClient.invalidateQueries({ queryKey: ["platforms"] })
      toast.success("API Key added!")
      handleCloseForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/api-keys/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
      toast.success("API Key updated!")
      handleCloseForm()
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/api-keys/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
      queryClient.invalidateQueries({ queryKey: ["platforms"] })
      toast.success("API Key deleted!")
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (rows: any[]) => {
      const res = await fetch("/api/api-keys/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to import")
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
      queryClient.invalidateQueries({ queryKey: ["platforms"] })
      toast.success(data.message)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  // Platform mutations
  const createPlatformMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/platforms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to create")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platforms"] })
      toast.success("Platform added!")
      setIsPlatformFormOpen(false)
      setSelectedPlatform(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const updatePlatformMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`/api/platforms/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["platforms"] })
      queryClient.invalidateQueries({ queryKey: ["api-keys"] })
      toast.success("Platform updated!")
      setIsPlatformFormOpen(false)
      setSelectedPlatform(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })



  const handleOpenForm = (key?: any) => {
    setSelectedKey(key || null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setSelectedKey(null)
    setIsFormOpen(false)
  }

  const handleOpenPlatformForm = (platform?: any) => {
    setSelectedPlatform(platform || null)
    setIsPlatformFormOpen(true)
  }

  const handleClosePlatformForm = () => {
    setSelectedPlatform(null)
    setIsPlatformFormOpen(false)
  }

  const handlePlatformSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      name: formData.get("name"),
      website: formData.get("website") || null,
      color: formData.get("color") || "#6366F1",
      description: formData.get("description") || null,
    }

    if (selectedPlatform) {
      await updatePlatformMutation.mutateAsync({ id: selectedPlatform.id, data })
    } else {
      await createPlatformMutation.mutateAsync(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const data = {
      platformId: formData.get("platformId"),
      email: formData.get("email"),
      password: formData.get("password") || null,
      loginMethod: formData.get("loginMethod") || null,
      apiKey: formData.get("apiKey"),
      creditTotal: parseFloat(formData.get("creditTotal") as string) || 0,
      creditUsed: parseFloat(formData.get("creditUsed") as string) || 0,
      tokenTotal: parseFloat(formData.get("tokenTotal") as string) || 0,
      tokenUsed: parseFloat(formData.get("tokenUsed") as string) || 0,
      referralCode: formData.get("referralCode") || null,
      referralLink: formData.get("referralLink") || null,
      notes: formData.get("notes") || null,
    }

    if (selectedKey) {
      await updateMutation.mutateAsync({ id: selectedKey.id, data })
    } else {
      await createMutation.mutateAsync(data)
    }
  }

  const handleDelete = (key: any) => {
    if (confirm(`Delete API key for ${key.email}?`)) {
      deleteMutation.mutate(key.id)
    }
  }

  const toggleKeyVisibility = (id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
    toast.success("Copied to clipboard!")
  }

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "api-keys-template.csv"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const lines = text.split("\n").filter((line) => line.trim())
      
      if (lines.length < 2) {
        toast.error("CSV must have header and at least one data row")
        return
      }

      const headers = lines[0].split(",").map((h) => h.trim())

      const rows = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim())
        const row: any = {}
        headers.forEach((h, i) => {
          row[h] = values[i] || ""
        })
        return row
      }).filter(row => row.email) // Filter out empty rows

      if (rows.length === 0) {
        toast.error("No valid data found in CSV")
        return
      }

      await importMutation.mutateAsync(rows)
    } catch (error: any) {
      console.error("CSV import error:", error)
      toast.error(error.message || "Failed to import CSV")
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const platforms = platformsData?.data || []
  const apiKeys = data?.data || []
  const pagination = data?.pagination || { page: 1, limit: 20, totalCount: 0, totalPages: 0 }
  const totals = data?.totals || { 
    count: 0, 
    creditTotal: 0, 
    creditUsed: 0, 
    creditRemaining: 0,
    tokenTotal: 0,
    tokenUsed: 0,
    tokenRemaining: 0,
  }

  // Format large numbers
  const formatTokens = (num: number) => {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">API Keys</h1>
          <p className="mt-1 text-gray-400">Manage your free API keys amunisi</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4" /> Template
          </Button>
          <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import CSV
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
          <Button onClick={() => handleOpenForm()}>
            <Plus className="h-4 w-4" /> Add Key
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4 lg:grid-cols-7">
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-500/10 p-2">
              <Key className="h-5 w-5 text-primary-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{totals.count}</p>
              <p className="text-sm text-gray-400">Total Keys</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-green-500/10 p-2">
              <DollarSign className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">${totals.creditTotal.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Credit Total</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-yellow-500/10 p-2">
              <DollarSign className="h-5 w-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">${totals.creditUsed.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Credit Used</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-500/10 p-2">
              <DollarSign className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">${totals.creditRemaining.toFixed(2)}</p>
              <p className="text-sm text-gray-400">Credit Left</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-purple-500/10 p-2">
              <Zap className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{formatTokens(totals.tokenTotal)}</p>
              <p className="text-sm text-gray-400">Token Total</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-orange-500/10 p-2">
              <Zap className="h-5 w-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{formatTokens(totals.tokenUsed)}</p>
              <p className="text-sm text-gray-400">Token Used</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-cyan-500/10 p-2">
              <Zap className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-100">{formatTokens(totals.tokenRemaining)}</p>
              <p className="text-sm text-gray-400">Token Left</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="Search by email or platform..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={platformFilter}
          onChange={(e) => handlePlatformFilter(e.target.value)}
          className="h-10 rounded-lg border border-gray-700 bg-gray-800 px-3 text-sm text-gray-100"
        >
          <option value="">All Platforms</option>
          {platforms.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name} ({p._count?.apiKeys || 0})
            </option>
          ))}
        </select>
        <Button variant="outline" onClick={() => handleOpenPlatformForm()}>
          <Plus className="h-4 w-4" /> Platform
        </Button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-800">
        <table className="w-full">
          <thead className="border-b border-gray-800 bg-gray-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Platform</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Email</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">API Key</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Credit ($)</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Tokens</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Referral</th>
              <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-24" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-40" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-32" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-16" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-20" /></td>
                  <td className="px-4 py-3"><Skeleton className="h-6 w-8" /></td>
                </tr>
              ))
            ) : apiKeys.length > 0 ? (
              apiKeys.map((key: any) => (
                <tr key={key.id} className="hover:bg-gray-900/50">
                  <td className="px-4 py-3">
                    <span
                      className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium"
                      style={{ backgroundColor: `${key.platform.color}20`, color: key.platform.color, borderColor: `${key.platform.color}40` }}
                    >
                      {key.platform.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="text-sm text-gray-100">{key.email}</p>
                      {key.loginMethod && (
                        <p className="text-xs text-gray-500">via {key.loginMethod}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {key.apiKey ? (
                      <div className="flex items-center gap-2">
                        <code className="rounded bg-gray-800 px-2 py-1 text-xs text-gray-300">
                          {visibleKeys.has(key.id) ? key.apiKey : maskApiKey(key.apiKey)}
                        </code>
                        <button
                          onClick={() => toggleKeyVisibility(key.id)}
                          className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                        >
                          {visibleKeys.has(key.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => copyToClipboard(key.apiKey, key.id)}
                          className="rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                        >
                          {copiedId === key.id ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500 italic">CLI login only</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <span className="text-green-400">${key.creditTotal.toFixed(2)}</span>
                      <span className="text-gray-600 mx-1">/</span>
                      <span className="text-yellow-400">${key.creditUsed.toFixed(2)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-xs">
                      <span className="text-purple-400">{formatTokens(key.tokenTotal)}</span>
                      <span className="text-gray-600 mx-1">/</span>
                      <span className="text-orange-400">{formatTokens(key.tokenUsed)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {key.referralCode ? (
                      <button
                        onClick={() => copyToClipboard(key.referralCode, `ref-${key.id}`)}
                        className="text-xs text-primary-400 hover:underline"
                      >
                        {key.referralCode}
                      </button>
                    ) : (
                      <span className="text-xs text-gray-600">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenForm(key)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(key)}
                        className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-gray-500">
                  No API keys found. Add your first key!
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
            Showing {(page - 1) * limit + 1} - {Math.min(page * limit, pagination.totalCount)} of {pagination.totalCount}
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
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                let pageNum
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1
                } else if (page <= 3) {
                  pageNum = i + 1
                } else if (page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i
                } else {
                  pageNum = page - 2 + i
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`h-8 w-8 rounded text-sm ${
                      page === pageNum
                        ? "bg-primary-500 text-white"
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
              disabled={page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Form Panel */}
      <RightPanel
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedKey ? "Edit API Key" : "Add API Key"}
        width="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Platform *</label>
            <select
              name="platformId"
              defaultValue={selectedKey?.platformId || ""}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100"
            >
              <option value="">Select Platform</option>
              {platforms.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Email *</label>
            <Input name="email" type="email" defaultValue={selectedKey?.email || ""} required />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Password</label>
              <Input name="password" type="text" defaultValue={selectedKey?.password || ""} placeholder="Optional" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Login Method</label>
              <Input name="loginMethod" defaultValue={selectedKey?.loginMethod || ""} placeholder="e.g., Google, GitHub" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">API Key</label>
            <Input name="apiKey" defaultValue={selectedKey?.apiKey || ""} placeholder="Optional (e.g., for CLI-based platforms)" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Credit Total ($)</label>
              <Input name="creditTotal" type="number" step="0.01" defaultValue={selectedKey?.creditTotal || 0} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Credit Used ($)</label>
              <Input name="creditUsed" type="number" step="0.01" defaultValue={selectedKey?.creditUsed || 0} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Token Total</label>
              <Input name="tokenTotal" type="number" step="1" defaultValue={selectedKey?.tokenTotal || 0} placeholder="e.g., 1000000" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Token Used</label>
              <Input name="tokenUsed" type="number" step="1" defaultValue={selectedKey?.tokenUsed || 0} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Referral Code</label>
              <Input name="referralCode" defaultValue={selectedKey?.referralCode || ""} placeholder="Optional" />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Referral Link</label>
              <Input name="referralLink" defaultValue={selectedKey?.referralLink || ""} placeholder="Optional" />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Notes</label>
            <textarea
              name="notes"
              rows={3}
              defaultValue={selectedKey?.notes || ""}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 placeholder-gray-500"
              placeholder="Optional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={handleCloseForm}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {createMutation.isPending || updateMutation.isPending ? "Saving..." : selectedKey ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </RightPanel>

      {/* Platform Form Panel */}
      <RightPanel
        isOpen={isPlatformFormOpen}
        onClose={handleClosePlatformForm}
        title={selectedPlatform ? "Edit Platform" : "Add Platform"}
        width="sm"
      >
        <form onSubmit={handlePlatformSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Name *</label>
            <Input name="name" defaultValue={selectedPlatform?.name || ""} required placeholder="e.g., OpenAI" />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Website</label>
            <Input name="website" defaultValue={selectedPlatform?.website || ""} placeholder="https://..." />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Color</label>
            <div className="flex gap-2">
              <input
                type="color"
                name="color"
                defaultValue={selectedPlatform?.color || "#6366F1"}
                className="h-10 w-14 cursor-pointer rounded border border-gray-700 bg-gray-800"
              />
              <Input
                name="colorHex"
                defaultValue={selectedPlatform?.color || "#6366F1"}
                className="flex-1"
                placeholder="#6366F1"
                onChange={(e) => {
                  const colorInput = e.target.previousElementSibling as HTMLInputElement
                  if (colorInput) colorInput.value = e.target.value
                }}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
            <textarea
              name="description"
              rows={2}
              defaultValue={selectedPlatform?.description || ""}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-gray-100 placeholder-gray-500"
              placeholder="Optional description..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={handleClosePlatformForm}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createPlatformMutation.isPending || updatePlatformMutation.isPending}>
              {createPlatformMutation.isPending || updatePlatformMutation.isPending ? "Saving..." : selectedPlatform ? "Update" : "Create"}
            </Button>
          </div>
        </form>

        {/* Platform List */}
        <div className="mt-8 border-t border-gray-800 pt-6">
          <h4 className="mb-4 text-sm font-medium text-gray-300">Existing Platforms</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {platforms.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between rounded-lg bg-gray-800/50 px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-sm text-gray-200">{p.name}</span>
                  <span className="text-xs text-gray-500">({p._count?.apiKeys || 0})</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleOpenPlatformForm(p)}
                  className="rounded p-1 text-gray-500 hover:bg-gray-700 hover:text-gray-300"
                >
                  <Edit className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </RightPanel>
    </div>
  )
}
