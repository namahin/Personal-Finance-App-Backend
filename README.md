# হিসাবনিকাশ 💰
### পার্সোনাল ফাইন্যান্স ম্যানেজার

---

## প্রজেক্ট স্ট্রাকচার

```
হিসাবনিকাশ/
├── hisabnkash/          ← ফ্রন্টএন্ড (Next.js 15 + Tailwind v4 + shadcn/ui)
└── hisabnkash-backend/  ← ব্যাকএন্ড (Express + TypeScript + JSON DB)
```

---

## ফিচার সমূহ

| ফিচার | বিবরণ |
|-------|--------|
| **আয় ট্র্যাকিং** | কে দিলো, মাধ্যম, ক্যাটাগরি, কারণ সহ |
| **ব্যয় ট্র্যাকিং** | কোথায়/কাকে, মাধ্যম, ক্যাটাগরি, কারণ সহ |
| **ধার দেওয়া** | কাকে, কবে ফেরত পাবো, ডিউ ডেট এলার্ট |
| **ধার নেওয়া** | কার কাছ থেকে, কবে পরিশোধ করবো, ডিউ ডেট এলার্ট |
| **ড্যাশবোর্ড** | সামগ্রিক সারসংক্ষেপ, সাম্প্রতিক লেনদেন, আসন্ন পাওনা/দেনা |
| **বিশ্লেষণ** | বার চার্ট, পাই চার্ট, লাইন চার্ট (recharts) |
| **বাজেট প্ল্যানার** | ক্যাটাগরি-ভিত্তিক মাসিক বাজেট, progress tracking |
| **CSV এক্সপোর্ট** | প্রতিটি সেকশন থেকে আলাদা CSV ডাউনলোড |
| **মোবাইল রেসপন্সিভ** | Bottom navigation সহ মোবাইলে পূর্ণ সাপোর্ট |

---

## ফ্রন্টএন্ড সেটআপ

```bash
cd hisabnkash
npm install
npm run dev        # http://localhost:3000
npm run build      # প্রোডাকশন বিল্ড
```

### টেকনোলজি
- **Next.js 15** (App Router)
- **Tailwind CSS v4**
- **shadcn/ui** (Radix UI primitives)
- **Zustand** (state management + localStorage)
- **Recharts** (চার্ট)
- **Lucide React** (আইকন)

### ফাইল স্ট্রাকচার
```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx               ← ড্যাশবোর্ড
│   ├── income/page.tsx
│   ├── expense/page.tsx
│   ├── lend/page.tsx
│   ├── borrow/page.tsx
│   ├── analytics/page.tsx
│   └── budget/page.tsx
├── components/
│   ├── ui/                    ← shadcn components
│   ├── layout/sidebar.tsx     ← Sidebar + Mobile Nav
│   ├── forms.tsx              ← সব ফর্ম (Income, Expense, Lend, Borrow)
│   ├── dashboard/
│   ├── income/
│   ├── expense/
│   ├── lend/
│   ├── borrow/
│   ├── analytics/
│   └── budget/
├── store/finance.ts           ← Zustand store
├── types/index.ts             ← TypeScript types
└── lib/utils.ts               ← Helper functions
```

---

## ব্যাকএন্ড সেটআপ

```bash
cd hisabnkash-backend
npm install
cp .env.example .env          # env কনফিগ করুন
npm run dev                   # http://localhost:4000
npm run build && npm start    # প্রোডাকশন
```

### API Endpoints

#### Auth
| Method | Endpoint | বিবরণ |
|--------|----------|--------|
| POST | `/api/auth/register` | নিবন্ধন |
| POST | `/api/auth/login` | লগইন |

#### আয় (Income)
| Method | Endpoint | বিবরণ |
|--------|----------|--------|
| GET | `/api/income?month=2026-06` | আয়ের তালিকা |
| POST | `/api/income` | নতুন আয় |
| DELETE | `/api/income/:id` | আয় মুছুন |

#### ব্যয় (Expense)
| Method | Endpoint | বিবরণ |
|--------|----------|--------|
| GET | `/api/expense?month=2026-06` | ব্যয়ের তালিকা |
| POST | `/api/expense` | নতুন ব্যয় |
| DELETE | `/api/expense/:id` | ব্যয় মুছুন |

#### ধার দিলাম (Lend)
| Method | Endpoint | বিবরণ |
|--------|----------|--------|
| GET | `/api/lend` | তালিকা |
| POST | `/api/lend` | নতুন |
| PATCH | `/api/lend/:id/paid` | পরিশোধ মার্ক |
| DELETE | `/api/lend/:id` | মুছুন |

#### ধার নিলাম (Borrow)
| Method | Endpoint | বিবরণ |
|--------|----------|--------|
| GET | `/api/borrow` | তালিকা |
| POST | `/api/borrow` | নতুন |
| PATCH | `/api/borrow/:id/paid` | পরিশোধ মার্ক |
| DELETE | `/api/borrow/:id` | মুছুন |

#### বাজেট
| Method | Endpoint | বিবরণ |
|--------|----------|--------|
| GET | `/api/budget/:month` | মাসের বাজেট |
| PUT | `/api/budget` | বাজেট সেট/আপডেট |

#### সারসংক্ষেপ
| Method | Endpoint | বিবরণ |
|--------|----------|--------|
| GET | `/api/summary?month=2026-06` | ড্যাশবোর্ড ডেটা |

### Auth Header
```
Authorization: Bearer <JWT_TOKEN>
```

---

## পরবর্তী পদক্ষেপ

### ফ্রন্টএন্ড ↔ ব্যাকএন্ড সংযোগ
1. ফ্রন্টএন্ডে `.env.local` তৈরি করুন:
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```
2. Zustand store-এ API calls যোগ করুন (localStorage-এর পরিবর্তে)
3. Login/Register পেজ তৈরি করুন

### ডাটাবেস আপগ্রেড
- **PostgreSQL**: `prisma` দিয়ে মাইগ্রেট করুন
- **SQLite**: `better-sqlite3` (production server-এ কাজ করবে)

### ডেপ্লয়মেন্ট
- **ফ্রন্টএন্ড**: Vercel
- **ব্যাকএন্ড**: Railway, Render, বা VPS
