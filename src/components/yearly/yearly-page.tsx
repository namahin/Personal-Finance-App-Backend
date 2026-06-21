"use client"

import { useMemo, useState } from "react"
import { TrendingUp, TrendingDown, Trophy, AlertTriangle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/index"
import { useFinanceStore } from "@/store/finance"
import { useLangStore } from "@/store/lang"
import { formatBDT } from "@/lib/utils"

const MONTH_NAMES_BN = ["জানু","ফেব","মার্চ","এপ্রিল","মে","জুন","জুলাই","আগস্ট","সেপ্ট","অক্টো","নভে","ডিসে"]
const MONTH_NAMES_EN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-background border rounded-lg p-3 shadow-lg text-xs">
      <p className="font-medium mb-1">{label}</p>
      {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {formatBDT(p.value)}</p>)}
    </div>
  )
}

export default function YearlyPage() {
  const { income, expense } = useFinanceStore()
  const { t, lang } = useLangStore()
  const currentYear = new Date().getFullYear()
  const [year, setYear] = useState(currentYear)
  const prevYear = year - 1
  const monthNames = lang === "bn" ? MONTH_NAMES_BN : MONTH_NAMES_EN

  const data = useMemo(() => {
    const breakdown = (items: { date: string; amount: number }[], y: number) => {
      const months = Array(12).fill(0)
      items.filter(i => i.date.startsWith(String(y))).forEach(i => {
        const mo = parseInt(i.date.slice(5, 7)) - 1
        months[mo] += i.amount
      })
      return months
    }
    const curInc = breakdown(income, year)
    const curExp = breakdown(expense, year)
    const prevInc = breakdown(income, prevYear)
    const prevExp = breakdown(expense, prevYear)

    const chartData = monthNames.map((m, i) => ({
      month: m,
      [`${year} আয়`]: curInc[i],
      [`${year} ব্যয়`]: curExp[i],
    }))

    const curTotalIncome = curInc.reduce((s, v) => s + v, 0)
    const curTotalExpense = curExp.reduce((s, v) => s + v, 0)
    const prevTotalIncome = prevInc.reduce((s, v) => s + v, 0)
    const prevTotalExpense = prevExp.reduce((s, v) => s + v, 0)

    const savingsPerMonth = curInc.map((inc, i) => inc - curExp[i])
    const bestMonth = savingsPerMonth.reduce((best, val, i, arr) => (val > arr[best] ? i : best), 0)
    const worstMonth = savingsPerMonth.reduce((worst, val, i, arr) => (val < arr[worst] ? i : worst), 0)

    return {
      chartData, curTotalIncome, curTotalExpense, prevTotalIncome, prevTotalExpense,
      incomeGrowth: prevTotalIncome > 0 ? Math.round(((curTotalIncome - prevTotalIncome) / prevTotalIncome) * 100) : null,
      expenseGrowth: prevTotalExpense > 0 ? Math.round(((curTotalExpense - prevTotalExpense) / prevTotalExpense) * 100) : null,
      bestMonth: monthNames[bestMonth], worstMonth: monthNames[worstMonth],
      bestMonthVal: savingsPerMonth[bestMonth], worstMonthVal: savingsPerMonth[worstMonth],
    }
  }, [income, expense, year, prevYear, monthNames])

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("yearlyTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("yearlySubtitle")}</p>
        </div>
        <select value={year} onChange={e => setYear(Number(e.target.value))}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm">
          {[currentYear, currentYear - 1, currentYear - 2].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Growth cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{t("totalIncome")} ({year})</p>
              {data.incomeGrowth !== null && (
                <Badge variant={data.incomeGrowth >= 0 ? "success" : "destructive"} className="flex items-center gap-1">
                  {data.incomeGrowth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(data.incomeGrowth)}%
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-emerald-600">{formatBDT(data.curTotalIncome)}</p>
            <p className="text-xs text-muted-foreground mt-1">{prevYear}: {formatBDT(data.prevTotalIncome)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">{t("totalExpense")} ({year})</p>
              {data.expenseGrowth !== null && (
                <Badge variant={data.expenseGrowth <= 0 ? "success" : "destructive"} className="flex items-center gap-1">
                  {data.expenseGrowth <= 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                  {Math.abs(data.expenseGrowth)}%
                </Badge>
              )}
            </div>
            <p className="text-2xl font-bold text-red-600">{formatBDT(data.curTotalExpense)}</p>
            <p className="text-xs text-muted-foreground mt-1">{prevYear}: {formatBDT(data.prevTotalExpense)}</p>
          </CardContent>
        </Card>
      </div>

      {/* Best / Worst month */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-emerald-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{t("bestMonth")}</p>
              <p className="font-bold">{data.bestMonth}</p>
              <p className="text-sm text-emerald-600 font-medium">{formatBDT(data.bestMonthVal)}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-600 shrink-0" />
            <div>
              <p className="text-xs text-muted-foreground">{t("worstMonth")}</p>
              <p className="font-bold">{data.worstMonth}</p>
              <p className="text-sm text-amber-600 font-medium">{formatBDT(data.worstMonthVal)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader><CardTitle className="text-sm">মাসওয়ারি আয়-ব্যয় ({year})</CardTitle></CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.chartData} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={v => (v/1000)+"k"} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey={`${year} আয়`} fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey={`${year} ব্যয়`} fill="#ef4444" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
