"use client"

import { usePathname } from "next/navigation"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Sidebar, MobileNav } from "@/components/layout/sidebar"

const AUTH_ROUTES = ["/login", "/register"]

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAuthRoute = AUTH_ROUTES.includes(pathname)

  if (isAuthRoute) {
    return <AuthProvider>{children}</AuthProvider>
  }

  return (
    <AuthProvider>
      <div className="flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar />
        </div>
        <main className="flex-1 overflow-auto pb-16 md:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </AuthProvider>
  )
}
