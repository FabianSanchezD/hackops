# 🖥 HackOps – Backend

This is the **Node.js + Express** API for HackOps.  
It handles authentication, database operations, AI integrations, and external API calls.

---

## ⚙️ Setup

**1. Install dependencies**
```bash
npm install
```

**2. Copy `.env` file from `.env.example`**

```bash
cp .env.example .env
```

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_KEY=<service_role_key>
OPENAI_API_KEY=<openai_key>
SENDGRID_API_KEY=<sendgrid_key>
GOOGLE_MEET_CLIENT_ID=<google_client_id>
GOOGLE_MEET_CLIENT_SECRET=<google_client_secret>
GOOGLE_MEET_REDIRECT_URI=<redirect_uri>
```

**3. Run in development**
```bash
npm run dev
```
Backend will be available at:  
```
http://localhost:5000
```

---

## 📦 Tech Stack
- Node.js + Express
- Supabase
- OpenAI API
- Google Meet API
- SendGrid API
