"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Search, Trash2, Edit, Users, Key } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { RightPanel } from "@/components/ui/right-panel"
import { toast } from "react-hot-toast"

export default function AdminPlatformsPage() {
  const [search, setSearch] = useState("")
  const [selectedPlatform, setSelectedPlatform] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ["admin-platforms", search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      const res = await fetch(`/api/admin/platforms?${params}`)
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ slug, data }: { slug: string; data: any }) => {
      const res = await fetch(`/api/admin/platforms/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to update")
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-platforms"] })
      toast.success(data.message)
      setIsEditOpen(false)
      setSelectedPlatform(null)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const deleteMutation = useMutation({
    mutationFn: async (slug: string) => {
      const res = await fetch(`/api/admin/platforms/${slug}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed to delete")
      return res.json()
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-platforms"] })
      toast.success(data.message)
    },
    onError: (error: Error) => toast.error(error.message),
  })

  const handleEdit = (platform: any) => {
    setSelectedPlatform(platform)
    setIsEditOpen(true)
  }

  const handleDelete = (platform: any) => {
    if (confirm(`Delete platform "${platform.name}"? This will delete all API keys using this platform across all users.`)) {
      deleteMutation.mutate(platform.slug)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    updateMutation.mutate({
      slug: selectedPlatform.slug,
      data: {
        name: formData.get("name"),
        website: formData.get("website") || null,
        color: formData.get("color"),
      },
    })
  }

  const platforms = data?.data || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Platforms</h1>
        <p className="mt-1 text-gray-400">
          Manage API platforms across all users 
          <span className="ml-2 text-gray-500">
            ({data?.uniquePlatforms || 0} unique, {data?.totalPlatforms || 0} total)
          </span>
        </p>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="Search platforms..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="mt-4 h-4 w-24" />
              <Skeleton className="mt-2 h-4 w-20" />
            </div>
          ))
        ) : platforms.length > 0 ? (
          platforms.map((platform: any) => (
            <div key={platform.slug} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: platform.color || "#6366F1" }}
                  />
                  <h3 className="font-medium text-gray-100">{platform.name}</h3>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(platform)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(platform)}
                    className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Users className="h-4 w-4" />
                  <span>{platform.userCount} users</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-400">
                  <Key className="h-4 w-4" />
                  <span>{platform.apiKeyCount} keys</span>
                </div>
              </div>

              {platform.website && (
                <a
                  href={platform.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 block truncate text-xs text-primary-400 hover:underline"
                >
                  {platform.website}
                </a>
              )}
            </div>
          ))
        ) : (
          <div className="col-span-full rounded-xl border border-dashed border-gray-800 py-16 text-center">
            <p className="text-gray-500">No platforms found</p>
          </div>
        )}
      </div>

      {/* Edit Panel */}
      <RightPanel
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setSelectedPlatform(null) }}
        title="Edit Platform"
        width="sm"
      >
        {selectedPlatform && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Name</label>
              <Input name="name" defaultValue={selectedPlatform.name} required />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Website</label>
              <Input name="website" defaultValue={selectedPlatform.website || ""} placeholder="https://..." />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">Color</label>
              <div className="flex gap-2">
                <input
                  type="color"
                  name="color"
                  defaultValue={selectedPlatform.color || "#6366F1"}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-700 bg-gray-800"
                />
              </div>
            </div>

            <div className="rounded-lg bg-yellow-500/10 p-3 text-xs text-yellow-400">
              Note: Changes will apply to all {selectedPlatform.userCount} users using this platform.
            </div>

            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1" 
                onClick={() => { setIsEditOpen(false); setSelectedPlatform(null) }}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        )}
      </RightPanel>
    </div>
  )
}
