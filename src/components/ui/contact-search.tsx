"use client"

import { useState, useRef, useEffect } from "react"
import { Search, User, Building2, Plus, Phone } from "lucide-react"
import { useSettingsStore } from "@/store/settings"
import { useLangStore } from "@/store/lang"
import { cn } from "@/lib/utils"

interface Props {
  value: string
  phone?: string
  onChange: (name: string, phone: string) => void
  placeholder?: string
  className?: string
}

export function ContactSearch({ value, phone = "", onChange, placeholder, className }: Props) {
  const { contacts, findOrCreateContact } = useSettingsStore()
  const { t } = useLangStore()
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const [phoneVal, setPhoneVal] = useState(phone)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => { setQuery(value) }, [value])
  useEffect(() => { setPhoneVal(phone) }, [phone])

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  const filtered = contacts
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8)

  const showCreate = query.trim() && !contacts.find((c) => c.name.toLowerCase() === query.toLowerCase())

  const select = (name: string, contactPhone: string) => {
    setQuery(name)
    setPhoneVal(contactPhone)
    onChange(name, contactPhone)
    setOpen(false)
  }

  const handleCreate = async () => {
    if (!query.trim()) return
    const c = await findOrCreateContact(query.trim(), phoneVal)
    select(c.name, c.phone)
  }

  const handleBlur = () => {
    // short delay so click on dropdown item registers first
    setTimeout(() => {
      if (query.trim()) {
        onChange(query.trim(), phoneVal)
      }
    }, 150)
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Name input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder || t("fromPlaceholder")}
          className="flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Phone input */}
      <div className="relative mt-1.5">
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <input
          value={phoneVal}
          onChange={(e) => { setPhoneVal(e.target.value); onChange(query, e.target.value) }}
          placeholder={t("phonePlaceholder")}
          className="flex h-9 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </div>

      {/* Dropdown */}
      {open && (filtered.length > 0 || showCreate) && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border rounded-lg shadow-lg overflow-hidden">
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.map((c) => (
              <button
                key={c.id}
                type="button"
                onMouseDown={() => select(c.name, c.phone)}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent text-left transition-colors"
              >
                {c.type === "organization"
                  ? <Building2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  : <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                }
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.name}</p>
                  {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                </div>
              </button>
            ))}
            {showCreate && (
              <button
                type="button"
                onMouseDown={handleCreate}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm hover:bg-emerald-50 text-emerald-700 border-t transition-colors"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span>"{query}" যোগ করুন</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
