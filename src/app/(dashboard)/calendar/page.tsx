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
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
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
        })
      }
    })

    return allEvents
  }, [projectsData, tasksData, domainsData, hostingsData])

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

  const typeColors = {
    deadline: "bg-primary-500",
    task: "bg-blue-500",
    domain: "bg-yellow-500",
    hosting: "bg-green-500",
    payment: "bg-purple-500",
  }

  const typeLabels = {
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
                          typeColors[event.type]
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
            {Object.entries(typeColors).map(([type, color]) => (
              <div key={type} className="flex items-center gap-2">
                <div className={cn("h-3 w-3 rounded", color)} />
                <span className="text-xs text-gray-400">{typeLabels[type as keyof typeof typeLabels]}</span>
              </div>
            ))}
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
                          <div className={cn("h-2 w-2 rounded-full", typeColors[event.type])} />
                          <span className="text-xs text-gray-400">
                            {typeLabels[event.type]}
                          </span>
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
                    <div className={cn("h-2 w-2 rounded-full", typeColors[event.type])} />
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm text-gray-100">{event.title}</p>
                      <p className="text-xs text-gray-500">{format(event.date, "MMM d")}</p>
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
