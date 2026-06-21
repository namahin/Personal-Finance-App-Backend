"use client"

import { useState, useMemo } from "react"
import { Pencil, Trash2, Download } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/index"
import { EntrySidebar } from "@/components/ui/entry-sidebar"
import { useFinanceStore } from "@/store/finance"
import { useSettingsStore } from "@/store/settings"
import { useFeaturesStore } from "@/store/features"
import { useLangStore } from "@/store/lang"
import { formatBDT, formatDate } from "@/lib/utils"
import type { Income } from "@/types"

export default function IncomePage() {
  const { income, deleteIncome } = useFinanceStore()
  const { categories } = useSettingsStore()
  const { accounts } = useFeaturesStore()
  const { t } = useLangStore()
  const [editItem, setEditItem] = useState<Income | null>(null)
  const [monthFilter, setMonthFilter] = useState("")
  const [catFilter, setCatFilter] = useState("")

  const months = useMemo(() => [...new Set(income.map(i => i.date.slice(0, 7)))].sort().reverse(), [income])
  const catOptions = useMemo(() => categories.filter(c => c.forType === "income" || c.forType === "both").map(c => c.name), [categories])
  const filtered = useMemo(() => [...income]
    .filter(i => !monthFilter || i.date.startsWith(monthFilter))
    .filter(i => !catFilter || i.category === catFilter)
    .sort((a, b) => b.date.localeCompare(a.date)), [income, monthFilter, catFilter])
  const total = filtered.reduce((s, i) => s + i.amount, 0)

  const exportCSV = () => {
    const bom = "\uFEFF"
    const rows = [
      ["তারিখ","পরিমাণ","কে দিলো","মোবাইল","মাধ্যম","ক্যাটাগরি","ট্যাগ","কারণ"],
      ...filtered.map(i => [i.date, i.amount, i.from, i.fromPhone, i.medium, i.category, i.tags || "", i.reason]),
    ]
    const csv = bom + rows.map(r => r.map(v => `"${String(v||"").replace(/"/g,'""')}"`).join(",")).join("\n")
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"})); a.download="income.csv"; a.click()
  }

  return (
    <div className="flex min-h-screen">
      {/* Main content */}
      <div className="flex-1 p-6 space-y-4 min-w-0 overflow-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("incomeTitle")}</h1>
            <p className="text-sm text-muted-foreground">
              {t("totalLabel")}: <span className="text-emerald-600 font-semibold">{formatBDT(total)}</span>
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4" />{t("csvExport")}
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select value={monthFilter} onChange={e => setMonthFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">{t("allMonths")}</option>
            {months.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <option value="">{t("allCategories")}</option>
            {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <Card>
          <CardContent className="p-0">
            {filtered.length === 0 ? (
              <div className="py-16 text-center text-muted-foreground text-sm">{t("incomeEmpty")}</div>
            ) : (
              <div className="divide-y">
                {filtered.map(item => (
                  <div key={item.id}
                    className={`flex items-start justify-between p-4 hover:bg-muted/30 transition-colors ${editItem?.id === item.id ? "bg-emerald-50 dark:bg-emerald-950/20 border-l-2 border-l-emerald-500" : ""}`}>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{item.from || "—"}</span>
                        {item.fromPhone && <span className="text-xs text-muted-foreground">{item.fromPhone}</span>}
                        {item.category && <Badge variant="income">{item.category}</Badge>}
                        {item.medium && <Badge variant="outline" className="text-xs">{item.medium}</Badge>}
                        {item.accountId && accounts.find(a => a.id === item.accountId) && (
                          <Badge variant="secondary" className="text-xs">{accounts.find(a => a.id === item.accountId)?.name}</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{formatDate(item.date)}</p>
                      {item.reason && <p className="text-xs text-muted-foreground italic">{item.reason}</p>}
                      {item.tags && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {item.tags.split(",").filter(Boolean).map(tag => (
                            <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{tag}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 ml-3 shrink-0">
                      <span className="font-bold text-emerald-600">+{formatBDT(item.amount)}</span>
                      <Button variant="ghost" size="icon-sm"
                        onClick={() => setEditItem(editItem?.id === item.id ? null : item)}
                        className={editItem?.id === item.id ? "text-blue-600" : "text-muted-foreground hover:text-blue-600"}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon-sm" onClick={() => deleteIncome(item.id)}
                        className="text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Right sidebar — always visible on desktop */}
      <EntrySidebar type="income" editItem={editItem} onClearEdit={() => setEditItem(null)} />
    </div>
  )
}
