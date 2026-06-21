# 🚀 হিসাবনিকাশ — Deploy Guide
## Render (Backend) + Vercel (Frontend)

---

## ধাপ ১ — GitHub-এ Push করুন

```bash
# প্রথমে দুটো আলাদা repo বানান বা একটা monorepo

# Backend
cd hisabnkash-backend
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/hisabnkash-backend.git
git push -u origin main

# Frontend
cd hisabnkash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_USERNAME/hisabnkash.git
git push -u origin main
```

---

## ধাপ ২ — Render-এ Backend Deploy করুন

### ২.১ — নতুন Web Service তৈরি করুন

1. **https://render.com** → Sign up / Login
2. **New +** → **Web Service**
3. GitHub repo connect করুন: `hisabnkash-backend`
4. নিচের সেটিংস দিন:

| সেটিং | মান |
|--------|-----|
| Name | `hisabnkash-backend` |
| Region | `Singapore (Southeast Asia)` |
| Branch | `main` |
| Runtime | `Node` |
| Build Command | `npm install && npm run build && npx prisma generate` |
| Start Command | `npm start` |
| Plan | `Free` |

### ২.২ — PostgreSQL Database তৈরি করুন

1. **New +** → **PostgreSQL**
2. সেটিংস:

| সেটিং | মান |
|--------|-----|
| Name | `hisabnkash-db` |
| Region | `Singapore` |
| Plan | `Free` |

3. Database তৈরি হলে **Internal Database URL** কপি করুন

### ২.৩ — Environment Variables সেট করুন

Web Service → **Environment** ট্যাব:

```
DATABASE_URL    = (PostgreSQL Internal URL)
JWT_SECRET      = (যেকোনো লম্বা random string, যেমন: openssl rand -hex 32)
NODE_ENV        = production
FRONTEND_URL    = https://hisabnkash.vercel.app  (পরে আপডেট করবেন)
PORT            = 4000
```

### ২.৪ — Database Migration চালান

⚠️ **গুরুত্বপূর্ণ:** `npx prisma` চালানোর আগে অবশ্যই `npm install` করে নিন। `npm install` ছাড়া `npx prisma` সরাসরি ইন্টারনেট থেকে সর্বশেষ Prisma ভার্সন (যেমন 7.x) নামিয়ে আনে, যা এই প্রজেক্টের schema-র (`url = env("DATABASE_URL")`, Prisma 6 সিনট্যাক্স) সাথে সামঞ্জস্যপূর্ণ নয় এবং `P1012` এরর দেখাবে। `package.json`-এ Prisma `6.19.3` সংস্করণ লক করা আছে — `npm install` চালালে সঠিক ভার্সনই ব্যবহার হবে।

Deploy হওয়ার পর Render Dashboard → **Shell**:

```bash
npm install
npx prisma migrate deploy
```

লোকাল মেশিনে (deploy করার আগে টেস্ট করতে চাইলে):
```bash
cd hisabnkash-backend-v5
npm install
npx prisma migrate deploy
```

### ২.৫ — Backend URL নিন
Deploy সফল হলে URL পাবেন: `https://hisabnkash-backend.onrender.com`

---

## ধাপ ৩ — Vercel-এ Frontend Deploy করুন

### ৩.১ — Vercel-এ Import করুন

1. **https://vercel.com** → Sign up / Login
2. **Add New Project** → GitHub repo: `hisabnkash`
3. Framework: **Next.js** (auto-detect হবে)

### ৩.২ — Environment Variables

**Settings → Environment Variables**:

```
NEXT_PUBLIC_API_URL = https://hisabnkash-backend.onrender.com
```

### ৩.৩ — Deploy

**Deploy** বাটন চাপুন। ২-৩ মিনিটে deploy হবে।

URL পাবেন: `https://hisabnkash.vercel.app`

---

## ধাপ ৪ — FRONTEND_URL আপডেট করুন

Render → Backend Web Service → **Environment**:
```
FRONTEND_URL = https://hisabnkash.vercel.app
```
তারপর **Manual Deploy** করুন।

---

## ✅ সবশেষ চেক

```bash
# Backend health check
curl https://hisabnkash-backend.onrender.com/api/health

# Expected response:
# {"status":"ok","timestamp":"...","version":"2.0.0"}
```

Frontend: `https://hisabnkash.vercel.app/register` এ গিয়ে নতুন অ্যাকাউন্ট খুলুন।

---

## ⚠️ গুরুত্বপূর্ণ নোট

- **Render Free Plan**: প্রথম request-এ ৩০-৫০ সেকেন্ড `cold start` লাগতে পারে
- **Render Free PostgreSQL**: ৯০ দিন পর মেয়াদ শেষ হয়, নিয়মিত backup রাখুন
- **JWT_SECRET**: কখনো public করবেন না, strong random string ব্যবহার করুন

---

## 🔄 পরবর্তী Deploy (Code Update)

```bash
# Backend
cd hisabnkash-backend
git add . && git commit -m "update" && git push
# Render auto-deploy হবে

# Frontend
cd hisabnkash
git add . && git commit -m "update" && git push
# Vercel auto-deploy হবে
```

---

## 📊 Prisma Studio (Database GUI)

Local development-এ database দেখতে:

```bash
cd hisabnkash-backend
DATABASE_URL="your-render-db-url" npx prisma studio
# http://localhost:5555 এ খুলবে
```

---

## 🛡️ Production Checklist

- [ ] `JWT_SECRET` শক্তিশালী করুন (`openssl rand -hex 32`)
- [ ] `FRONTEND_URL` সঠিক Vercel URL দিয়ে আপডেট করুন
- [ ] Database migration চালান (`prisma migrate deploy`)
- [ ] Health check কাজ করছে কিনা দেখুন
- [ ] Register করে লগইন test করুন
- [ ] একটা income যোগ করে দেখুন sync হয় কিনা
