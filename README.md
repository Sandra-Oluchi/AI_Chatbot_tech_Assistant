# ZubeVision Tech Academy AI Assistant

ZubeVision Tech Academy AI Assistant is a full-stack chatbot system for answering course questions, collecting student leads, saving them in Supabase, and sending lead notifications to Make.

## What It Does

- Answers questions about ZubeVision Tech Academy courses, fees, schedules, registration, and class format.
- Collects student details: full name, email, phone, course of interest, and message.
- Saves leads into the Supabase `leads` table.
- Sends clean webhook data to Make for email automation.
- Provides a full chatbot page and an embeddable website widget.

## Technology

- Frontend: Next.js, React, Tailwind CSS
- Backend: FastAPI, Python
- Database: Supabase
- AI provider: OpenRouter
- Automation: Make webhook

## Production Services And Keys

This app uses these services in production:

- Vercel hosts the Next.js frontend.
- Render hosts the FastAPI backend.
- OpenRouter provides the AI chat model through `OPENROUTER_API_KEY`.
- Supabase stores course knowledge and student leads through `SUPABASE_URL` and `SUPABASE_KEY`.
- Make receives lead webhook notifications through `MAKE_WEBHOOK_URL`.

Never commit real API keys to GitHub. Add real keys inside the Vercel and Render dashboards as environment variables.

## Project Structure

```text
backend/
  main.py
  requirements.txt
  supabase_leads_notification_sent.sql

frontend/
  app/
  components/
  public/widget.js
  package.json

Knowledge_base/
  Knowledgebase.md

.env.example
start-dev.bat
```

## Environment Variables

Create a `.env` file in the project root using `.env.example` as a guide.

```text
OPENROUTER_API_KEY=your_openrouter_api_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your_supabase_service_role_or_anon_key
SUPABASE_KNOWLEDGE_TABLE=Knowledge_base
SUPABASE_LEADS_TABLE=leads
MAKE_WEBHOOK_URL=https://hook.us2.make.com/your_webhook_id
COURSE_OWNER_EMAIL=owner@example.com
BACKEND_ALLOWED_ORIGINS=http://127.0.0.1:3015,http://localhost:3015,https://your-frontend.vercel.app
```

Do not commit the real `.env` file.

## Backend Setup

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn main:app --host 127.0.0.1 --port 8015
```

Backend health check:

```text
http://127.0.0.1:8015/health
```

## Frontend Setup

```powershell
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://127.0.0.1:3015
```

Widget page:

```text
http://127.0.0.1:3015/chatwidget
```

## Embedding The Widget

Add this script to a website or WordPress custom HTML block:

```html
<script src="http://127.0.0.1:3015/widget.js"></script>
```

For production, replace `127.0.0.1:3015` with the deployed frontend URL.

## Supabase

The backend expects a `leads` table with fields such as:

```text
full_name
email
phone
course_of_interest
notification_sent
```

Run the SQL in `backend/supabase_leads_notification_sent.sql` if the `notification_sent` column is missing.

## Make Automation

The backend sends this clean payload to Make:

```json
{
  "full_name": "Student Name",
  "email": "student@example.com",
  "phone": "+234...",
  "course_of_interest": "AI Agentic Data Analytics",
  "message": "Student message",
  "source": "Tech Academy AI Chatbot"
}
```

Use these fields in the Gmail module to send lead notifications.

## Useful Commands

Run both apps:

```powershell
.\start-dev.bat
```

Check frontend:

```powershell
cd frontend
npm run lint
npm run build
```

Check backend syntax:

```powershell
cd backend
.\venv\Scripts\python.exe -m py_compile main.py
```
