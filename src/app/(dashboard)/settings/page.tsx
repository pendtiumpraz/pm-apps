"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { User, Bell, Shield, Palette, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "react-hot-toast"

export default function SettingsPage() {
  const { data: session } = useSession()
  const [activeTab, setActiveTab] = useState("profile")
  const [isLoading, setIsLoading] = useState(false)

  const [profile, setProfile] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    deadlineReminders: true,
    paymentAlerts: true,
    domainExpiry: true,
  })

  const handleSaveProfile = async () => {
    setIsLoading(true)
    // Simulate save
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Profile updated!")
    setIsLoading(false)
  }

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "appearance", label: "Appearance", icon: Palette },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-100">Settings</h1>
        <p className="mt-1 text-gray-400">Manage your account preferences</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary-500/10 text-primary-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                }`}
              >
                <tab.icon className="h-5 w-5" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="lg:col-span-3">
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">Profile Information</h3>
                  <p className="text-sm text-gray-400">Update your account details</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary-500/20 text-2xl font-semibold text-primary-400">
                    {profile.name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <Button variant="outline" size="sm">Change Avatar</Button>
                    <p className="mt-1 text-xs text-gray-500">JPG, PNG. Max 2MB</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Name</label>
                    <Input
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Email</label>
                    <Input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-800 pt-4">
                  <Button onClick={handleSaveProfile} isLoading={isLoading}>
                    <Save className="mr-2 h-4 w-4" /> Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">Notification Preferences</h3>
                  <p className="text-sm text-gray-400">Choose what notifications you receive</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: "emailNotifications", label: "Email Notifications", desc: "Receive updates via email" },
                    { key: "deadlineReminders", label: "Deadline Reminders", desc: "Get notified before deadlines" },
                    { key: "paymentAlerts", label: "Payment Alerts", desc: "Notifications for payment updates" },
                    { key: "domainExpiry", label: "Domain/Hosting Expiry", desc: "Alerts for expiring assets" },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between rounded-lg bg-gray-800/50 p-4">
                      <div>
                        <p className="font-medium text-gray-100">{item.label}</p>
                        <p className="text-sm text-gray-400">{item.desc}</p>
                      </div>
                      <button
                        onClick={() =>
                          setNotifications({
                            ...notifications,
                            [item.key]: !notifications[item.key as keyof typeof notifications],
                          })
                        }
                        className={`relative h-6 w-11 rounded-full transition-colors ${
                          notifications[item.key as keyof typeof notifications]
                            ? "bg-primary-500"
                            : "bg-gray-700"
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                            notifications[item.key as keyof typeof notifications]
                              ? "left-[22px]"
                              : "left-0.5"
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Security Tab */}
            {activeTab === "security" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">Security Settings</h3>
                  <p className="text-sm text-gray-400">Manage your password and security</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Current Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">New Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-300">Confirm Password</label>
                    <Input type="password" placeholder="••••••••" />
                  </div>
                </div>

                <div className="flex justify-end border-t border-gray-800 pt-4">
                  <Button>Update Password</Button>
                </div>

                <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                  <h4 className="font-medium text-red-400">Danger Zone</h4>
                  <p className="mt-1 text-sm text-gray-400">
                    Once you delete your account, there is no going back.
                  </p>
                  <Button variant="danger" className="mt-4">Delete Account</Button>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === "appearance" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100">Appearance</h3>
                  <p className="text-sm text-gray-400">Customize how the app looks</p>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-300">Theme</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: "dark", label: "Dark", active: true },
                      { id: "light", label: "Light", active: false },
                      { id: "system", label: "System", active: false },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        className={`rounded-lg border p-4 text-center transition-colors ${
                          theme.active
                            ? "border-primary-500 bg-primary-500/10"
                            : "border-gray-800 hover:border-gray-700"
                        }`}
                      >
                        <div
                          className={`mx-auto mb-2 h-12 w-12 rounded-lg ${
                            theme.id === "dark" ? "bg-gray-900" : theme.id === "light" ? "bg-white" : "bg-gradient-to-br from-gray-900 to-white"
                          }`}
                        />
                        <span className="text-sm text-gray-300">{theme.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-300">Accent Color</label>
                  <div className="flex gap-3">
                    {["#6366F1", "#8B5CF6", "#EC4899", "#EF4444", "#F59E0B", "#10B981"].map((color) => (
                      <button
                        key={color}
                        className={`h-10 w-10 rounded-full transition-all hover:scale-110 ${
                          color === "#6366F1" ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900" : ""
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
