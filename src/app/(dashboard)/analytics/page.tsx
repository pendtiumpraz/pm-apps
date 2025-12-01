"use client"

import { useQuery } from "@tanstack/react-query"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from "recharts"
import { TrendingUp, TrendingDown, DollarSign, FolderKanban, CheckSquare, Calendar } from "lucide-react"
import { StatsCard } from "@/components/cards/stats-card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatCurrency } from "@/lib/utils"

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B", "#EF4444"]

export default function AnalyticsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const res = await fetch("/api/analytics/dashboard")
      if (!res.ok) throw new Error("Failed to fetch")
      return res.json()
    },
  })

  const stats = data?.data

  // Transform project status data for pie chart
  const projectStatusData = stats?.projectsByStatus
    ? Object.entries(stats.projectsByStatus)
        .filter(([_, count]) => (count as number) > 0)
        .map(([name, value]) => ({ name: name.replace("_", " "), value }))
    : []

  // Transform task status data
  const taskStatusData = stats?.tasksByStatus
    ? Object.entries(stats.tasksByStatus)
        .filter(([_, count]) => (count as number) > 0)
        .map(([name, value]) => ({ name: name.replace("_", " "), value }))
    : []

  // Monthly income data from API
  const monthlyData = stats?.incomeChart || []

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Analytics</h1>
        <p className="mt-1 text-gray-400">Track your project and financial performance</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-5">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="mt-4 h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-32" />
            </div>
          ))
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
              title="Total Tasks"
              value={stats?.overview?.totalTasks || 0}
              subtitle={`${stats?.overview?.completedTasks || 0} completed`}
              icon={CheckSquare}
              variant="success"
            />
            <StatsCard
              title="Total Revenue"
              value={formatCurrency(stats?.finance?.totalValue || 0)}
              subtitle={`${formatCurrency(stats?.finance?.paidAmount || 0)} collected`}
              icon={DollarSign}
              variant="warning"
            />
            <StatsCard
              title="Pending Amount"
              value={formatCurrency(stats?.finance?.pendingAmount || 0)}
              subtitle="awaiting payment"
              icon={TrendingUp}
              variant="danger"
            />
          </>
        )}
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Income Chart */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-lg font-semibold text-gray-100">Monthly Income</h3>
          <p className="text-sm text-gray-400">Revenue trend over the last 6 months</p>
          <div className="mt-6 h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} tickFormatter={(v) => `${v / 1000000}M`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8 }}
                    labelStyle={{ color: "#F3F4F6" }}
                    formatter={(value: number) => [formatCurrency(value), "Income"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="income"
                    stroke="#6366F1"
                    strokeWidth={3}
                    dot={{ fill: "#6366F1", strokeWidth: 2 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No income data yet
              </div>
            )}
          </div>
        </div>

        {/* Project Status Pie Chart */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-lg font-semibold text-gray-100">Projects by Status</h3>
          <p className="text-sm text-gray-400">Distribution of project statuses</p>
          <div className="mt-6 h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : projectStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={projectStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {projectStatusData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No project data
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Task Status Bar Chart */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-lg font-semibold text-gray-100">Tasks by Status</h3>
          <p className="text-sm text-gray-400">Current task distribution</p>
          <div className="mt-6 h-72">
            {isLoading ? (
              <Skeleton className="h-full w-full" />
            ) : taskStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskStatusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={12} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={12} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1F2937", border: "1px solid #374151", borderRadius: 8 }}
                  />
                  <Bar dataKey="value" fill="#8B5CF6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No task data
              </div>
            )}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h3 className="text-lg font-semibold text-gray-100">Financial Summary</h3>
          <p className="text-sm text-gray-400">Revenue collection overview</p>
          <div className="mt-6 space-y-6">
            {isLoading ? (
              [...Array(3)].map((_, i) => (
                <div key={i}>
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="mt-2 h-3 w-full" />
                </div>
              ))
            ) : (
              <>
                <div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Collection Rate</span>
                    <span className="font-medium text-gray-100">
                      {stats?.finance?.totalValue
                        ? Math.round((stats.finance.paidAmount / stats.finance.totalValue) * 100)
                        : 0}%
                    </span>
                  </div>
                  <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gray-800">
                    <div
                      className="h-full rounded-full bg-green-500 transition-all"
                      style={{
                        width: `${stats?.finance?.totalValue
                          ? (stats.finance.paidAmount / stats.finance.totalValue) * 100
                          : 0}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <p className="text-xs text-gray-400">Total Value</p>
                    <p className="mt-1 text-xl font-semibold text-gray-100">
                      {formatCurrency(stats?.finance?.totalValue || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <p className="text-xs text-gray-400">Collected</p>
                    <p className="mt-1 text-xl font-semibold text-green-400">
                      {formatCurrency(stats?.finance?.paidAmount || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <p className="text-xs text-gray-400">Pending</p>
                    <p className="mt-1 text-xl font-semibold text-yellow-400">
                      {formatCurrency(stats?.finance?.pendingAmount || 0)}
                    </p>
                  </div>
                  <div className="rounded-lg bg-gray-800/50 p-4">
                    <p className="text-xs text-gray-400">This Month</p>
                    <p className="mt-1 text-xl font-semibold text-primary-400">
                      {formatCurrency(stats?.finance?.monthlyIncome || 0)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <h3 className="text-lg font-semibold text-gray-100">Recent Activity</h3>
        <p className="text-sm text-gray-400">Latest actions in your projects</p>
        <div className="mt-6 space-y-4">
          {isLoading ? (
            [...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="mt-1 h-3 w-32" />
                </div>
              </div>
            ))
          ) : stats?.recentActivities?.length > 0 ? (
            stats.recentActivities.map((activity: any) => (
              <div key={activity.id} className="flex items-start gap-4 rounded-lg bg-gray-800/30 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-500/10">
                  <Calendar className="h-5 w-5 text-primary-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-100">{activity.description}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {activity.project?.name} • {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}
