# 🚀 HackOps – Backend & Frontend

HackOps is a platform for **organizing, managing, and scaling hackathons**.  
It streamlines track management, team building, live support, growth, and communications, all in one place.

---

## 📖 Overview
HackOps enables organizers to:
- Integrate AI tools for content generation
- Create and manage hackathon tracks
- Onboard participants and teams
- Schedule events and meetings
- Provide live support
- Send automated emails and announcements

---

## 🛠 Tech Stack

**Frontend**
- [Next.js](https://nextjs.org/) — React framework for fast, scalable UI
- Tailwind CSS + shadcn/ui — styling & components

**Backend**
- [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/) — API and business logic
- [Supabase](https://supabase.com/) — database (PostgreSQL) + auth + storage (S3 Bucket)
- External APIs:
  - [OpenAI](https://platform.openai.com/) — AI-powered text generation & assistance
  - [Google Meet API](https://developers.google.com/meet) — meeting scheduling & management
  - [SendGrid](https://sendgrid.com/) — transactional & marketing email delivery

---

## 📂 Folder Structure

hackops/
├── back-end/ # Node.js + Express backend
│ ├── node_modules/
│ ├── src/
│ │ ├── routes/ # API endpoints
│ │ ├── utils/ # Helper utilities & API clients
│ │ └── server.js # Entry point for backend server
│ ├── GOOGLE_MEET_SETUP.md # Google Meet/Calendar API setup guide
│ ├── package.json
│ ├── package-lock.json
│ └── README.md
│
├── front-end/ # Next.js frontend
│ ├── public/ # Public assets
│ ├── src/
│ │ ├── app/ # App router for all routes
│ │ ├── components/ # Reusable UI components
│ │ └── lib/ # Utility functions (fetching, etc.)
│ ├── package.json
│ ├── package-lock.json
│ ├── postcss.config.js
│ ├── tailwind.config.js
│ └── tsconfig.json
├── .env # Environment variables (local)
├── .env.example # Example environment variables
├── .gitignore
└── README.md

---

## ⚙️ Setup

**Clone the repo:**
```bash
git clone https://github.com/yourusername/hackops.git
cd hackops
```
**Install Dependencies**

```bash
cd back-end
npm install
cd ../frontend
npm install
```

**Environment Variables**

To use features such as AI Assistants, Live Event Support and Email Sending:

```bash
cp .env.example.env
```

And fill with necessary keys.

**Running locally**

Backend

```bash
cd back-end
npm run dev
```

Frontend

```bash
cd front-end
npm run dev
```

---

## Deployment

Frontend: [Vercel](https://vercel.com/)
Backend: [Render](https://render.com/)
Database & Auth: [Supabase](https://supabase.com/)

---
## 📄 License

MIT License — see LICENSE for details.