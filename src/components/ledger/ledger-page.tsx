"use client"

import { useMemo, useState } from "react"
import { Users, ArrowLeft, Phone } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge, Input } from "@/components/ui/index"
import { useFinanceStore } from "@/store/finance"
import { useLangStore } from "@/store/lang"
import { formatBDT, formatDate } from "@/lib/utils"

interface LedgerRowLocal {
  name: string; phone: string
  totalIncome: number; totalExpense: number
  totalLentPending: number; totalBorrowedPending: number
  netOwed: number; txCount: number
}

export default function LedgerPage() {
  const { income, expense, lend, borrow } = useFinanceStore()
  const { t } = useLangStore()
  const [search, setSearch] = useState("")
  const [selected, setSelected] = useState<string | null>(null)

  // Build ledger client-side from local store (works offline + online)
  const rows = useMemo<LedgerRowLocal[]>(() => {
    const map = new Map<string, LedgerRowLocal>()
    const ensure = (name: string, phone: string) => {
      if (!name) return null
      const key = name.toLowerCase()
      if (!map.has(key)) map.set(key, { name, phone, totalIncome: 0, totalExpense: 0, totalLentPending: 0, totalBorrowedPending: 0, netOwed: 0, txCount: 0 })
      return map.get(key)!
    }
    income.forEach(i => { const r = ensure(i.from, i.fromPhone); if (r) { r.totalIncome += i.amount; r.txCount++ } })
    expense.forEach(e => { const r = ensure(e.payTo, e.payToPhone); if (r) { r.totalExpense += e.amount; r.txCount++ } })
    lend.forEach(l => { const r = ensure(l.to, l.toPhone); if (r) { r.txCount++; if (!l.paid) r.totalLentPending += l.amount } })
    borrow.forEach(b => { const r = ensure(b.from, b.fromPhone); if (r) { r.txCount++; if (!b.paid) r.totalBorrowedPending += b.amount } })
    return Array.from(map.values()).map(r => ({ ...r, netOwed: r.totalLentPending - r.totalBorrowedPending })).sort((a,b) => b.txCount - a.txCount)
  }, [income, expense, lend, borrow])

  const filtered = rows.filter(r => r.name.toLowerCase().includes(search.toLowerCase()))

  const selectedTimeline = useMemo(() => {
    if (!selected) return []
    const name = selected.toLowerCase()
    return [
      ...income.filter(i => i.from?.toLowerCase() === name).map(i => ({ ...i, _type: "income" as const })),
      ...expense.filter(e => e.payTo?.toLowerCase() === name).map(e => ({ ...e, _type: "expense" as const })),
      ...lend.filter(l => l.to?.toLowerCase() === name).map(l => ({ ...l, _type: "lend" as const })),
      ...borrow.filter(b => b.from?.toLowerCase() === name).map(b => ({ ...b, _type: "borrow" as const })),
    ].sort((a,b) => b.date.localeCompare(a.date))
  }, [selected, income, expense, lend, borrow])

  const selectedRow = rows.find(r => r.name === selected)

  if (selected && selectedRow) {
    return (
      <div className="p-6 space-y-4 max-w-3xl">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />{t("backToLedger")}
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <Users className="w-5 h-5 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{selectedRow.name}</h1>
            {selectedRow.phone && <p className="text-sm text-muted-foreground flex items-center gap-1"><Phone className="w-3 h-3" />{selectedRow.phone}</p>}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">{t("totalIncome")}</p><p className="font-bold text-emerald-600">{formatBDT(selectedRow.totalIncome)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">{t("totalExpense")}</p><p className="font-bold text-red-600">{formatBDT(selectedRow.totalExpense)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">{t("pendingLend")}</p><p className="font-bold text-blue-600">{formatBDT(selectedRow.totalLentPending)}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground mb-1">{t("pendingBorrow")}</p><p className="font-bold text-amber-600">{formatBDT(selectedRow.totalBorrowedPending)}</p></CardContent></Card>
        </div>

        <Card className={selectedRow.netOwed > 0 ? "border-blue-200 bg-blue-50 dark:bg-blue-950/30" : selectedRow.netOwed < 0 ? "border-amber-200 bg-amber-50 dark:bg-amber-950/30" : ""}>
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm font-medium">
              {selectedRow.netOwed > 0 ? t("theyOweYou") : selectedRow.netOwed < 0 ? t("youOweThem") : t("settled")}
            </span>
            <span className={`text-lg font-bold ${selectedRow.netOwed > 0 ? "text-blue-600" : selectedRow.netOwed < 0 ? "text-amber-600" : "text-muted-foreground"}`}>
              {formatBDT(Math.abs(selectedRow.netOwed))}
            </span>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardContent className="p-0 divide-y">
            {selectedTimeline.map((item: any) => (
              <div key={item.id} className="flex items-center justify-between p-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={item._type === "income" ? "income" : item._type === "expense" ? "expense" : item._type === "lend" ? "lend" : "borrow"}>
                      {item._type === "income" ? t("income") : item._type === "expense" ? t("expense") : item._type === "lend" ? t("lendTitle") : t("borrowTitle")}
                    </Badge>
                    {("paid" in item) && (item.paid ? <Badge variant="success" className="text-[10px]">{t("paid")}</Badge> : <Badge variant="warning" className="text-[10px]">{t("pending")}</Badge>)}
                  </div>
                  <p className="text-xs text-muted-foreground">{formatDate(item.date)}{item.reason && ` · ${item.reason}`}</p>
                </div>
                <span className={`font-bold ${item._type === "income" ? "text-emerald-600" : item._type === "expense" ? "text-red-600" : item._type === "lend" ? "text-blue-600" : "text-amber-600"}`}>
                  {formatBDT(item.amount)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{t("ledgerTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("ledgerSubtitle")}</p>
      </div>

      <Input placeholder="নাম খুঁজুন..." value={search} onChange={e => setSearch(e.target.value)} className="max-w-sm" />

      {filtered.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
          <Users className="w-8 h-8 text-muted-foreground/50" />
          কোনো পরিচিতি নেই
        </CardContent></Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y">
            {filtered.map(r => (
              <button key={r.name} onClick={() => setSelected(r.name)} className="w-full flex items-center justify-between p-4 hover:bg-muted/30 transition-colors text-left">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{r.name}</p>
                    <p className="text-xs text-muted-foreground">{r.txCount} {t("transactions")}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {r.netOwed !== 0 ? (
                    <span className={`font-semibold text-sm ${r.netOwed > 0 ? "text-blue-600" : "text-amber-600"}`}>
                      {r.netOwed > 0 ? "+" : "−"}{formatBDT(Math.abs(r.netOwed))}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">{t("settled")}</span>
                  )}
                </div>
              </button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
