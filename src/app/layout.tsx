import type { Metadata } from "next"
import "./globals.css"
import { LayoutShell } from "@/components/layout/layout-shell"
import { ThemeInit } from "@/components/theme/theme-init"

export const metadata: Metadata = {
  title: "হিসাবনিকাশ — Personal Finance Manager",
  description: "আয়, ব্যয়, ধার দেওয়া ও নেওয়ার হিসাব",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <ThemeInit />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  )
}
