"use client"

import { useState, useEffect } from "react"
import { X, Loader2, ChevronDown, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input, Textarea, Label } from "@/components/ui/index"
import { ContactSearch } from "@/components/ui/contact-search"
import { useFinanceStore } from "@/store/finance"
import { useSettingsStore } from "@/store/settings"
import { useFeaturesStore } from "@/store/features"
import { useLangStore } from "@/store/lang"
import { today } from "@/lib/utils"
import type { Income, Expense, Lend, Borrow } from "@/types"
import { cn } from "@/lib/utils"

type EntryType = "income" | "expense" | "lend" | "borrow"

interface Props {
  type: EntryType
  editItem?: Income | Expense | Lend | Borrow | null
  onClearEdit?: () => void
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  )
}

function SelectDropdown({ value, onChange, options, placeholder }: {
  value: string; onChange: (v: string) => void
  options: string[]; placeholder?: string
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
    </div>
  )
}

export function EntrySidebar({ type, editItem, onClearEdit }: Props) {
  const { t } = useLangStore()
  const { categories, mediums } = useSettingsStore()
  const { accounts, tags: allTags } = useFeaturesStore()
  const {
    addIncome, updateIncome,
    addExpense, updateExpense,
    addLend, updateLend,
    addBorrow, updateBorrow,
  } = useFinanceStore()

  // Mobile open/close state — desktop always open
  const [mobileOpen, setMobileOpen] = useState(false)

  const isEdit = !!editItem

  const catOptions = categories
    .filter((c) => {
      if (type === "income") return c.forType === "income" || c.forType === "both"
      if (type === "expense") return c.forType === "expense" || c.forType === "both"
      return true
    })
    .map((c) => c.name)

  const mediumOptions = mediums.map((m) => m.name)

  const [amount, setAmount] = useState("")
  const [date, setDate] = useState(today())
  const [medium, setMedium] = useState("")
  const [category, setCategory] = useState("")
  const [reason, setReason] = useState("")
  const [contactName, setContactName] = useState("")
  const [contactPhone, setContactPhone] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [accountId, setAccountId] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Prefill on edit, clear on editItem=null
  useEffect(() => {
    if (!editItem) {
      setAmount(""); setDate(today())
      setMedium(mediumOptions[0] || "")
      setCategory(catOptions[0] || "")
      setReason(""); setContactName(""); setContactPhone(""); setDueDate("")
      const defaultAcc = accounts.find((a) => a.isDefault)
      setAccountId(defaultAcc?.id || "")
      setSelectedTags([])
      return
    }
    // open mobile sidebar when edit starts
    setMobileOpen(true)
    setAmount(String(editItem.amount))
    setDate(editItem.date)
    setMedium(editItem.medium)
    setCategory((editItem as any).category || "")
    setReason(editItem.reason || "")
    setDueDate((editItem as any).dueDate || "")
    setAccountId((editItem as any).accountId || "")
    setSelectedTags(((editItem as any).tags || "").split(",").filter(Boolean))
    if (type === "income") { setContactName((editItem as Income).from || ""); setContactPhone((editItem as Income).fromPhone || "") }
    else if (type === "expense") { setContactName((editItem as Expense).payTo || ""); setContactPhone((editItem as Expense).payToPhone || "") }
    else if (type === "lend") { setContactName((editItem as Lend).to || ""); setContactPhone((editItem as Lend).toPhone || "") }
    else if (type === "borrow") { setContactName((editItem as Borrow).from || ""); setContactPhone((editItem as Borrow).fromPhone || "") }
  }, [editItem]) // eslint-disable-line

  // Update defaults when settings load
  useEffect(() => {
    if (!editItem) {
      if (!medium && mediumOptions.length > 0) setMedium(mediumOptions[0])
      if (!category && catOptions.length > 0) setCategory(catOptions[0])
    }
  }, [mediums, categories]) // eslint-disable-line

  const reset = () => {
    setAmount(""); setDate(today())
    setMedium(mediumOptions[0] || "")
    setCategory(catOptions[0] || "")
    setReason(""); setContactName(""); setContactPhone(""); setDueDate("")
    const defaultAcc = accounts.find((a) => a.isDefault)
    setAccountId(defaultAcc?.id || "")
    setSelectedTags([])
    if (onClearEdit) onClearEdit()
  }

  const handleSave = async () => {
    if (!amount || Number(amount) <= 0) return
    setSaving(true)
    const tagsStr = selectedTags.join(",")
    try {
      if (type === "income") {
        const data = { amount: Number(amount), date, from: contactName, fromPhone: contactPhone, medium, category, reason, accountId: accountId || null, tags: tagsStr }
        isEdit ? await updateIncome(editItem!.id, data) : await addIncome(data)
      } else if (type === "expense") {
        const data = { amount: Number(amount), date, payTo: contactName, payToPhone: contactPhone, medium, category, reason, accountId: accountId || null, tags: tagsStr }
        isEdit ? await updateExpense(editItem!.id, data) : await addExpense(data)
      } else if (type === "lend") {
        const data = { amount: Number(amount), date, to: contactName, toPhone: contactPhone, medium, dueDate, reason, accountId: accountId || null }
        isEdit ? await updateLend(editItem!.id, data) : await addLend(data)
      } else if (type === "borrow") {
        const data = { amount: Number(amount), date, from: contactName, fromPhone: contactPhone, medium, dueDate, reason, accountId: accountId || null }
        isEdit ? await updateBorrow(editItem!.id, data) : await addBorrow(data)
      }
      // Flash saved state, reset form
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
      reset()
      setMobileOpen(false)
    } finally { setSaving(false) }
  }

  const borderColors: Record<EntryType, string> = {
    income: "border-t-emerald-500",
    expense: "border-t-red-500",
    lend: "border-t-blue-500",
    borrow: "border-t-amber-500",
  }

  const btnColors: Record<EntryType, string> = {
    income: "bg-emerald-600 hover:bg-emerald-700 text-white",
    expense: "bg-red-500 hover:bg-red-600 text-white",
    lend: "bg-blue-600 hover:bg-blue-700 text-white",
    borrow: "bg-amber-500 hover:bg-amber-600 text-white",
  }

  const fabColors: Record<EntryType, string> = {
    income: "bg-emerald-600 hover:bg-emerald-700",
    expense: "bg-red-500 hover:bg-red-600",
    lend: "bg-blue-600 hover:bg-blue-700",
    borrow: "bg-amber-500 hover:bg-amber-600",
  }

  const contactLabel =
    type === "income" ? t("from") :
    type === "expense" ? t("payTo") :
    type === "lend" ? t("toField") :
    t("fromField")

  const formBody = (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      {isEdit && (
        <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 text-xs rounded-lg px-3 py-2">
          <span>{t("editEntry")}</span>
          <button onClick={reset} className="hover:text-blue-900 transition-colors"><X className="w-3.5 h-3.5" /></button>
        </div>
      )}

      <Field label={`${t("amount")} *`}>
        <Input
          type="number" placeholder="০" value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="text-base font-semibold"
          onKeyDown={(e) => e.key === "Enter" && handleSave()}
        />
      </Field>

      <Field label={`${t("date")} *`}>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </Field>

      <Field label={contactLabel}>
        <ContactSearch
          value={contactName}
          phone={contactPhone}
          onChange={(name, phone) => { setContactName(name); setContactPhone(phone) }}
        />
      </Field>

      <Field label={t("medium")}>
        {mediumOptions.length > 0
          ? <SelectDropdown value={medium} onChange={setMedium} options={mediumOptions} placeholder="— বেছে নিন —" />
          : <Input placeholder="মাধ্যম লিখুন..." value={medium} onChange={(e) => setMedium(e.target.value)} />
        }
      </Field>

      {(type === "income" || type === "expense") && (
        <Field label={t("category")}>
          {catOptions.length > 0
            ? <SelectDropdown value={category} onChange={setCategory} options={catOptions} placeholder="— বেছে নিন —" />
            : <Input placeholder="ক্যাটাগরি লিখুন..." value={category} onChange={(e) => setCategory(e.target.value)} />
          }
        </Field>
      )}

      {(type === "lend" || type === "borrow") && (
        <Field label={type === "lend" ? t("dueDate") : t("repayDate")}>
          <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      )}

      {accounts.length > 0 && (
        <Field label={t("account")}>
          <div className="relative">
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="flex h-10 w-full appearance-none rounded-md border border-input bg-background px-3 pr-8 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="">— বেছে নিন —</option>
              {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </Field>
      )}

      {(type === "income" || type === "expense") && allTags.length > 0 && (
        <Field label={t("tags")}>
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => {
              const active = selectedTags.includes(tag.name)
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => setSelectedTags((prev) => active ? prev.filter(n => n !== tag.name) : [...prev, tag.name])}
                  className="px-2.5 py-1 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: active ? tag.color : tag.color + "15",
                    color: active ? "#fff" : tag.color,
                  }}
                >
                  {tag.name}
                </button>
              )
            })}
          </div>
        </Field>
      )}

      <Field label={t("reason")}>
        <Textarea
          placeholder={t("reasonPlaceholder")}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="min-h-[72px]"
        />
      </Field>

      <p className="text-xs text-muted-foreground italic">{t("newContact")}</p>
    </div>
  )

  const formFooter = (
    <div className="p-4 border-t">
      <Button
        className={cn("w-full transition-all", saved ? "bg-emerald-600 text-white" : btnColors[type])}
        onClick={handleSave}
        disabled={saving || !amount || Number(amount) <= 0}
      >
        {saving
          ? <><Loader2 className="w-4 h-4 animate-spin mr-2" />{t("saving")}</>
          : saved
          ? "✓ সেভ হয়েছে"
          : isEdit ? t("save") : t("save")
        }
      </Button>
    </div>
  )

  return (
    <>
      {/* ── Desktop: always-visible right sidebar ── */}
      <aside className={cn(
        "hidden md:flex w-72 shrink-0 border-l bg-card flex-col border-t-4 sticky top-0 h-screen",
        borderColors[type]
      )}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b">
          <h2 className="font-semibold text-sm">
            {isEdit ? t("editEntry") : t("entryForm")}
          </h2>
          {isEdit && (
            <button onClick={reset} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {formBody}
        {formFooter}
      </aside>

      {/* ── Mobile: FAB + slide-up drawer ── */}
      <div className="md:hidden">
        {/* FAB button */}
        {!mobileOpen && (
          <button
            onClick={() => setMobileOpen(true)}
            className={cn(
              "fixed bottom-20 right-4 z-40 w-14 h-14 rounded-full shadow-lg text-white flex items-center justify-center transition-all",
              fabColors[type]
            )}
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => { setMobileOpen(false); reset() }}
          />
        )}

        {/* Drawer */}
        <div className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl border-t-4 flex flex-col transition-transform duration-300",
          borderColors[type],
          mobileOpen ? "translate-y-0" : "translate-y-full"
        )}
          style={{ maxHeight: "90vh" }}
        >
          <div className="flex items-center justify-between px-4 py-3.5 border-b">
            <h2 className="font-semibold text-sm">
              {isEdit ? t("editEntry") : t("entryForm")}
            </h2>
            <button
              onClick={() => { setMobileOpen(false); reset() }}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="overflow-y-auto flex-1">
            {formBody}
          </div>
          {formFooter}
        </div>
      </div>
    </>
  )
}
