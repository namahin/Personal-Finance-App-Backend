"use client"
import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Wallet, Eye, EyeOff, Loader2 } from "lucide-react"
import { useAuthStore } from "@/store/auth"
import { useLangStore } from "@/store/lang"
import { Button } from "@/components/ui/button"
import { Input, Label } from "@/components/ui/index"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import type { Lang } from "@/lib/i18n"

export default function LoginPage() {
  const { login, loading, error, clearError } = useAuthStore()
  const { t, lang, setLang } = useLangStore()
  const router = useRouter()
  const [form, setForm] = useState({ email: "", password: "" })
  const [showPass, setShowPass] = useState(false)
  const setF = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); clearError()
    try { await login(form.email, form.password); router.replace("/") } catch {}
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg">
            <Wallet className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold">{t("appName")}</h1>
          <p className="text-sm text-muted-foreground">{t("tagline")}</p>
          <div className="flex gap-2 mt-1">
            {(["bn","en"] as Lang[]).map(l => (
              <button key={l} onClick={() => setLang(l)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${lang===l?"border-emerald-500 bg-emerald-50 text-emerald-700":"border-border text-muted-foreground hover:text-foreground"}`}>
                {l==="bn"?"বাংলা":"English"}
              </button>
            ))}
          </div>
        </div>
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">{t("loginTitle")}</CardTitle>
            <CardDescription>{t("tagline")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
              <div className="space-y-1.5">
                <Label htmlFor="email">{t("email")}</Label>
                <Input id="email" type="email" placeholder="your@email.com" value={form.email} onChange={e=>setF("email",e.target.value)} required autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t("password")}</Label>
                <div className="relative">
                  <Input id="password" type={showPass?"text":"password"} placeholder="••••••••" value={form.password} onChange={e=>setF("password",e.target.value)} required autoComplete="current-password" className="pr-10" />
                  <button type="button" onClick={()=>setShowPass(p=>!p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPass?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                  </button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading?<><Loader2 className="w-4 h-4 animate-spin"/>{t("loggingIn")}</>:t("loginBtn")}
              </Button>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              {t("noAccount")}{" "}<Link href="/register" className="text-emerald-600 font-medium hover:underline">{t("registerLink")}</Link>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground">
          <Link href="/" className="text-emerald-600 hover:underline">{t("offlineMode")}</Link>
        </p>
      </div>
    </div>
  )
}
