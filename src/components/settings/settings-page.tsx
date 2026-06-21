"use client"

import { useState } from "react"
import { Plus, Trash2, Pencil, Check, X, Globe } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/index"
import { useSettingsStore } from "@/store/settings"
import { useFeaturesStore } from "@/store/features"
import { useLangStore } from "@/store/lang"
import type { Contact } from "@/types"

function EditableRow({ name, onSave, onDelete }: { name: string; onSave: (v: string) => void; onDelete: () => void }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal] = useState(name)
  const save = () => { if (val.trim()) { onSave(val.trim()); setEditing(false) } }
  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0 group">
      {editing ? (
        <div className="flex gap-2 flex-1">
          <Input value={val} onChange={e => setVal(e.target.value)} className="h-7 text-sm" autoFocus
            onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false) }} />
          <Button size="icon-sm" onClick={save}><Check className="w-3.5 h-3.5" /></Button>
          <Button size="icon-sm" variant="ghost" onClick={() => setEditing(false)}><X className="w-3.5 h-3.5" /></Button>
        </div>
      ) : (
        <>
          <span className="text-sm">{name}</span>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon-sm" onClick={() => setEditing(true)}><Pencil className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon-sm" onClick={onDelete} className="hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        </>
      )}
    </div>
  )
}

const CAT_COLORS = ["#10b981","#3b82f6","#f59e0b","#8b5cf6","#ef4444","#f97316","#06b6d4","#84cc16"]

export default function SettingsPage() {
  const { t, lang, setLang } = useLangStore()
  const { contacts, categories, mediums, addContact, updateContact, deleteContact, addCategory, updateCategory, deleteCategory, addMedium, updateMedium, deleteMedium } = useSettingsStore()
  const { tags, addTag, deleteTag } = useFeaturesStore()

  const [newContact, setNewContact] = useState({ name: "", phone: "" })
  const [newCat, setNewCat] = useState({ name: "", forType: "expense" as "income"|"expense"|"both", color: "#6b7280" })
  const [newMedium, setNewMedium] = useState("")
  const [editContact, setEditContact] = useState<Contact | null>(null)
  const [editPhone, setEditPhone] = useState("")
  const [newTag, setNewTag] = useState("")

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">{t("settingsTitle")}</h1>
        <p className="text-sm text-muted-foreground">ক্যাটাগরি, মাধ্যম ও পরিচিতি পরিচালনা করুন</p>
      </div>

      {/* Language */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> {t("language")}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {(["bn","en"] as const).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${lang===l ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-accent"}`}>
                {l === "bn" ? "বাংলা" : "English"}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">{t("categories")}</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 flex-wrap items-center">
            <Input placeholder={lang === "bn" ? "ক্যাটাগরির নাম" : "Category name"} value={newCat.name}
              onChange={e => setNewCat(p=>({...p,name:e.target.value}))} className="flex-1 min-w-28 h-9"
              onKeyDown={e => e.key==="Enter" && newCat.name && addCategory(newCat.name,newCat.forType,newCat.color).then(()=>setNewCat(p=>({...p,name:""})))} />
            <select value={newCat.forType} onChange={e => setNewCat(p=>({...p,forType:e.target.value as any}))}
              className="h-9 rounded-md border border-input bg-background px-3 text-sm">
              <option value="income">{t("income")}</option>
              <option value="expense">{t("expense")}</option>
              <option value="both">{lang==="bn"?"উভয়":"Both"}</option>
            </select>
            <div className="flex gap-1">
              {CAT_COLORS.map(c=>(
                <button key={c} onClick={()=>setNewCat(p=>({...p,color:c}))}
                  className={`w-5 h-5 rounded-full transition-transform hover:scale-110 ${newCat.color===c?"ring-2 ring-offset-1 ring-gray-400 scale-110":""}`}
                  style={{background:c}} />
              ))}
            </div>
            <Button size="sm" disabled={!newCat.name.trim()}
              onClick={()=>addCategory(newCat.name,newCat.forType,newCat.color).then(()=>setNewCat(p=>({...p,name:""}))).catch(()=>{})}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div>
            {["income","expense","both"].map(ft => {
              const cats = categories.filter(c=>c.forType===ft)
              if(!cats.length) return null
              const label = ft==="income"?t("income"):ft==="expense"?t("expense"):(lang==="bn"?"উভয়":"Both")
              return (
                <div key={ft} className="mb-4">
                  <p className="text-xs text-muted-foreground mb-2 uppercase tracking-wide font-medium">{label}</p>
                  {cats.map(cat=>(
                    <div key={cat.id} className="flex items-center justify-between py-2 border-b last:border-0 group">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full shrink-0" style={{background:cat.color}} />
                        <span className="text-sm">{cat.name}</span>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="icon-sm" onClick={()=>{const nm=prompt(lang==="bn"?"নতুন নাম:":"New name:",cat.name);if(nm)updateCategory(cat.id,{name:nm})}}><Pencil className="w-3.5 h-3.5"/></Button>
                        <Button variant="ghost" size="icon-sm" onClick={()=>deleteCategory(cat.id)} className="hover:text-destructive"><Trash2 className="w-3.5 h-3.5"/></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
            {categories.length===0 && <p className="text-sm text-muted-foreground py-4 text-center">{lang==="bn"?"কোনো ক্যাটাগরি নেই":"No categories yet"}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Mediums */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">{t("mediums")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input placeholder={lang==="bn"?"মাধ্যমের নাম (যেমন: বিকাশ)":"Medium name (e.g. bKash)"} value={newMedium}
              onChange={e=>setNewMedium(e.target.value)} className="flex-1 h-9"
              onKeyDown={e=>e.key==="Enter"&&newMedium.trim()&&addMedium(newMedium.trim()).then(()=>setNewMedium("")).catch(()=>{})} />
            <Button size="sm" disabled={!newMedium.trim()} onClick={()=>addMedium(newMedium.trim()).then(()=>setNewMedium("")).catch(()=>{})}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div>
            {mediums.map(m=><EditableRow key={m.id} name={m.name} onSave={v=>updateMedium(m.id,v)} onDelete={()=>deleteMedium(m.id)} />)}
            {mediums.length===0 && <p className="text-sm text-muted-foreground py-4 text-center">{lang==="bn"?"কোনো মাধ্যম নেই":"No mediums yet"}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Contacts */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm">{t("contacts")}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Input placeholder={lang==="bn"?"নাম":"Name"} value={newContact.name} onChange={e=>setNewContact(p=>({...p,name:e.target.value}))} className="flex-1 min-w-28 h-9" />
            <Input placeholder={lang==="bn"?"মোবাইল নম্বর":"Phone"} value={newContact.phone} onChange={e=>setNewContact(p=>({...p,phone:e.target.value}))} className="w-36 h-9" />
            <Button size="sm" disabled={!newContact.name.trim()}
              onClick={()=>addContact(newContact.name.trim(),newContact.phone).then(()=>setNewContact({name:"",phone:""})).catch(()=>{})}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div>
            {contacts.map(c=>(
              <div key={c.id} className="flex items-center justify-between py-2.5 border-b last:border-0 group">
                {editContact?.id===c.id ? (
                  <div className="flex gap-2 flex-1">
                    <Input defaultValue={c.name} className="h-7 text-sm flex-1" autoFocus
                      onBlur={e=>updateContact(c.id,{name:e.target.value})} />
                    <Input value={editPhone} onChange={e=>setEditPhone(e.target.value)} className="h-7 text-sm w-32" placeholder={lang==="bn"?"মোবাইল":"Phone"} />
                    <Button size="icon-sm" onClick={()=>{updateContact(c.id,{phone:editPhone});setEditContact(null)}}><Check className="w-3.5 h-3.5"/></Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <p className="text-sm font-medium">{c.name}</p>
                      {c.phone && <p className="text-xs text-muted-foreground">{c.phone}</p>}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon-sm" onClick={()=>{setEditContact(c);setEditPhone(c.phone)}}><Pencil className="w-3.5 h-3.5"/></Button>
                      <Button variant="ghost" size="icon-sm" onClick={()=>deleteContact(c.id)} className="hover:text-destructive"><Trash2 className="w-3.5 h-3.5"/></Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {contacts.length===0 && <p className="text-sm text-muted-foreground py-4 text-center">{lang==="bn"?"কোনো পরিচিতি নেই":"No contacts yet"}</p>}
          </div>
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">{t("tags")}</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <div key={tag.id} className="group flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: tag.color + "20", color: tag.color }}>
                {tag.name}
                <button onClick={() => deleteTag(tag.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
            {tags.length === 0 && <p className="text-sm text-muted-foreground py-2">{lang==="bn"?"কোনো ট্যাগ নেই":"No tags yet"}</p>}
          </div>
          <div className="flex gap-2">
            <Input value={newTag} onChange={e => setNewTag(e.target.value)} placeholder={t("addTagPlaceholder")} className="h-8 text-sm flex-1"
              onKeyDown={e => { if (e.key === "Enter" && newTag.trim()) { addTag(newTag.trim()); setNewTag("") } }} />
            <Button size="sm" className="h-8 px-3" onClick={() => { if (newTag.trim()) { addTag(newTag.trim()); setNewTag("") } }} disabled={!newTag.trim()}>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
