"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { ExternalLink, Download, Github, Trophy, Cpu, Terminal, Network, Star } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

type TabType = "models" | "ide" | "cli" | "orchestrator"

const tabs = [
  { id: "models" as TabType, label: "Best AI Models", icon: Cpu, description: "SWE-bench Leaderboard" },
  { id: "ide" as TabType, label: "Best IDE", icon: Terminal, description: "AI-powered Editors" },
  { id: "cli" as TabType, label: "Best CLI", icon: Terminal, description: "Terminal AI Tools" },
  { id: "orchestrator" as TabType, label: "Best Orchestrator", icon: Network, description: "Multi-agent Systems" },
]

export default function BestAIPage() {
  const [activeTab, setActiveTab] = useState<TabType>("models")

  const { data: models, isLoading: loadingModels } = useQuery({
    queryKey: ["best-ai-models"],
    queryFn: async () => {
      const res = await fetch("/api/best-ai-models")
      return res.json()
    },
  })

  const { data: ides, isLoading: loadingIdes } = useQuery({
    queryKey: ["best-ide"],
    queryFn: async () => {
      const res = await fetch("/api/best-ide")
      return res.json()
    },
  })

  const { data: clis, isLoading: loadingClis } = useQuery({
    queryKey: ["best-cli"],
    queryFn: async () => {
      const res = await fetch("/api/best-cli")
      return res.json()
    },
  })

  const { data: orchestrators, isLoading: loadingOrch } = useQuery({
    queryKey: ["best-orchestrator"],
    queryFn: async () => {
      const res = await fetch("/api/best-orchestrator")
      return res.json()
    },
  })

  const getRankBadge = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
    if (rank === 2) return "bg-gray-400/20 text-gray-300 border-gray-400/30"
    if (rank === 3) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    return "bg-gray-800 text-gray-400 border-gray-700"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
          Best AI Tools
        </h1>
        <p className="mt-1 text-gray-400">
          Curated list of the best AI tools for developers
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-primary-500 text-white"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-xl border border-gray-800 bg-gray-900 overflow-hidden">
        {/* Models Tab */}
        {activeTab === "models" && (
          <div>
            <div className="border-b border-gray-800 bg-gray-900/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-100">AI Models - SWE-bench Verified</h2>
              <p className="text-sm text-gray-400">Top performing models on software engineering benchmarks</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-800/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-400">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-400">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-400">% Resolved</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-400">Cost/Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-400">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-400">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {loadingModels ? (
                    [...Array(10)].map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-6 w-8" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                      </tr>
                    ))
                  ) : (
                    models?.data?.map((model: any) => (
                      <tr key={model.id} className="hover:bg-gray-800/50">
                        <td className="px-6 py-4">
                          <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${getRankBadge(model.rank)}`}>
                            {model.rank}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-100">{model.name}</td>
                        <td className="px-6 py-4">
                          <span className="text-green-400 font-semibold">{model.resolved}%</span>
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {model.costPerTask ? `$${model.costPerTask}` : "-"}
                        </td>
                        <td className="px-6 py-4 text-gray-400">{model.organization}</td>
                        <td className="px-6 py-4">
                          {model.link && (
                            <a href={model.link} target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:text-primary-300">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* IDE Tab */}
        {activeTab === "ide" && (
          <div>
            <div className="border-b border-gray-800 bg-gray-900/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-100">Best AI IDEs</h2>
              <p className="text-sm text-gray-400">Top AI-powered code editors and IDEs</p>
            </div>
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {loadingIdes ? (
                [...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-lg border border-gray-800 bg-gray-800/50 p-4">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-4 h-8 w-24" />
                  </div>
                ))
              ) : (
                ides?.data?.map((ide: any) => (
                  <div key={ide.id} className="rounded-lg border border-gray-800 bg-gray-800/50 p-4 hover:border-gray-700 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${getRankBadge(ide.rank)}`}>
                          {ide.rank}
                        </span>
                        <h3 className="font-semibold text-gray-100">{ide.name}</h3>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-gray-400">{ide.description}</p>
                    {ide.pricing && (
                      <span className="mt-2 inline-block rounded-full bg-primary-500/10 px-2 py-0.5 text-xs text-primary-400">
                        {ide.pricing}
                      </span>
                    )}
                    <a
                      href={ide.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 flex items-center gap-2 rounded-lg bg-primary-500 px-3 py-2 text-sm font-medium text-white hover:bg-primary-600 transition-colors w-fit"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CLI Tab */}
        {activeTab === "cli" && (
          <div>
            <div className="border-b border-gray-800 bg-gray-900/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-100">Best AI CLI Tools</h2>
              <p className="text-sm text-gray-400">Top command-line AI coding assistants</p>
            </div>
            <div className="divide-y divide-gray-800">
              {loadingClis ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="mt-1 h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))
              ) : (
                clis?.data?.map((cli: any) => (
                  <div key={cli.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/50">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${getRankBadge(cli.rank)}`}>
                      {cli.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-100">{cli.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{cli.description}</p>
                    </div>
                    {cli.stars && cli.stars !== "-" && (
                      <span className="flex items-center gap-1 text-sm text-yellow-400">
                        <Star className="h-4 w-4 fill-yellow-400" />
                        {cli.stars}
                      </span>
                    )}
                    <a
                      href={cli.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Orchestrator Tab */}
        {activeTab === "orchestrator" && (
          <div>
            <div className="border-b border-gray-800 bg-gray-900/50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-100">Best CLI Orchestrators</h2>
              <p className="text-sm text-gray-400">Top multi-agent AI systems for complex tasks</p>
            </div>
            <div className="divide-y divide-gray-800">
              {loadingOrch ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-6 py-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="mt-1 h-4 w-48" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                ))
              ) : (
                orchestrators?.data?.map((orch: any) => (
                  <div key={orch.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-800/50">
                    <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border text-sm font-bold ${getRankBadge(orch.rank)}`}>
                      {orch.rank}
                    </span>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-100">{orch.name}</h3>
                      <p className="text-sm text-gray-400 truncate">{orch.description}</p>
                    </div>
                    {orch.stars && orch.stars !== "-" && (
                      <span className="flex items-center gap-1 text-sm text-yellow-400">
                        <Star className="h-4 w-4 fill-yellow-400" />
                        {orch.stars}
                      </span>
                    )}
                    <a
                      href={orch.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                    >
                      <Github className="h-4 w-4" />
                      GitHub
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Source */}
      <p className="text-xs text-gray-500 text-center">
        AI Models data from <a href="https://www.swebench.com" target="_blank" rel="noopener noreferrer" className="text-primary-400 hover:underline">swebench.com</a>
      </p>
    </div>
  )
}
