"use client"

import { useState, useMemo } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  isToday,
  parseISO,
} from "date-fns"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, User, Rocket } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge, StatusBadge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: "deadline" | "task" | "domain" | "hosting" | "payment"
  status?: string
  color?: string
  category?: string | null
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const res = await fetch("/api/projects")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  // Fetch tasks
  const { data: tasksData } = useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const res = await fetch("/api/tasks")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  // Fetch domains
  const { data: domainsData } = useQuery({
    queryKey: ["domains"],
    queryFn: async () => {
      const res = await fetch("/api/domains")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  // Fetch hostings
  const { data: hostingsData } = useQuery({
    queryKey: ["hostings"],
    queryFn: async () => {
      const res = await fetch("/api/hostings")
      if (!res.ok) throw new Error("Failed")
      return res.json()
    },
  })

  // Build a project category lookup
  const projectCategoryMap = useMemo(() => {
    const map: Record<string, string> = {}
    projectsData?.data?.forEach((p: any) => {
      map[p.id] = p.category || "CLIENT"
    })
    return map
  }, [projectsData])

  // Combine all events
  const events = useMemo(() => {
    const allEvents: CalendarEvent[] = []

    // Project deadlines
    projectsData?.data?.forEach((p: any) => {
      if (p.deadline) {
        allEvents.push({
          id: `project-${p.id}`,
          title: p.name,
          date: new Date(p.deadline),
          type: "deadline",
          status: p.status,
          color: p.color,
          category: p.category || "CLIENT",
        })
      }
    })

    // Task due dates
    tasksData?.data?.forEach((t: any) => {
      if (t.dueDate) {
        allEvents.push({
          id: `task-${t.id}`,
          title: t.title,
          date: new Date(t.dueDate),
          type: "task",
          status: t.status,
          category: t.projectId ? projectCategoryMap[t.projectId] : null,
        })
      }
    })

    // Domain expiry
    domainsData?.data?.forEach((d: any) => {
      if (d.expiryDate) {
        allEvents.push({
          id: `domain-${d.id}`,
          title: d.domainName,
          date: new Date(d.expiryDate),
          type: "domain",
          category: d.projectId ? projectCategoryMap[d.projectId] : null,
        })
      }
    })

    // Hosting expiry
    hostingsData?.data?.forEach((h: any) => {
      if (h.expiryDate) {
        allEvents.push({
          id: `hosting-${h.id}`,
          title: h.provider,
          date: new Date(h.expiryDate),
          type: "hosting",
          category: h.projectId ? projectCategoryMap[h.projectId] : null,
        })
      }
    })

    return allEvents
  }, [projectsData, tasksData, domainsData, hostingsData, projectCategoryMap])

  // Get days in current month view
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    return events.filter((e) => isSameDay(e.date, day))
  }

  // Get events for selected date
  const selectedDateEvents = selectedDate ? getEventsForDay(selectedDate) : []

  // Color logic: category-aware for deadlines, type-based for others
  const getEventBgClass = (event: CalendarEvent) => {
    if (event.type === "deadline") {
      return event.category === "OWN" ? "bg-emerald-500" : "bg-amber-500"
    }
    return typeColors[event.type]
  }

  const getEventDotClass = (event: CalendarEvent) => {
    if (event.type === "deadline") {
      return event.category === "OWN" ? "bg-emerald-500" : "bg-amber-500"
    }
    return typeColors[event.type]
  }

  const typeColors: Record<string, string> = {
    deadline: "bg-primary-500",
    task: "bg-blue-500",
    domain: "bg-yellow-500",
    hosting: "bg-green-500",
    payment: "bg-purple-500",
  }

  const typeLabels: Record<string, string> = {
    deadline: "Project Deadline",
    task: "Task Due",
    domain: "Domain Expiry",
    hosting: "Hosting Expiry",
    payment: "Payment Due",
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Calendar</h1>
          <p className="mt-1 text-gray-400">Track deadlines and important dates</p>
        </div>
        <Button variant="outline" onClick={() => setCurrentMonth(new Date())}>
          <CalendarIcon className="mr-2 h-4 w-4" /> Today
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Calendar */}
        <div className="lg:col-span-2 rounded-xl border border-gray-800 bg-gray-900 p-6">
          {/* Month Navigation */}
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-100">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-gray-100"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="mb-2 grid grid-cols-7 text-center text-xs font-medium text-gray-500">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="py-2">{day}</div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before month starts */}
            {Array.from({ length: days[0].getDay() }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24" />
            ))}

            {days.map((day) => {
              const dayEvents = getEventsForDay(day)
              const isSelected = selectedDate && isSameDay(day, selectedDate)

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "h-24 rounded-lg border p-2 text-left transition-colors",
                    isToday(day)
                      ? "border-primary-500 bg-primary-500/10"
                      : isSelected
                        ? "border-gray-600 bg-gray-800"
                        : "border-gray-800 hover:border-gray-700 hover:bg-gray-800/50"
                  )}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isToday(day) ? "text-primary-400" : "text-gray-300"
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={cn(
                          "truncate rounded px-1 py-0.5 text-xs text-white",
                          getEventBgClass(event)
                        )}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Legend */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-amber-500" />
              <span className="text-xs text-gray-400">Client Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-emerald-500" />
              <span className="text-xs text-gray-400">Own Project Deadline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-blue-500" />
              <span className="text-xs text-gray-400">Task Due</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-yellow-500" />
              <span className="text-xs text-gray-400">Domain Expiry</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded bg-green-500" />
              <span className="text-xs text-gray-400">Hosting Expiry</span>
            </div>
          </div>
        </div>

        {/* Sidebar - Selected Date Events */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-lg font-semibold text-gray-100">
            {selectedDate ? format(selectedDate, "MMMM d, yyyy") : "Select a date"}
          </h3>

          {selectedDate ? (
            <div className="mt-4 space-y-3">
              {selectedDateEvents.length > 0 ? (
                selectedDateEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border border-gray-800 bg-gray-800/50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className={cn("h-2 w-2 rounded-full", getEventDotClass(event))} />
                          <span className="text-xs text-gray-400">
                            {event.type === "deadline"
                              ? event.category === "OWN"
                                ? "Own Project Deadline"
                                : "Client Deadline"
                              : typeLabels[event.type]}
                          </span>
                          {/* Category indicator for deadlines */}
                          {event.type === "deadline" && (
                            <span
                              className={cn(
                                "inline-flex items-center gap-0.5 rounded-full px-1.5 py-0 text-[10px] font-medium",
                                event.category === "OWN"
                                  ? "bg-emerald-500/15 text-emerald-400"
                                  : "bg-amber-500/15 text-amber-400"
                              )}
                            >
                              {event.category === "OWN" ? (
                                <><Rocket className="h-2.5 w-2.5" /> Own</>
                              ) : (
                                <><User className="h-2.5 w-2.5" /> Client</>
                              )}
                            </span>
                          )}
                        </div>
                        <p className="mt-1 font-medium text-gray-100">{event.title}</p>
                      </div>
                      {event.status && <StatusBadge status={event.status} />}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No events on this date</p>
              )}
            </div>
          ) : (
            <p className="mt-4 text-sm text-gray-500">
              Click on a date to see events
            </p>
          )}

          {/* Upcoming Events */}
          <div className="mt-8">
            <h4 className="text-sm font-medium text-gray-400">Upcoming This Week</h4>
            <div className="mt-3 space-y-2">
              {events
                .filter((e) => {
                  const diff = (e.date.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  return diff >= 0 && diff <= 7
                })
                .slice(0, 5)
                .map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 rounded-lg bg-gray-800/30 p-2"
                  >
                    <div className={cn("h-2 w-2 rounded-full", getEventDotClass(event))} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-gray-100">{event.title}</p>
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs text-gray-500">{format(event.date, "MMM d")}</p>
                        {event.type === "deadline" && (
                          <span
                            className={cn(
                              "text-[10px] font-medium",
                              event.category === "OWN" ? "text-emerald-400" : "text-amber-400"
                            )}
                          >
                            • {event.category === "OWN" ? "Own" : "Client"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
