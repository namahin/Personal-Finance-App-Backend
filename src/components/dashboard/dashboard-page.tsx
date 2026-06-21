"use client"

import { useMemo } from "react"
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownLeft, CheckCircle2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge, Progress } from "@/components/ui/index"
import { useFinanceStore } from "@/store/finance"
import { useFeaturesStore } from "@/store/features"
import { useLangStore } from "@/store/lang"
import { formatBDT, formatDate, thisMonth, getDaysUntil } from "@/lib/utils"

function StatCard({ title, value, icon: Icon, colorClass }: {
  title: string; value: string; icon: React.ElementType; colorClass: string
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground mb-1">{title}</p>
            <p className={`text-xl font-bold ${colorClass}`}>{value}</p>
          </div>
          <div className={`p-2 rounded-lg ${colorClass.replace("text-","bg-").replace("-600","-100").replace("-700","-100")}`}>
            <Icon className={`h-5 w-5 ${colorClass}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { income, expense, lend, borrow } = useFinanceStore()
  const { accounts, recurrings, savingsGoals } = useFeaturesStore()
  const { t } = useLangStore()
  const m = thisMonth()

  const stats = useMemo(() => {
    const totalIncome = income.reduce((s,i) => s+i.amount, 0)
    const totalExpense = expense.reduce((s,i) => s+i.amount, 0)
    const pendingLend = lend.filter(i=>!i.paid).reduce((s,i) => s+i.amount, 0)
    const pendingBorrow = borrow.filter(i=>!i.paid).reduce((s,i) => s+i.amount, 0)
    const mIncome = income.filter(i=>i.date.startsWith(m)).reduce((s,i) => s+i.amount, 0)
    const mExpense = expense.filter(i=>i.date.startsWith(m)).reduce((s,i) => s+i.amount, 0)
    const saveRate = mIncome > 0 ? Math.round(((mIncome-mExpense)/mIncome)*100) : 0
    return { totalIncome, totalExpense, pendingLend, pendingBorrow, mIncome, mExpense, saveRate, net: totalIncome-totalExpense }
  }, [income, expense, lend, borrow, m])

  const dues = useMemo(() => {
    const result: Array<{name:string;amount:number;diff:number;type:"lend"|"borrow"}> = []
    lend.filter(i=>!i.paid&&i.dueDate).forEach(i => {
      const diff = getDaysUntil(i.dueDate)
      if (diff <= 7) result.push({name:i.to, amount:i.amount, diff, type:"lend"})
    })
    borrow.filter(i=>!i.paid&&i.dueDate).forEach(i => {
      const diff = getDaysUntil(i.dueDate)
      if (diff <= 7) result.push({name:i.from, amount:i.amount, diff, type:"borrow"})
    })
    return result.sort((a,b) => a.diff-b.diff)
  }, [lend, borrow])

  const upcomingRecurring = useMemo(() => {
    const now = new Date(); now.setDate(now.getDate())
    return recurrings
      .filter(r => r.active && r.frequency === "monthly" && r.dayOfMonth)
      .map(r => {
        const today = new Date()
        let nextDate = new Date(today.getFullYear(), today.getMonth(), r.dayOfMonth)
        if (nextDate < today) nextDate = new Date(today.getFullYear(), today.getMonth() + 1, r.dayOfMonth)
        const diff = Math.ceil((nextDate.getTime() - today.getTime()) / 86400000)
        return { ...r, diff }
      })
      .filter(r => r.diff <= 7)
      .sort((a, b) => a.diff - b.diff)
  }, [recurrings])

  const recent = useMemo(() => [
    ...income.map(i => ({...i, _type:"income" as const})),
    ...expense.map(i => ({...i, _type:"expense" as const})),
  ].sort((a,b) => b.date.localeCompare(a.date)).slice(0,10), [income, expense])

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold">{t("dashboard")}</h1>
        <p className="text-sm text-muted-foreground">{t("tagline")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("totalIncome")} value={formatBDT(stats.totalIncome)} icon={TrendingUp} colorClass="text-emerald-600" />
        <StatCard title={t("totalExpense")} value={formatBDT(stats.totalExpense)} icon={TrendingDown} colorClass="text-red-600" />
        <StatCard title={t("lendPending")} value={formatBDT(stats.pendingLend)} icon={ArrowUpRight} colorClass="text-blue-600" />
        <StatCard title={t("borrowPending")} value={formatBDT(stats.pendingBorrow)} icon={ArrowDownLeft} colorClass="text-amber-600" />
      </div>

      {(accounts.length > 0 || savingsGoals.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {accounts.length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("accounts")}</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {accounts.map(acc => (
                  <div key={acc.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{acc.name}</span>
                    <span className={`font-semibold ${acc.balance < 0 ? "text-red-600" : ""}`}>{formatBDT(acc.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="font-medium">{t("totalBalance")}</span>
                  <span className="font-bold text-emerald-600">{formatBDT(accounts.reduce((s, a) => s + a.balance, 0))}</span>
                </div>
              </CardContent>
            </Card>
          )}
          {savingsGoals.filter(g => !g.completed).length > 0 && (
            <Card>
              <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("savingsGoals")}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {savingsGoals.filter(g => !g.completed).slice(0, 3).map(g => {
                  const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
                  return (
                    <div key={g.id}>
                      <div className="flex justify-between text-xs mb-1">
                        <span>{g.name}</span>
                        <span className="text-muted-foreground">{formatBDT(g.currentAmount)} / {formatBDT(g.targetAmount)}</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("thisMonth")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("income")}</span><span className="font-semibold text-emerald-600">{formatBDT(stats.mIncome)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">{t("expense")}</span><span className="font-semibold text-red-600">{formatBDT(stats.mExpense)}</span></div>
            <div className="border-t pt-3">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">{t("savings")}</span>
                <span className={`font-bold ${stats.mIncome-stats.mExpense>=0?"text-emerald-600":"text-red-600"}`}>{formatBDT(stats.mIncome-stats.mExpense)}</span>
              </div>
              <Progress value={Math.max(0,Math.min(100,stats.saveRate))} indicatorClassName={stats.saveRate>=0?"bg-emerald-500":"bg-red-500"} />
              <p className="text-xs text-muted-foreground mt-1.5">{t("savingsRate")}: {stats.saveRate}%</p>
            </div>
            <div className="flex justify-between text-sm border-t pt-3">
              <span className="text-muted-foreground">{t("netBalance")}</span>
              <span className={`font-bold text-base ${stats.net>=0?"text-emerald-600":"text-red-600"}`}>{formatBDT(stats.net)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("upcomingDues")}</CardTitle></CardHeader>
          <CardContent>
            {dues.length === 0 && upcomingRecurring.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-500 mb-2" />
                <p className="text-sm text-muted-foreground">{t("noDataThisWeek")}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dues.map((d,i) => (
                  <div key={`due-${i}`} className={`flex items-start justify-between p-3 rounded-lg text-sm ${d.diff<0?"bg-red-50 dark:bg-red-950/30":d.diff<=3?"bg-amber-50 dark:bg-amber-950/30":"bg-blue-50 dark:bg-blue-950/30"}`}>
                    <div>
                      <p className="font-medium">{d.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {d.type==="lend"?t("toReceive"):t("toPay")} ·{" "}
                        {d.diff<0?`${Math.abs(d.diff)} ${t("daysAgo")}`:d.diff===0?t("today"):`${d.diff} ${t("daysLeft")}`}
                      </p>
                    </div>
                    <span className="font-semibold">{formatBDT(d.amount)}</span>
                  </div>
                ))}
                {upcomingRecurring.map((r) => (
                  <div key={`rec-${r.id}`} className={`flex items-start justify-between p-3 rounded-lg text-sm ${r.diff<=3?"bg-purple-50 dark:bg-purple-950/30":"bg-slate-50 dark:bg-slate-900/30"}`}>
                    <div>
                      <p className="font-medium">{r.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t("recurring")} · {r.diff===0?t("today"):`${r.diff} ${t("daysLeft")}`}
                      </p>
                    </div>
                    <span className="font-semibold">{formatBDT(r.amount)}</span>
                  </div>
                ))}
              </div>

            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("recentTransactions")}</CardTitle></CardHeader>
          <CardContent>
            {recent.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">{t("noTransactions")}</p>
            ) : (
              <div className="space-y-2">
                {recent.map(item => (
                  <div key={item.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {item._type==="income"?(item as any).from||item.category:(item as any).payTo||item.category}
                      </p>
                      <p className="text-xs text-muted-foreground">{formatDate(item.date)} · {item.medium}</p>
                    </div>
                    <div className="flex items-center gap-2 ml-2 shrink-0">
                      <span className={`text-sm font-semibold ${item._type==="income"?"text-emerald-600":"text-red-600"}`}>
                        {item._type==="income"?"+":"−"}{formatBDT(item.amount)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
