# 🌐 HackOps – Frontend

This is the **Next.js** web app for HackOps.  
It provides the user interface for hackathon management, team building, and live support.

---

## ⚙️ Setup

**1. Install dependencies**
```bash
npm install
```

**2. Create `.env.local` file**
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
NEXT_PUBLIC_API_URL=http://localhost:3000
```

**3. Run in development**
```bash
npm run dev
```
Frontend will be available at:  
```
http://localhost:3000
```

---

## 📦 Tech Stack
- Next.js
- TailwindCSS + shadcn/ui
- Supabase
