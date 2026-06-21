"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, PiggyBank, CheckCircle2, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge, Input, Label } from "@/components/ui/index"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFeaturesStore } from "@/store/features"
import { useLangStore } from "@/store/lang"
import { formatBDT, formatDate } from "@/lib/utils"
import type { SavingsGoal } from "@/types"

const GOAL_COLORS = ["#10b981","#3b82f6","#f59e0b","#ef4444","#8b5cf6","#ec4899"]

export default function SavingsPage() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, contributeSavings, deleteSavingsGoal } = useFeaturesStore()
  const { t } = useLangStore()
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<SavingsGoal | null>(null)
  const [contributeId, setContributeId] = useState<string | null>(null)
  const [contributeAmount, setContributeAmount] = useState("")
  const [form, setForm] = useState({ name: "", targetAmount: "", targetDate: "", color: GOAL_COLORS[0] })

  const openAdd = () => { setEditItem(null); setForm({ name: "", targetAmount: "", targetDate: "", color: GOAL_COLORS[0] }); setOpen(true) }
  const openEdit = (g: SavingsGoal) => { setEditItem(g); setForm({ name: g.name, targetAmount: String(g.targetAmount), targetDate: g.targetDate || "", color: g.color }); setOpen(true) }

  const save = async () => {
    if (!form.name.trim() || !form.targetAmount) return
    const data = { name: form.name.trim(), targetAmount: Number(form.targetAmount), targetDate: form.targetDate, color: form.color, icon: "target" }
    if (editItem) await updateSavingsGoal(editItem.id, data)
    else await addSavingsGoal(data)
    setOpen(false)
  }

  const handleContribute = async (id: string) => {
    if (!contributeAmount || Number(contributeAmount) <= 0) return
    await contributeSavings(id, Number(contributeAmount))
    setContributeId(null)
    setContributeAmount("")
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("savingsGoalsTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("savingsGoalsSubtitle")}</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" />{t("addGoal")}</Button>
      </div>

      {savingsGoals.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
          <PiggyBank className="w-8 h-8 text-muted-foreground/50" />
          {t("noGoals")}
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {savingsGoals.map(g => {
            const pct = Math.min(100, Math.round((g.currentAmount / g.targetAmount) * 100))
            return (
              <Card key={g.id} className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: g.color }} />
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: g.color + "20" }}>
                        {g.completed ? <CheckCircle2 className="w-4.5 h-4.5" style={{ color: g.color }} /> : <Target className="w-4.5 h-4.5" style={{ color: g.color }} />}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{g.name}</p>
                        {g.targetDate && <p className="text-xs text-muted-foreground">{formatDate(g.targetDate)}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(g)} className="p-1 text-muted-foreground hover:text-blue-600 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteSavingsGoal(g.id)} className="p-1 text-muted-foreground hover:text-red-600 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-bold" style={{ color: g.color }}>{formatBDT(g.currentAmount)}</span>
                      <span className="text-muted-foreground">{formatBDT(g.targetAmount)}</span>
                    </div>
                    <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="h-full transition-all rounded-full" style={{ width: `${pct}%`, background: g.color }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{pct}% {t("progress")}</span>
                      {g.completed && <Badge variant="success" className="text-[10px]">{t("goalCompleted")}</Badge>}
                    </div>
                  </div>

                  {!g.completed && (
                    contributeId === g.id ? (
                      <div className="flex gap-2">
                        <Input type="number" placeholder="০" value={contributeAmount} onChange={e => setContributeAmount(e.target.value)} className="h-8 text-sm" autoFocus
                          onKeyDown={e => e.key === "Enter" && handleContribute(g.id)} />
                        <Button size="sm" className="h-8" onClick={() => handleContribute(g.id)}>+</Button>
                        <Button size="sm" variant="outline" className="h-8" onClick={() => { setContributeId(null); setContributeAmount("") }}>✕</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => setContributeId(g.id)}>
                        <Plus className="w-3 h-3" />{t("contribute")}
                      </Button>
                    )
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editItem ? t("edit") : t("addGoal")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("goalName")}</Label>
              <Input placeholder="জরুরি তহবিল, ল্যাপটপ..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("targetAmount")}</Label>
              <Input type="number" placeholder="০" value={form.targetAmount} onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("targetDate")}</Label>
              <Input type="date" value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">রঙ</Label>
              <div className="flex gap-2">
                {GOAL_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                    className="w-7 h-7 rounded-full transition-all"
                    style={{ background: c, outline: form.color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }} />
                ))}
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
            <Button onClick={save} disabled={!form.name.trim() || !form.targetAmount}>{t("save")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
