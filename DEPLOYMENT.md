# Deployment Guide

This project deploys as two separate internet apps from the same GitHub repo:

- Frontend: Vercel, using the `frontend` folder.
- Backend: Render, using the repo root so the backend can still read `Knowledge_base/Knowledgebase.md`.

## Before You Start

Make sure the project is pushed to GitHub. Vercel and Render both deploy from GitHub most easily.

Do not upload your real `.env` file to GitHub. Keep real keys only inside Vercel and Render environment variables.

## 1. Deploy The Backend To Render

1. Go to Render.
2. Click `New`.
3. Choose `Web Service`.
4. Connect your GitHub repository.
5. Use these settings:

```text
Name: zubevision-academy-backend
Runtime: Python
Root Directory: leave empty
Build Command: pip install -r backend/requirements.txt
Start Command: uvicorn backend.main:app --host 0.0.0.0 --port $PORT
```

Leave Root Directory empty on purpose. If you set it to `backend`, Render may not include the `Knowledge_base` folder.

6. Add these Render environment variables:

```text
OPENROUTER_API_KEY=your real OpenRouter key
SUPABASE_URL=your real Supabase project URL
SUPABASE_KEY=your real Supabase key
SUPABASE_KNOWLEDGE_TABLE=Knowledge_base
SUPABASE_LEADS_TABLE=leads
MAKE_WEBHOOK_URL=your real Make webhook URL
COURSE_OWNER_EMAIL=your email address
BACKEND_ALLOWED_ORIGINS=http://127.0.0.1:3015,http://localhost:3015
```

7. Click `Deploy`.
8. When Render finishes, open:

```text
https://YOUR-RENDER-SERVICE.onrender.com/health
```

You should see JSON showing the backend is running.

## 2. Deploy The Frontend To Vercel

1. Go to Vercel.
2. Click `Add New`.
3. Choose `Project`.
4. Import the same GitHub repository.
5. Set the project settings:

```text
Framework Preset: Next.js
Root Directory: frontend
Build Command: npm run build
Install Command: npm install
Output Directory: leave empty
```

6. Add this Vercel environment variable:

```text
NEXT_PUBLIC_API_BASE_URL=https://YOUR-RENDER-SERVICE.onrender.com
```

Do not add a slash at the end.

7. Click `Deploy`.
8. When Vercel finishes, open your Vercel site and test the chatbot.

## 3. Connect Vercel Back To Render CORS

After Vercel gives you a real URL, go back to Render.

1. Open your backend service.
2. Go to `Environment`.
3. Update `BACKEND_ALLOWED_ORIGINS`.

Use this format:

```text
http://127.0.0.1:3015,http://localhost:3015,https://YOUR-VERCEL-SITE.vercel.app
```

If you have a custom domain later, add it too:

```text
http://127.0.0.1:3015,http://localhost:3015,https://YOUR-VERCEL-SITE.vercel.app,https://yourcustomdomain.com
```

4. Save changes.
5. Redeploy or restart the Render backend.

## 4. Final Test

Test these in order:

1. Backend health:

```text
https://YOUR-RENDER-SERVICE.onrender.com/health
```

2. Frontend homepage:

```text
https://YOUR-VERCEL-SITE.vercel.app
```

3. Widget page:

```text
https://YOUR-VERCEL-SITE.vercel.app/chatwidget
```

4. Ask the chatbot:

```text
What courses do you offer?
```

5. Submit the course interest form and check Supabase plus Make.

## 5. Website Embed Code

After deployment, embed the widget on another website with:

```html
<script src="https://YOUR-VERCEL-SITE.vercel.app/widget.js"></script>
```

For left-side placement:

```html
<script
  src="https://YOUR-VERCEL-SITE.vercel.app/widget.js"
  data-position="left"
></script>
```

## Common Problems

If the chatbot says it cannot connect, check:

- `NEXT_PUBLIC_API_BASE_URL` in Vercel points to the Render backend.
- `BACKEND_ALLOWED_ORIGINS` in Render includes the Vercel URL.
- The Render backend is awake. Free Render services can sleep after inactivity.

If `/health` says `openrouter_configured` is false, add `OPENROUTER_API_KEY` in Render.

If `/health` says `supabase_configured` is false, add `SUPABASE_URL` and `SUPABASE_KEY` in Render.
