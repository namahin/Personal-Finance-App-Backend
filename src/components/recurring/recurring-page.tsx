"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Play, Repeat } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge, Input, Label, Textarea } from "@/components/ui/index"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/index"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFeaturesStore } from "@/store/features"
import { useSettingsStore } from "@/store/settings"
import { useLangStore } from "@/store/lang"
import { formatBDT, formatDate, today } from "@/lib/utils"
import type { Recurring } from "@/types"

export default function RecurringPage() {
  const { recurrings, addRecurring, updateRecurring, toggleRecurring, runRecurring, deleteRecurring } = useFeaturesStore()
  const { categories, mediums } = useSettingsStore()
  const { t } = useLangStore()
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Recurring | null>(null)
  const [form, setForm] = useState({
    type: "expense" as "income" | "expense", amount: "", name: "",
    contactName: "", contactPhone: "", medium: "", category: "",
    reason: "", frequency: "monthly" as Recurring["frequency"],
    dayOfMonth: "1", startDate: today(), endDate: "", autoCreate: false,
  })

  const catOptions = categories.filter(c => c.forType === form.type || c.forType === "both").map(c => c.name)
  const mediumOptions = mediums.map(m => m.name)

  const openAdd = () => {
    setEditItem(null)
    setForm({ type: "expense", amount: "", name: "", contactName: "", contactPhone: "", medium: mediumOptions[0]||"", category: catOptions[0]||"", reason: "", frequency: "monthly", dayOfMonth: "1", startDate: today(), endDate: "", autoCreate: false })
    setOpen(true)
  }
  const openEdit = (r: Recurring) => {
    setEditItem(r)
    setForm({ type: r.type, amount: String(r.amount), name: r.name, contactName: r.contactName, contactPhone: r.contactPhone, medium: r.medium, category: r.category, reason: r.reason, frequency: r.frequency, dayOfMonth: String(r.dayOfMonth || 1), startDate: r.startDate, endDate: r.endDate || "", autoCreate: r.autoCreate })
    setOpen(true)
  }

  const save = async () => {
    if (!form.amount || !form.name.trim()) return
    const data = { ...form, amount: Number(form.amount), dayOfMonth: Number(form.dayOfMonth) || 1 }
    if (editItem) await updateRecurring(editItem.id, data)
    else await addRecurring(data)
    setOpen(false)
  }

  return (
    <div className="p-6 space-y-4 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("recurringTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("recurringSubtitle")}</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" />{t("addRecurring")}</Button>
      </div>

      {recurrings.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-2">
          <Repeat className="w-8 h-8 text-muted-foreground/50" />
          {t("noRecurring")}
        </CardContent></Card>
      ) : (
        <div className="space-y-3">
          {recurrings.map(r => (
            <Card key={r.id} className={!r.active ? "opacity-60" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{r.name}</span>
                      <Badge variant={r.type === "income" ? "income" : "expense"}>{r.type === "income" ? t("income") : t("expense")}</Badge>
                      <Badge variant="outline" className="text-xs">{t(r.frequency)}</Badge>
                      <Badge variant={r.active ? "success" : "secondary"}>{r.active ? t("active") : t("inactive")}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {r.contactName && `${r.contactName} · `}{r.medium} · {r.category}
                      {r.frequency === "monthly" && ` · প্রতি মাসের ${r.dayOfMonth} তারিখে`}
                    </p>
                    {r.lastRunDate && <p className="text-xs text-muted-foreground">{t("lastRun")}: {formatDate(r.lastRunDate)}</p>}
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`font-bold ${r.type === "income" ? "text-emerald-600" : "text-red-600"}`}>{formatBDT(r.amount)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t">
                  <Button size="sm" variant="outline" onClick={() => runRecurring(r.id)} className="h-7 text-xs">
                    <Play className="w-3 h-3" />{t("runNow")}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => toggleRecurring(r.id)} className="h-7 text-xs">
                    {r.active ? t("inactive") : t("active")}
                  </Button>
                  <div className="flex-1" />
                  <button onClick={() => openEdit(r)} className="p-1.5 text-muted-foreground hover:text-blue-600 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                  <button onClick={() => deleteRecurring(r.id)} className="p-1.5 text-muted-foreground hover:text-red-600 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editItem ? t("edit") : t("addRecurring")}</DialogTitle></DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-2">
              {(["income","expense"] as const).map(type => (
                <button key={type} onClick={() => setForm(p => ({ ...p, type }))}
                  className={`py-2 rounded-lg border-2 text-sm font-medium transition-colors ${form.type === type ? (type==="income"?"border-emerald-500 bg-emerald-50 text-emerald-700":"border-red-500 bg-red-50 text-red-700") : "border-border text-muted-foreground"}`}>
                  {type === "income" ? t("income") : t("expense")}
                </button>
              ))}
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("recurringName")}</Label>
              <Input placeholder="মাসিক বেতন, বাড়ি ভাড়া..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("amount")}</Label>
                <Input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("frequency")}</Label>
                <select value={form.frequency} onChange={e => setForm(p => ({ ...p, frequency: e.target.value as any }))}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                  <option value="monthly">{t("monthly")}</option>
                  <option value="weekly">{t("weekly")}</option>
                  <option value="yearly">{t("yearly")}</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("medium")}</Label>
                {mediumOptions.length > 0 ? (
                  <select value={form.medium} onChange={e => setForm(p => ({ ...p, medium: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">—</option>
                    {mediumOptions.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                ) : <Input value={form.medium} onChange={e => setForm(p => ({ ...p, medium: e.target.value }))} />}
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("category")}</Label>
                {catOptions.length > 0 ? (
                  <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                    <option value="">—</option>
                    {catOptions.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                ) : <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />}
              </div>
            </div>
            {form.frequency === "monthly" && (
              <div className="space-y-1.5">
                <Label className="text-xs">{t("dayOfMonth")}</Label>
                <Input type="number" min="1" max="31" value={form.dayOfMonth} onChange={e => setForm(p => ({ ...p, dayOfMonth: e.target.value }))} />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("startDate")}</Label>
                <Input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("endDate")}</Label>
                <Input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
            <Button onClick={save} disabled={!form.amount || !form.name.trim()}>{t("save")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
