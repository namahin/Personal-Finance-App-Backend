"use client"
import { useState, useMemo } from "react"
import { Pencil, Trash2, Download, CheckCircle2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/index"
import { EntrySidebar } from "@/components/ui/entry-sidebar"
import { useFinanceStore } from "@/store/finance"
import { useLangStore } from "@/store/lang"
import { formatBDT, formatDate, getDaysUntil } from "@/lib/utils"
import type { Lend } from "@/types"

export default function LendPage() {
  const { lend, deleteLend, markLendPaid } = useFinanceStore()
  const { t } = useLangStore()
  const [editItem, setEditItem] = useState<Lend | null>(null)
  const [filter, setFilter] = useState<"all"|"pending"|"paid">("all")

  const filtered = useMemo(() => [...lend]
    .filter(i => filter==="all"?true:filter==="pending"?!i.paid:i.paid)
    .sort((a,b)=>b.date.localeCompare(a.date)), [lend, filter])
  const pending = lend.filter(i=>!i.paid).reduce((s,i)=>s+i.amount,0)

  const exportCSV = () => {
    const bom="\uFEFF"
    const rows=[["তারিখ","পরিমাণ","কাকে","মোবাইল","মাধ্যম","ফেরতের তারিখ","কারণ","পরিশোধ"],
      ...filtered.map(i=>[i.date,i.amount,i.to,i.toPhone,i.medium,i.dueDate,i.reason,i.paid?"হ্যাঁ":"না"])]
    const csv=bom+rows.map(r=>r.map(v=>`"${String(v||"").replace(/"/g,'""')}"`).join(",")).join("\n")
    const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));a.download="lend.csv";a.click()
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1 p-6 space-y-4 min-w-0 overflow-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold">{t("lendTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("pendingLend")}: <span className="text-blue-600 font-semibold">{formatBDT(pending)}</span></p>
          </div>
          <Button variant="outline" size="sm" onClick={exportCSV}><Download className="h-4 w-4"/>{t("csvExport")}</Button>
        </div>
        <div className="flex gap-2">
          {(["all","pending","paid"] as const).map(f=>(
            <button key={f} onClick={()=>setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${filter===f?"bg-primary text-primary-foreground":"bg-muted text-muted-foreground hover:bg-accent"}`}>
              {f==="all"?t("all"):f==="pending"?t("pending"):t("paid")}
            </button>
          ))}
        </div>
        <Card>
          <CardContent className="p-0">
            {filtered.length===0
              ? <div className="py-16 text-center text-muted-foreground text-sm">{t("lendEmpty")}</div>
              : <div className="divide-y">
                  {filtered.map(item=>{
                    const diff=item.dueDate?getDaysUntil(item.dueDate):null
                    return (
                      <div key={item.id} className={`flex items-start justify-between p-4 hover:bg-muted/30 transition-colors ${editItem?.id===item.id?"bg-blue-50 dark:bg-blue-950/20 border-l-2 border-l-blue-500":""} ${item.paid?"opacity-60":""}`}>
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`font-medium text-sm ${item.paid?"line-through":""}`}>{item.to}</span>
                            {item.toPhone&&<span className="text-xs text-muted-foreground">{item.toPhone}</span>}
                            {item.medium&&<Badge variant="outline" className="text-xs">{item.medium}</Badge>}
                            {item.paid
                              ?<Badge variant="success">{t("receivedOn")} · {formatDate(item.paidDate!)}</Badge>
                              :diff!==null&&<Badge variant={diff<0?"destructive":diff<=3?"warning":"info"}>
                                {diff<0?`${Math.abs(diff)} ${t("daysAgo")}`:diff===0?t("today"):`${diff} ${t("daysLeft")}`}
                              </Badge>
                            }
                          </div>
                          <p className="text-xs text-muted-foreground">{formatDate(item.date)}{item.dueDate&&!item.paid&&` · ${t("returnDate")}: ${formatDate(item.dueDate)}`}</p>
                          {item.reason&&<p className="text-xs text-muted-foreground italic">{item.reason}</p>}
                        </div>
                        <div className="flex items-center gap-2 ml-3 shrink-0">
                          <span className="font-bold text-blue-600">{formatBDT(item.amount)}</span>
                          {!item.paid&&(
                            <Button variant="ghost" size="icon-sm" onClick={()=>setEditItem(editItem?.id===item.id?null:item)}
                              className={editItem?.id===item.id?"text-blue-600":"text-muted-foreground hover:text-blue-600"}>
                              <Pencil className="h-3.5 w-3.5"/>
                            </Button>
                          )}
                          {!item.paid&&(
                            <Button variant="ghost" size="icon-sm" onClick={()=>markLendPaid(item.id)} className="text-emerald-600 hover:text-emerald-700">
                              <CheckCircle2 className="h-4 w-4"/>
                            </Button>
                          )}
                          <Button variant="ghost" size="icon-sm" onClick={()=>deleteLend(item.id)} className="text-muted-foreground hover:text-destructive">
                            <Trash2 className="h-3.5 w-3.5"/>
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
            }
          </CardContent>
        </Card>
      </div>
      <EntrySidebar type="lend" editItem={editItem} onClearEdit={()=>setEditItem(null)}/>
    </div>
  )
}
