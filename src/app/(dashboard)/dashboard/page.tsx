"use client"

import { useQuery } from "@tanstack/react-query"
import {
  FolderKanban,
  CheckSquare,
  Wallet,
  TrendingUp,
  AlertTriangle,
  Globe,
  Server,
  Calendar,
} from "lucide-react"
import { StatsCard } from "@/components/cards/stats-card"
import { ProjectCard } from "@/components/cards/project-card"
import { StatsCardSkeleton, ProjectCardSkeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { formatCurrency, formatDate, getDaysUntil } from "@/lib/utils"
import Link from "next/link"

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/dashboard")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const { data: projectsData, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects", "active"],
    queryFn: async () => {
      const res = await fetch("/api/projects?status=ACTIVE")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const stats = data?.data

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Dashboard</h1>
        <p className="mt-1 text-gray-400">
          Welcome back! Here&apos;s an overview of your projects.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          <>
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
            <StatsCardSkeleton />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Projects"
              value={stats?.overview?.totalProjects || 0}
              subtitle={`${stats?.overview?.activeProjects || 0} active`}
              icon={FolderKanban}
              variant="primary"
            />
            <StatsCard
              title="Pending Tasks"
              value={stats?.overview?.pendingTasks || 0}
              subtitle={`${stats?.overview?.completedTasks || 0} completed`}
              icon={CheckSquare}
              variant="warning"
            />
            <StatsCard
              title="Monthly Income"
              value={formatCurrency(stats?.finance?.monthlyIncome || 0)}
              subtitle={`${stats?.finance?.monthlyPaymentsCount || 0} payments`}
              icon={Wallet}
              variant="success"
            />
            <StatsCard
              title="Pending Revenue"
              value={formatCurrency(stats?.finance?.pendingAmount || 0)}
              subtitle="awaiting payment"
              icon={TrendingUp}
              variant="default"
            />
          </>
        )}
      </div>

      {/* Alerts Section */}
      {stats?.alerts && (stats.alerts.domainsCount > 0 || stats.alerts.hostingsCount > 0) && (
        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h3 className="font-medium text-yellow-400">Upcoming Renewals</h3>
          </div>
          <div className="mt-3 space-y-2">
            {stats.alerts.expiringDomains?.map((domain: any) => (
              <div
                key={domain.id}
                className="flex items-center justify-between rounded-lg bg-gray-900/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{domain.domainName}</span>
                  <Badge variant="warning" size="sm">
                    {getDaysUntil(domain.expiryDate)} days
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  {domain.project?.name}
                </span>
              </div>
            ))}
            {stats.alerts.expiringHostings?.map((hosting: any) => (
              <div
                key={hosting.id}
                className="flex items-center justify-between rounded-lg bg-gray-900/50 px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <Server className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-300">{hosting.provider}</span>
                  <Badge variant="warning" size="sm">
                    {getDaysUntil(hosting.expiryDate)} days
                  </Badge>
                </div>
                <span className="text-xs text-gray-500">
                  {hosting.project?.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active Projects */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-100">Active Projects</h2>
            <Link
              href="/projects"
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {projectsLoading ? (
              <>
                <ProjectCardSkeleton />
                <ProjectCardSkeleton />
              </>
            ) : projectsData?.data?.length > 0 ? (
              projectsData.data.slice(0, 4).map((project: any) => (
                <ProjectCard key={project.id} project={project} />
              ))
            ) : (
              <div className="col-span-2 rounded-xl border border-dashed border-gray-800 p-8 text-center">
                <FolderKanban className="mx-auto h-10 w-10 text-gray-600" />
                <p className="mt-2 text-gray-400">No active projects</p>
                <Link
                  href="/projects"
                  className="mt-4 inline-block text-sm text-primary-400 hover:text-primary-300"
                >
                  Create your first project
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-100">Upcoming Deadlines</h2>
            <Link
              href="/calendar"
              className="text-sm text-primary-400 hover:text-primary-300"
            >
              Calendar
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-lg bg-gray-800 p-4">
                    <div className="h-4 w-2/3 rounded bg-gray-700" />
                    <div className="mt-2 h-3 w-1/3 rounded bg-gray-700" />
                  </div>
                ))}
              </div>
            ) : stats?.upcomingDeadlines?.length > 0 ? (
              stats.upcomingDeadlines.map((project: any) => {
                const daysLeft = getDaysUntil(project.deadline)
                return (
                  <Link
                    key={project.id}
                    href={`/projects/${project.id}`}
                    className="block rounded-lg border border-gray-800 bg-gray-900/50 p-4 transition-colors hover:border-gray-700"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-100">{project.name}</p>
                        {project.client && (
                          <p className="text-sm text-gray-400">{project.client}</p>
                        )}
                      </div>
                      <div
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: project.color || "#6366F1" }}
                      />
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span
                        className={`text-sm ${
                          daysLeft <= 3 ? "text-red-400" : "text-gray-400"
                        }`}
                      >
                        {formatDate(project.deadline)}
                        <span className="ml-1 text-xs">
                          ({daysLeft} days)
                        </span>
                      </span>
                    </div>
                  </Link>
                )
              })
            ) : (
              <div className="rounded-lg border border-dashed border-gray-800 p-6 text-center">
                <Calendar className="mx-auto h-8 w-8 text-gray-600" />
                <p className="mt-2 text-sm text-gray-400">No upcoming deadlines</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
