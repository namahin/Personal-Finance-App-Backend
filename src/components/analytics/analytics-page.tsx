"use client"

import { useMemo } from "react"
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer,
} from "recharts"
import { Download, FileText } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useFinanceStore } from "@/store/finance"
import { useLangStore } from "@/store/lang"
import { formatBDT, getMonthLabel } from "@/lib/utils"
import { generateFinancePDF } from "@/lib/pdf-export"

const COLORS = ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#0ea5e9","#f97316","#84cc16","#ec4899"]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {formatBDT(p.value)}</p>
      ))}
    </div>
  )
}

export default function AnalyticsPage() {
  const { income, expense, lend, borrow } = useFinanceStore()
  const { t } = useLangStore()

  const monthlyData = useMemo(() => {
    const months = [...new Set([...income, ...expense].map(i => i.date.slice(0, 7)))].sort().slice(-6)
    return months.map(m => ({
      month: getMonthLabel(m),
      আয়: income.filter(i => i.date.startsWith(m)).reduce((s, i) => s + i.amount, 0),
      ব্যয়: expense.filter(i => i.date.startsWith(m)).reduce((s, i) => s + i.amount, 0),
    }))
  }, [income, expense])

  const savingsData = useMemo(() => {
    return monthlyData.map(m => ({ ...m, সঞ্চয়: m["আয়"] - m["ব্যয়"] }))
  }, [monthlyData])

  const expensePieData = useMemo(() => {
    const cats: Record<string, number> = {}
    expense.forEach(i => { cats[i.category] = (cats[i.category] || 0) + i.amount })
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [expense])

  const incomePieData = useMemo(() => {
    const cats: Record<string, number> = {}
    income.forEach(i => { cats[i.category] = (cats[i.category] || 0) + i.amount })
    return Object.entries(cats).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  }, [income])

  const exportAll = () => {
    const bom = "\uFEFF"
    const iRows = income.map(i => ["আয়", i.date, i.amount, i.from || "", i.medium, i.category, i.reason || ""])
    const eRows = expense.map(i => ["ব্যয়", i.date, i.amount, i.payTo || "", i.medium, i.category, i.reason || ""])
    const rows = [["ধরন", "তারিখ", "পরিমাণ", "নাম", "মাধ্যম", "ক্যাটাগরি", "কারণ"], ...iRows, ...eRows]
      .sort((a, b) => String(a[1]).localeCompare(String(b[1])))
    const csv = bom + rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n")
    const a = document.createElement("a")
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }))
    a.download = "hisabnkash-all.csv"
    a.click()
  }

  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
    if (percent < 0.05) return null
    const RADIAN = Math.PI / 180
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={10} fontWeight={600}>
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">বিশ্লেষণ</h1>
          <p className="text-sm text-muted-foreground">আয়-ব্যয়ের চার্ট ও পরিসংখ্যান</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportAll}><Download className="h-4 w-4" /> সব ডেটা CSV</Button>
        <Button variant="outline" size="sm" onClick={() => generateFinancePDF({ title: "Finance_Report", subtitle: `Generated report — ${new Date().toLocaleDateString()}`, income, expense, lend, borrow })}>
          <FileText className="h-4 w-4" /> {t("exportPDF")}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <Card>
          <CardHeader><CardTitle className="text-sm">আয় vs ব্যয় (মাসওয়ারি)</CardTitle></CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">ডেটা নেই</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1000) + "k"} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="আয়" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="ব্যয়" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Savings Line */}
        <Card>
          <CardHeader><CardTitle className="text-sm">মাসিক সঞ্চয় প্রবণতা</CardTitle></CardHeader>
          <CardContent>
            {savingsData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">ডেটা নেই</p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={savingsData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v / 1000) + "k"} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="সঞ্চয়"
                    stroke="#8b5cf6" strokeWidth={2.5}
                    dot={{ fill: "#8b5cf6", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Expense Pie */}
        <Card>
          <CardHeader><CardTitle className="text-sm">ব্যয়ের ক্যাটাগরি বিশ্লেষণ</CardTitle></CardHeader>
          <CardContent>
            {expensePieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">ডেটা নেই</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={expensePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={renderCustomLabel}>
                      {expensePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatBDT(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 flex-1">
                  {expensePieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground truncate">{entry.name}</span>
                      <span className="font-medium ml-auto shrink-0">{formatBDT(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Income Pie */}
        <Card>
          <CardHeader><CardTitle className="text-sm">আয়ের ক্যাটাগরি বিশ্লেষণ</CardTitle></CardHeader>
          <CardContent>
            {incomePieData.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">ডেটা নেই</p>
            ) : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={incomePieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" labelLine={false} label={renderCustomLabel}>
                      {incomePieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(v) => formatBDT(Number(v))} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 flex-1">
                  {incomePieData.map((entry, i) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                      <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground truncate">{entry.name}</span>
                      <span className="font-medium ml-auto shrink-0">{formatBDT(entry.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
