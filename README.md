# হিসাবনিকাশ (Frontend)
পার্সোনাল ফাইন্যান্স ম্যানেজার — Next.js 15 + Tailwind v4 + shadcn/ui

## চালু করা
```bash
npm install
cp .env.local.example .env.local   # NEXT_PUBLIC_API_URL সেট করুন
npm run dev
```
http://localhost:3000 এ চলবে।

## পেজসমূহ
- `/` — ড্যাশবোর্ড (আয়/ব্যয়/অ্যাকাউন্ট ব্যালেন্স/আসন্ন পাওনা-দেনা/রিকারিং রিমাইন্ডার)
- `/income`, `/expense`, `/lend`, `/borrow` — ডেটা এন্ট্রি (ডেক্সটপে সবসময় ডান পাশে স্থায়ী ফর্ম)
- `/accounts` — ওয়ালেট/অ্যাকাউন্ট ব্যালেন্স
- `/recurring` — মাসিক বেতন, বিল ইত্যাদি রিকারিং এন্ট্রি
- `/savings` — সেভিংস গোল ট্র্যাকার
- `/ledger` — পরিচিতি-ভিত্তিক লেজার (কার কাছে কত পাওনা)
- `/analytics` — চার্ট, CSV ও PDF এক্সপোর্ট
- `/yearly` — বার্ষিক তুলনামূলক রিপোর্ট
- `/budget` — মাসিক বাজেট প্ল্যানার
- `/settings` — ক্যাটাগরি, মাধ্যম, পরিচিতি, ট্যাগ, ভাষা ম্যানেজমেন্ট

## স্ট্যাক
Next.js 15 (App Router) · Tailwind v4 · shadcn/ui (Radix) · Zustand · Recharts · jsPDF

পুরো ডকুমেন্টেশনের জন্য ব্যাকএন্ড রিপোর `DEPLOY.md` দেখুন।
