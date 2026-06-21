"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard, TrendingUp, TrendingDown,
  ArrowUpRight, ArrowDownLeft, BarChart2, Target,
  Wallet, LogOut, User, Wifi, WifiOff, Settings, Globe,
  CreditCard, Repeat, PiggyBank, Users, CalendarRange,
  Sun, Moon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/store/auth"
import { useFinanceStore } from "@/store/finance"
import { useLangStore } from "@/store/lang"
import { useThemeStore } from "@/store/theme"
import type { Lang } from "@/lib/i18n"

const NAV_KEYS = [
  { href: "/", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/income", key: "income" as const, icon: TrendingUp },
  { href: "/expense", key: "expense" as const, icon: TrendingDown },
  { href: "/lend", key: "lend" as const, icon: ArrowUpRight },
  { href: "/borrow", key: "borrow" as const, icon: ArrowDownLeft },
  { href: "/accounts", key: "accounts" as const, icon: CreditCard },
  { href: "/recurring", key: "recurring" as const, icon: Repeat },
  { href: "/savings", key: "savingsGoals" as const, icon: PiggyBank },
  { href: "/ledger", key: "ledger" as const, icon: Users },
  { href: "/analytics", key: "analytics" as const, icon: BarChart2 },
  { href: "/yearly", key: "yearlyReport" as const, icon: CalendarRange },
  { href: "/budget", key: "budget" as const, icon: Target },
  { href: "/settings", key: "settings" as const, icon: Settings },
]

const MOBILE_NAV = [
  { href: "/", key: "dashboard" as const, icon: LayoutDashboard },
  { href: "/income", key: "income" as const, icon: TrendingUp },
  { href: "/expense", key: "expense" as const, icon: TrendingDown },
  { href: "/lend", key: "lend" as const, icon: ArrowUpRight },
  { href: "/borrow", key: "borrow" as const, icon: ArrowDownLeft },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { useAPI, loadState } = useFinanceStore()
  const { t, lang, setLang } = useLangStore()
  const { theme, toggleTheme } = useThemeStore()

  const handleLogout = () => { logout(); router.replace("/login") }

  return (
    <aside className="w-60 shrink-0 border-r bg-card min-h-screen flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-4 border-b">
        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shrink-0">
          <Wallet className="h-4 w-4 text-white" />
        </div>
        <div>
          <span className="font-bold text-base leading-none">{t("appName")}</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">{t("tagline")}</p>
        </div>
      </div>

      {/* Sync badge */}
      {user && (
        <div className={cn(
          "mx-3 mt-2.5 px-2.5 py-1.5 rounded-md text-[11px] flex items-center gap-1.5",
          useAPI && loadState === "loaded" ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
          : loadState === "loading" ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
        )}>
          {loadState === "loading"
            ? <><Wifi className="w-3 h-3 animate-pulse" />{t("syncing")}</>
            : useAPI && loadState === "loaded"
            ? <><Wifi className="w-3 h-3" />{t("synced")}</>
            : <><WifiOff className="w-3 h-3" />{t("offline")}</>
          }
        </div>
      )}

      {/* Nav — scrollable */}
      <nav className="flex-1 p-3 space-y-0.5 mt-1.5 overflow-y-auto">
        {NAV_KEYS.map(({ href, key, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}>
              <Icon className={cn("h-4 w-4 shrink-0", active && "text-emerald-600")} />
              {t(key)}
            </Link>
          )
        })}
      </nav>

      {/* Theme + Language switcher */}
      <div className="px-3 py-2 border-t space-y-1.5">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
        >
          {theme === "dark" ? <Moon className="w-3.5 h-3.5 text-muted-foreground shrink-0" /> : <Sun className="w-3.5 h-3.5 text-muted-foreground shrink-0" />}
          <span className="text-xs text-muted-foreground flex-1 text-left">{theme === "dark" ? t("darkMode") : t("lightMode")}</span>
          <div className={cn("w-8 h-4.5 rounded-full relative transition-colors", theme === "dark" ? "bg-emerald-600" : "bg-muted-foreground/30")} style={{height:'18px'}}>
            <div className={cn("absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white transition-transform", theme === "dark" ? "translate-x-[18px]" : "translate-x-0.5")} />
          </div>
        </button>

        <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg bg-muted/50">
          <Globe className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="text-xs text-muted-foreground flex-1">{t("language")}</span>
          <div className="flex gap-1">
            {(["bn","en"] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={cn("px-2 py-0.5 rounded text-[11px] font-medium transition-colors",
                  lang === l ? "bg-emerald-600 text-white" : "text-muted-foreground hover:text-foreground"
                )}>
                {l === "bn" ? "বাং" : "EN"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* User section */}
      <div className="p-3 border-t space-y-1">
        {user ? (
          <>
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-muted/50">
              <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                <User className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold truncate">{user.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950 transition-colors">
              <LogOut className="h-4 w-4 shrink-0" />
              {t("logout")}
            </button>
          </>
        ) : (
          <Link href="/login"
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors">
            <User className="h-4 w-4 shrink-0" />
            {t("login")}
          </Link>
        )}
        <p className="text-[10px] text-muted-foreground text-center pt-0.5">v4.0.0</p>
      </div>
    </aside>
  )
}

export function MobileNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthStore()
  const { t } = useLangStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="flex justify-around py-1.5">
        {MOBILE_NAV.map(({ href, key, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link key={href} href={href} className={cn(
              "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg min-w-[48px]",
              active ? "text-emerald-600" : "text-muted-foreground"
            )}>
              <Icon className="h-5 w-5" />
              <span className="text-[9px] font-medium">{t(key)}</span>
            </Link>
          )
        })}
        {user && (
          <button onClick={() => { logout(); router.replace("/login") }}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-muted-foreground hover:text-red-500">
            <LogOut className="h-5 w-5" />
            <span className="text-[9px]">{t("logout")}</span>
          </button>
        )}
      </div>
    </nav>
  )
}
