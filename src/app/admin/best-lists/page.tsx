"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Plus, Edit, Trash2, ExternalLink, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { RightPanel } from "@/components/ui/right-panel"
import { toast } from "react-hot-toast"

type ListType = "ai-models" | "ide" | "cli" | "orchestrator"

const listConfig = {
  "ai-models": { 
    title: "Best AI Models", 
    api: "/api/best-ai-models",
    fields: ["name", "resolved", "costPerTask", "organization", "link"],
  },
  "ide": { 
    title: "Best IDEs", 
    api: "/api/best-ide",
    fields: ["name", "description", "downloadUrl", "pricing"],
  },
  "cli": { 
    title: "Best CLI Tools", 
    api: "/api/best-cli",
    fields: ["name", "description", "githubUrl", "stars"],
  },
  "orchestrator": { 
    title: "Best Orchestrators", 
    api: "/api/best-orchestrator",
    fields: ["name", "description", "githubUrl", "stars"],
  },
}

function SortableItem({ item, listType, onEdit, onDelete }: { 
  item: any
  listType: ListType
  onEdit: (item: any) => void
  onDelete: (id: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-3 ${isDragging ? "shadow-lg" : ""}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded p-1 text-gray-500 hover:bg-gray-800 hover:text-gray-300"
      >
        <GripVertical className="h-5 w-5" />
      </button>
      
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500/20 text-sm font-bold text-primary-400">
        {item.rank}
      </span>
      
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-100 truncate">{item.name}</p>
        <p className="text-xs text-gray-500 truncate">
          {listType === "ai-models" && `${item.resolved}% | $${item.costPerTask || 0} | ${item.organization}`}
          {listType === "ide" && `${item.pricing || ""} | ${item.downloadUrl}`}
          {(listType === "cli" || listType === "orchestrator") && `${item.stars || "-"} stars | ${item.githubUrl}`}
        </p>
      </div>
      
      <div className="flex gap-1">
        <button onClick={() => onEdit(item)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-gray-300">
          <Edit className="h-4 w-4" />
        </button>
        <button onClick={() => onDelete(item.id)} className="rounded p-1.5 text-gray-500 hover:bg-gray-800 hover:text-red-400">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

export default function AdminBestListsPage() {
  const [activeList, setActiveList] = useState<ListType>("ai-models")
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [localItems, setLocalItems] = useState<any[]>([])
  
  const queryClient = useQueryClient()
  const config = listConfig[activeList]

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const { data, isLoading } = useQuery({
    queryKey: [activeList],
    queryFn: async () => {
      const res = await fetch(config.api)
      return res.json()
    },
  })

  // Sync local items when data changes
  const items = hasChanges ? localItems : (data?.data || [])

  const saveMutation = useMutation({
    mutationFn: async (updates: { id: string; rank: number }[]) => {
      await Promise.all(
        updates.map(({ id, rank }) =>
          fetch(`${config.api}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ rank }),
          })
        )
      )
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeList] })
      toast.success("Rankings saved!")
      setHasChanges(false)
    },
    onError: () => toast.error("Failed to save"),
  })

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch(config.api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeList] })
      toast.success("Added!")
      setIsEditOpen(false)
      setEditItem(null)
    },
    onError: () => toast.error("Failed to add"),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await fetch(`${config.api}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeList] })
      toast.success("Updated!")
      setIsEditOpen(false)
      setEditItem(null)
    },
    onError: () => toast.error("Failed to update"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${config.api}/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeList] })
      toast.success("Deleted!")
    },
    onError: () => toast.error("Failed to delete"),
  })

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i: any) => i.id === active.id)
    const newIndex = items.findIndex((i: any) => i.id === over.id)

    const newItems = arrayMove(items, oldIndex, newIndex).map((item: any, index: number) => ({
      ...item,
      rank: index + 1,
    }))

    setLocalItems(newItems)
    setHasChanges(true)
  }

  const handleSaveRanks = () => {
    const updates = localItems.map((item) => ({ id: item.id, rank: item.rank }))
    saveMutation.mutate(updates)
  }

  const handleEdit = (item: any) => {
    setEditItem(item)
    setIsEditOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm("Delete this item?")) {
      deleteMutation.mutate(id)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    
    const data: any = { rank: items.length + 1 }
    config.fields.forEach((field) => {
      const value = formData.get(field)
      if (field === "resolved" || field === "costPerTask") {
        data[field] = value ? parseFloat(value as string) : null
      } else {
        data[field] = value || null
      }
    })

    if (editItem) {
      data.rank = editItem.rank
      updateMutation.mutate({ id: editItem.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleTabChange = (list: ListType) => {
    if (hasChanges) {
      if (!confirm("You have unsaved changes. Discard?")) return
    }
    setActiveList(list)
    setHasChanges(false)
    setLocalItems([])
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Best Lists Management</h1>
          <p className="mt-1 text-gray-400">Drag and drop to reorder rankings</p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Button onClick={handleSaveRanks} disabled={saveMutation.isPending}>
              <Save className="mr-2 h-4 w-4" />
              {saveMutation.isPending ? "Saving..." : "Save Rankings"}
            </Button>
          )}
          <Button onClick={() => { setEditItem(null); setIsEditOpen(true) }}>
            <Plus className="mr-2 h-4 w-4" />
            Add New
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-800 pb-4">
        {(Object.keys(listConfig) as ListType[]).map((key) => (
          <button
            key={key}
            onClick={() => handleTabChange(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeList === key
                ? "bg-red-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            {listConfig[key].title}
          </button>
        ))}
      </div>

      {/* Drag & Drop List */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900 p-3">
              <Skeleton className="h-5 w-5" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        </div>
      ) : items.length > 0 ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i: any) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item: any) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  listType={activeList}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="rounded-xl border border-dashed border-gray-800 py-16 text-center">
          <p className="text-gray-500">No items yet</p>
        </div>
      )}

      {hasChanges && (
        <div className="rounded-lg bg-yellow-500/10 border border-yellow-500/20 p-3 text-sm text-yellow-400">
          You have unsaved ranking changes. Click "Save Rankings" to apply.
        </div>
      )}

      {/* Edit Panel */}
      <RightPanel
        isOpen={isEditOpen}
        onClose={() => { setIsEditOpen(false); setEditItem(null) }}
        title={editItem ? "Edit Item" : "Add New Item"}
        width="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeList === "ai-models" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Model Name *</label>
                <Input name="name" defaultValue={editItem?.name} required placeholder="e.g. Claude 4.5 Opus" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">% Resolved *</label>
                  <Input name="resolved" type="number" step="0.01" defaultValue={editItem?.resolved} required />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">Cost/Task ($)</label>
                  <Input name="costPerTask" type="number" step="0.01" defaultValue={editItem?.costPerTask} />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Organization *</label>
                <Input name="organization" defaultValue={editItem?.organization} required placeholder="e.g. Anthropic" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Link</label>
                <Input name="link" type="url" defaultValue={editItem?.link} placeholder="https://..." />
              </div>
            </>
          )}

          {activeList === "ide" && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">IDE Name *</label>
                <Input name="name" defaultValue={editItem?.name} required placeholder="e.g. Cursor" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
                <Input name="description" defaultValue={editItem?.description} placeholder="Short description" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Download URL *</label>
                <Input name="downloadUrl" type="url" defaultValue={editItem?.downloadUrl} required placeholder="https://..." />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Pricing</label>
                <Input name="pricing" defaultValue={editItem?.pricing} placeholder="e.g. Freemium ($20/mo)" />
              </div>
            </>
          )}

          {(activeList === "cli" || activeList === "orchestrator") && (
            <>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Name *</label>
                <Input name="name" defaultValue={editItem?.name} required placeholder="e.g. Aider" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Description</label>
                <Input name="description" defaultValue={editItem?.description} placeholder="Short description" />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">GitHub URL *</label>
                <Input name="githubUrl" type="url" defaultValue={editItem?.githubUrl} required placeholder="https://github.com/..." />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">Stars</label>
                <Input name="stars" defaultValue={editItem?.stars} placeholder="e.g. 38.7k" />
              </div>
            </>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsEditOpen(false); setEditItem(null) }}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createMutation.isPending || updateMutation.isPending}>
              {editItem ? "Update" : "Add"}
            </Button>
          </div>
        </form>
      </RightPanel>
    </div>
  )
}
