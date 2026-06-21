"use client"

import { useState } from "react"
import { Plus, Pencil, Trash2, Star, Wallet, Building2, Banknote, CircleDollarSign } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input, Label, Textarea } from "@/components/ui/index"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useFeaturesStore } from "@/store/features"
import { useLangStore } from "@/store/lang"
import { formatBDT } from "@/lib/utils"
import type { Account } from "@/types"

const ACCOUNT_ICONS: Record<string, React.ElementType> = {
  wallet: Wallet, bank: Building2, cash: Banknote, other: CircleDollarSign,
}
const ACCOUNT_COLORS = ["#3b82f6","#10b981","#f59e0b","#ef4444","#8b5cf6","#ec4899","#0ea5e9","#6b7280"]

export default function AccountsPage() {
  const { accounts, addAccount, updateAccount, deleteAccount } = useFeaturesStore()
  const { t } = useLangStore()
  const [open, setOpen] = useState(false)
  const [editItem, setEditItem] = useState<Account | null>(null)
  const [form, setForm] = useState({ name: "", type: "wallet" as Account["type"], openingBalance: "", color: ACCOUNT_COLORS[0], icon: "wallet", isDefault: false })

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

  const openAdd = () => { setEditItem(null); setForm({ name: "", type: "wallet", openingBalance: "", color: ACCOUNT_COLORS[0], icon: "wallet", isDefault: accounts.length === 0 }); setOpen(true) }
  const openEdit = (a: Account) => { setEditItem(a); setForm({ name: a.name, type: a.type, openingBalance: String(a.openingBalance), color: a.color, icon: a.icon, isDefault: a.isDefault }); setOpen(true) }

  const save = async () => {
    if (!form.name.trim()) return
    const data = { name: form.name.trim(), type: form.type, openingBalance: Number(form.openingBalance) || 0, color: form.color, icon: form.type, isDefault: form.isDefault }
    if (editItem) await updateAccount(editItem.id, data)
    else await addAccount(data)
    setOpen(false)
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{t("accountsTitle")}</h1>
          <p className="text-sm text-muted-foreground">{t("accountsSubtitle")}</p>
        </div>
        <Button onClick={openAdd}><Plus className="h-4 w-4" />{t("addAccount")}</Button>
      </div>

      {/* Total balance card */}
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 border-0 text-white">
        <CardContent className="p-6">
          <p className="text-sm text-emerald-100 mb-1">{t("totalBalance")}</p>
          <p className="text-3xl font-bold">{formatBDT(totalBalance)}</p>
          <p className="text-xs text-emerald-100 mt-2">{accounts.length} {t("account")}</p>
        </CardContent>
      </Card>

      {/* Account cards */}
      {accounts.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground text-sm">{t("noAccounts")}</CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => {
            const Icon = ACCOUNT_ICONS[acc.type] || Wallet
            return (
              <Card key={acc.id} className="relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full" style={{ background: acc.color }} />
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: acc.color + "20" }}>
                        <Icon className="w-4.5 h-4.5" style={{ color: acc.color }} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm flex items-center gap-1.5">
                          {acc.name}
                          {acc.isDefault && <Star className="w-3 h-3 fill-amber-400 text-amber-400" />}
                        </p>
                        <p className="text-xs text-muted-foreground">{t(`${acc.type}Type` as any)}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(acc)} className="p-1 text-muted-foreground hover:text-blue-600 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteAccount(acc.id)} className="p-1 text-muted-foreground hover:text-red-600 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <p className={`text-xl font-bold ${acc.balance < 0 ? "text-red-600" : ""}`}>{formatBDT(acc.balance)}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>{editItem ? t("edit") : t("addAccount")}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("accountName")}</Label>
              <Input placeholder="বিকাশ, ব্র্যাক ব্যাংক..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("accountType")}</Label>
              <div className="grid grid-cols-4 gap-2">
                {(["wallet","bank","cash","other"] as const).map(type => {
                  const Icon = ACCOUNT_ICONS[type]
                  return (
                    <button key={type} onClick={() => setForm(p => ({ ...p, type }))}
                      className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-colors ${form.type === type ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950" : "border-border hover:border-muted-foreground"}`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px]">{t(`${type}Type` as any)}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("openingBalance")}</Label>
              <Input type="number" placeholder="০" value={form.openingBalance} onChange={e => setForm(p => ({ ...p, openingBalance: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">রঙ</Label>
              <div className="flex gap-2 flex-wrap">
                {ACCOUNT_COLORS.map(c => (
                  <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                    className="w-7 h-7 rounded-full border-2 transition-all"
                    style={{ background: c, borderColor: form.color === c ? c : "transparent", outline: form.color === c ? `2px solid ${c}` : "none", outlineOffset: "2px" }} />
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm(p => ({ ...p, isDefault: e.target.checked }))} className="rounded" />
              {t("setDefault")}
            </label>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>{t("cancel")}</Button>
            <Button onClick={save} disabled={!form.name.trim()}>{t("save")}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
