"use client"

import { QueryProvider } from "./query-provider"
import { SessionProvider } from "./session-provider"
import { Toaster } from "react-hot-toast"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <QueryProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#27272A",
              color: "#F4F4F5",
              border: "1px solid #3F3F46",
            },
            success: {
              iconTheme: {
                primary: "#10B981",
                secondary: "#F4F4F5",
              },
            },
            error: {
              iconTheme: {
                primary: "#EF4444",
                secondary: "#F4F4F5",
              },
            },
          }}
        />
      </QueryProvider>
    </SessionProvider>
  )
}
