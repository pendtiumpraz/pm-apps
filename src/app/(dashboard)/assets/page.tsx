"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Globe, Server, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RightPanel } from "@/components/ui/right-panel"
import { DomainForm } from "@/components/forms/domain-form"
import { HostingForm } from "@/components/forms/hosting-form"
import { StatusBadge, Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency, formatDate, getDaysUntil } from "@/lib/utils"
import { toast } from "react-hot-toast"
import type { DomainInput, HostingInput } from "@/lib/validations/project"

export default function AssetsPage() {
  const [tab, setTab] = useState<"domains" | "hostings">("domains")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)

  const queryClient = useQueryClient()

  // Fetch domains
  const { data: domainsData, isLoading: domainsLoading } = useQuery({
    queryKey: ["domains"],
    queryFn: async () => {
      const res = await fetch("/api/domains")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    enabled: tab === "domains",
  })

  // Fetch hostings
  const { data: hostingsData, isLoading: hostingsLoading } = useQuery({
    queryKey: ["hostings"],
    queryFn: async () => {
      const res = await fetch("/api/hostings")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
    enabled: tab === "hostings",
  })

  // Domain mutations
  const createDomain = useMutation({
    mutationFn: async (data: DomainInput) => {
      const res = await fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] })
      toast.success("Domain added!")
      handleCloseForm()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateDomain = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DomainInput> }) => {
      const res = await fetch(`/api/domains/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] })
      toast.success("Domain updated!")
      handleCloseForm()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteDomain = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/domains/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] })
      toast.success("Domain deleted!")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  // Hosting mutations
  const createHosting = useMutation({
    mutationFn: async (data: HostingInput) => {
      const res = await fetch("/api/hostings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostings"] })
      toast.success("Hosting added!")
      handleCloseForm()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const updateHosting = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<HostingInput> }) => {
      const res = await fetch(`/api/hostings/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostings"] })
      toast.success("Hosting updated!")
      handleCloseForm()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteHosting = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/hostings/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error((await res.json()).error || "Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hostings"] })
      toast.success("Hosting deleted!")
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const handleOpenForm = (item?: any) => {
    setSelectedItem(item || null)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setSelectedItem(null)
    setIsFormOpen(false)
  }

  const handleDomainSubmit = async (data: DomainInput) => {
    if (selectedItem) {
      await updateDomain.mutateAsync({ id: selectedItem.id, data })
    } else {
      await createDomain.mutateAsync(data)
    }
  }

  const handleHostingSubmit = async (data: HostingInput) => {
    if (selectedItem) {
      await updateHosting.mutateAsync({ id: selectedItem.id, data })
    } else {
      await createHosting.mutateAsync(data)
    }
  }

  const handleDeleteDomain = (item: any) => {
    if (confirm(`Delete domain "${item.domainName}"?`)) deleteDomain.mutate(item.id)
  }

  const handleDeleteHosting = (item: any) => {
    if (confirm(`Delete hosting "${item.provider}"?`)) deleteHosting.mutate(item.id)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Assets</h1>
          <p className="mt-1 text-gray-400">Manage domains and hosting</p>
        </div>
        <Button onClick={() => handleOpenForm()}>
          <Plus className="h-4 w-4" /> Add {tab === "domains" ? "Domain" : "Hosting"}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-800">
        <button
          onClick={() => setTab("domains")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "domains"
              ? "border-b-2 border-primary-500 text-primary-400"
              : "text-gray-400 hover:text-gray-100"
          }`}
        >
          <Globe className="h-4 w-4" /> Domains
        </button>
        <button
          onClick={() => setTab("hostings")}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
            tab === "hostings"
              ? "border-b-2 border-primary-500 text-primary-400"
              : "text-gray-400 hover:text-gray-100"
          }`}
        >
          <Server className="h-4 w-4" /> Hosting
        </button>
      </div>

      {/* Domains Table */}
      {tab === "domains" && (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full">
            <thead className="border-b border-gray-800 bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Domain</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Registrar</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {domainsLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : domainsData?.data?.length > 0 ? (
                domainsData.data.map((domain: any) => {
                  const daysLeft = getDaysUntil(domain.expiryDate)
                  const isExpiring = daysLeft <= 30 && daysLeft > 0
                  const isExpired = daysLeft < 0
                  return (
                    <tr key={domain.id} className="hover:bg-gray-900/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-100">{domain.domainName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{domain.project?.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{domain.registrar || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm ${isExpired ? "text-red-400" : isExpiring ? "text-yellow-400" : "text-gray-400"}`}>
                            {formatDate(domain.expiryDate)}
                          </span>
                          {isExpiring && (
                            <Badge variant="warning" size="sm">
                              <AlertTriangle className="mr-1 h-3 w-3" /> {daysLeft}d
                            </Badge>
                          )}
                          {isExpired && <Badge variant="danger" size="sm">Expired</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={domain.status} /></td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleOpenForm(domain)} className="mr-2 text-sm text-primary-400 hover:text-primary-300">Edit</button>
                        <button onClick={() => handleDeleteDomain(domain)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No domains found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Hostings Table */}
      {tab === "hostings" && (
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full">
            <thead className="border-b border-gray-800 bg-gray-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-400">Cost</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {hostingsLoading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[1, 2, 3, 4, 5, 6].map((j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : hostingsData?.data?.length > 0 ? (
                hostingsData.data.map((hosting: any) => {
                  const daysLeft = hosting.expiryDate ? getDaysUntil(hosting.expiryDate) : null
                  const isExpiring = daysLeft !== null && daysLeft <= 30 && daysLeft > 0
                  return (
                    <tr key={hosting.id} className="hover:bg-gray-900/50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Server className="h-4 w-4 text-gray-500" />
                          <div>
                            <span className="text-sm font-medium text-gray-100">{hosting.provider}</span>
                            {hosting.planName && <p className="text-xs text-gray-500">{hosting.planName}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">{hosting.project?.name}</td>
                      <td className="px-4 py-3"><Badge variant="default" size="sm">{hosting.serverType}</Badge></td>
                      <td className="px-4 py-3">
                        {hosting.expiryDate ? (
                          <div className="flex items-center gap-2">
                            <span className={`text-sm ${isExpiring ? "text-yellow-400" : "text-gray-400"}`}>
                              {formatDate(hosting.expiryDate)}
                            </span>
                            {isExpiring && <Badge variant="warning" size="sm">{daysLeft}d</Badge>}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {hosting.cost ? `${formatCurrency(hosting.cost)}/${hosting.billingCycle.toLowerCase()}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleOpenForm(hosting)} className="mr-2 text-sm text-primary-400 hover:text-primary-300">Edit</button>
                        <button onClick={() => handleDeleteHosting(hosting)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">No hosting found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Forms */}
      <RightPanel
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        title={selectedItem ? `Edit ${tab === "domains" ? "Domain" : "Hosting"}` : `Add ${tab === "domains" ? "Domain" : "Hosting"}`}
        width="md"
      >
        {tab === "domains" ? (
          <DomainForm
            initialData={selectedItem}
            onSubmit={handleDomainSubmit}
            onCancel={handleCloseForm}
            isLoading={createDomain.isPending || updateDomain.isPending}
          />
        ) : (
          <HostingForm
            initialData={selectedItem}
            onSubmit={handleHostingSubmit}
            onCancel={handleCloseForm}
            isLoading={createHosting.isPending || updateHosting.isPending}
          />
        )}
      </RightPanel>
    </div>
  )
}
