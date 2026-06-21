"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Wallet, Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { useLangStore } from "@/store/lang"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/index"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Lang } from "@/lib/i18n"

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuthStore()
  const { t, lang, setLang } = useLangStore()
  const router = useRouter()
  const [form, setForm] = useState({ name:"", email:"", password:"", confirm:"" })
  const [showPass, setShowPass] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({})
  const setF = (k:string,v:string) => { setForm(p=>({...p,[k]:v})); if(fieldErrors[k]) setFieldErrors(p=>({...p,[k]:""})) }

  const validate = () => {
    const errs: Record<string,string> = {}
    if (form.name.trim().length<2) errs.name = "নাম কমপক্ষে ২ অক্ষরের হতে হবে"
    if (!form.email.includes("@")) errs.email = "সঠিক ইমেইল দিন"
    if (form.password.length<6) errs.password = "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে"
    if (form.password!==form.confirm) errs.confirm = "পাসওয়ার্ড মিলছে না"
    setFieldErrors(errs); return Object.keys(errs).length===0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); clearError()
    if (!validate()) return
    try { await register(form.name.trim(), form.email, form.password); router.replace("/") } catch {}
  }

  const passLen = form.password.length
  const strength = passLen===0?null:passLen<6?t("weakPassword"):passLen<10?t("mediumPassword"):t("strongPassword")
  const strengthColor = strength===t("weakPassword")?"bg-red-400":strength===t("mediumPassword")?"bg-amber-400":"bg-emerald-500"
  const strengthWidth = strength===t("weakPassword")?"w-1/3":strength===t("mediumPassword")?"w-2/3":"w-full"

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{t("appName")}</h1>
          <div className="flex gap-2">
            {(["bn","en"] as Lang[]).map(l => (
              <button key={l} onClick={()=>setLang(l)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${lang===l?"border-emerald-500 bg-emerald-50 text-emerald-700":"border-border text-muted-foreground"}`}>
                {l==="bn"?"বাংলা":"English"}
              </button>
            ))}
          </div>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t("registerTitle")}</CardTitle>
            <CardDescription>{t("tagline")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
              <div className="space-y-1.5">
                <Label htmlFor="name">{t("yourName")}</Label>
                <Input id="name" placeholder="রাহেলা বেগম / John Doe" value={form.name} onChange={e=>setF("name",e.target.value)} required autoComplete="name" className={fieldErrors.name?"border-red-400":""} />
                {fieldErrors.name && <p className="text-xs text-red-500">{fieldErrors.name}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={e=>setF("email",e.target.value)} required autoComplete="email" className={fieldErrors.email?"border-red-400":""} />
                {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Input id="password" type={showPass?"text":"password"} placeholder="••••••••" value={form.password} onChange={e=>setF("password",e.target.value)} required autoComplete="new-password" className={`pr-10 ${fieldErrors.password?"border-red-400":""}`} />
                  <button type="button" onClick={()=>setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                  </button>
                </div>
                {form.password && (
                  <div className="space-y-1">
                    <div className="h-1 bg-muted rounded-full overflow-hidden"><div className={`h-full rounded-full transition-all ${strengthColor} ${strengthWidth}`}/></div>
                    <p className="text-xs text-muted-foreground">{strength}</p>
                  </div>
                )}
                {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="confirm">{t("confirmPassword")}</Label>
                <div className="relative">
                  <Input id="confirm" type={showPass?"text":"password"} placeholder="••••••••" value={form.confirm} onChange={e=>setF("confirm",e.target.value)} required autoComplete="new-password" className={`pr-10 ${fieldErrors.confirm?"border-red-400":""}`} />
                  {form.confirm&&form.confirm===form.password&&<CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500"/>}
                </div>
                {fieldErrors.confirm && <p className="text-xs text-red-500">{fieldErrors.confirm}</p>}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading?<><Loader2 className="w-4 h-4 animate-spin"/>{t("registering")}</>:t("registerBtn")}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t("haveAccount")}{" "}<Link href="/login" className="text-emerald-600 font-medium hover:underline">{t("loginLink")}</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
