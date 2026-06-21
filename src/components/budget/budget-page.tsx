"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/index"
import { Badge, Progress } from "@/components/ui/index"
import { useFinanceStore } from "@/store/finance"
import { useSettingsStore } from "@/store/settings"
import { useLangStore } from "@/store/lang"
import { formatBDT, thisMonth } from "@/lib/utils"

export default function BudgetPage() {
  const { expense, budgets, setBudget } = useFinanceStore()
  const { categories } = useSettingsStore()
  const { t } = useLangStore()

  const monthOptions = useMemo(() => {
    const months: string[] = []
    const now = new Date()
    for (let i = -2; i <= 3; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() + i, 1)
      months.push(d.toISOString().slice(0, 7))
    }
    return months
  }, [])

  const [selectedMonth, setSelectedMonth] = useState(thisMonth())
  const monthBudget = budgets[selectedMonth] || {}

  const expenseCats = categories.filter(c => c.forType === "expense" || c.forType === "both").map(c => c.name)

  const monthExpense = useMemo(() => {
    const cats: Record<string, number> = {}
    expense.filter(i => i.date.startsWith(selectedMonth)).forEach(i => {
      cats[i.category] = (cats[i.category] || 0) + i.amount
    })
    return cats
  }, [expense, selectedMonth])

  const totalBudget = Object.values(monthBudget).reduce((s, v) => s + (Number(v) || 0), 0)
  const totalSpent = Object.values(monthExpense).reduce((s, v) => s + v, 0)
  const overallPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("budgetTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("budgetSubtitle")}</p>
        </div>
        <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          {monthOptions.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      {/* Overall */}
      <Card>
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <p className="text-sm font-medium">{t("totalBudget")} — {selectedMonth}</p>
            </div>
            <div className="flex gap-4 text-sm">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t("totalBudget")}</p>
                <p className="font-bold">{formatBDT(totalBudget)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t("totalSpent")}</p>
                <p className={`font-bold ${totalSpent > totalBudget ? "text-red-600" : "text-emerald-600"}`}>{formatBDT(totalSpent)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{t("remaining")}</p>
                <p className={`font-bold ${totalBudget - totalSpent < 0 ? "text-red-600" : "text-emerald-600"}`}>{formatBDT(totalBudget - totalSpent)}</p>
              </div>
            </div>
          </div>
          <Progress value={Math.min(overallPct, 100)} className="h-2"
            indicatorClassName={overallPct > 100 ? "bg-red-500" : overallPct > 80 ? "bg-amber-500" : "bg-emerald-500"} />
          <p className="text-xs text-muted-foreground mt-1.5">{overallPct}{t("budgetUsed")}</p>
        </CardContent>
      </Card>

      {/* Per category */}
      <Card>
        <CardHeader><CardTitle className="text-sm font-medium">{t("budgetHint")}</CardTitle></CardHeader>
        <CardContent className="divide-y p-0">
          {expenseCats.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              সেটিংস থেকে ব্যয়ের ক্যাটাগরি যোগ করুন
            </p>
          ) : expenseCats.map(cat => {
            const budgeted = Number(monthBudget[cat] || 0)
            const spent = monthExpense[cat] || 0
            const pct = budgeted > 0 ? Math.round((spent / budgeted) * 100) : 0
            const over = budgeted > 0 && spent > budgeted
            return (
              <div key={cat} className="p-4 space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm font-medium">{cat}</span>
                    {over && <Badge variant="destructive" className="text-xs">{t("overBudget")}</Badge>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground">
                      {formatBDT(spent)}{budgeted > 0 && <> / {formatBDT(budgeted)}</>}
                    </span>
                    <Input type="number" placeholder={t("budget")} defaultValue={budgeted || ""}
                      className="w-28 h-8 text-xs"
                      onBlur={e => setBudget(selectedMonth, cat, Number(e.target.value) || 0)}
                      onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur() }} />
                  </div>
                </div>
                {budgeted > 0 && (
                  <>
                    <Progress value={Math.min(pct, 100)} className="h-1.5"
                      indicatorClassName={over ? "bg-red-500" : pct > 80 ? "bg-amber-500" : "bg-emerald-500"} />
                    <p className="text-xs text-muted-foreground">
                      {pct}{t("budgetUsed")}
                      {over ? ` · ${formatBDT(spent - budgeted)} অতিরিক্ত` : ` · ${formatBDT(budgeted - spent)} বাকি`}
                    </p>
                  </>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
