
## Environment

Set the API base URL so the frontend talks to your backend:

- Local development: `NEXT_PUBLIC_API_URL=http://localhost:5000`
- Production (Vercel): `NEXT_PUBLIC_API_URL=https://hackops.onrender.com`

Define this in your Vercel Project Settings → Environment Variables, and locally in the repo root `.env` which is already loaded by the frontend config.
