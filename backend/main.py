from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from typing import Optional

import os
import requests

try:
    from supabase import Client, create_client
except ImportError:
    Client = object
    create_client = None

# Load .env variables from the project root
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(BASE_DIR, "..", ".env")
KNOWLEDGE_BASE_PATH = os.path.join(BASE_DIR, "..", "Knowledge_base", "Knowledgebase.md")
load_dotenv(ENV_PATH)

# Create FastAPI app
app = FastAPI()

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "BACKEND_ALLOWED_ORIGINS",
        "http://127.0.0.1:3015,http://localhost:3015",
    ).split(",")
    if origin.strip()
]

# Allow frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenRouter API key
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "").strip()

# Supabase setup
SUPABASE_URL = os.getenv("SUPABASE_URL", "").strip()
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "").strip()
KNOWLEDGE_BASE_TABLE = os.getenv("SUPABASE_KNOWLEDGE_TABLE", "Knowledge_base").strip()
LEADS_TABLE = os.getenv("SUPABASE_LEADS_TABLE", "leads").strip()
MAKE_WEBHOOK_URL = os.getenv("MAKE_WEBHOOK_URL", "").strip()
COURSE_OWNER_EMAIL = os.getenv("COURSE_OWNER_EMAIL", "").strip()

COURSES = [
    {
        "name": "Full-Stack AI Engineering",
        "price": "200,000 naira",
        "schedule": "Every Saturday",
        "time": "8 PM - 10 PM WAT",
        "duration": "4 months total",
        "aliases": [
            "full stack",
            "full-stack",
            "full stack ai",
            "full-stack ai",
            "ai engineering",
        ],
    },
    {
        "name": "AI Agentic Data Science",
        "price": "300,000 naira",
        "schedule": "Every Sunday",
        "time": "8 PM - 10 PM WAT",
        "duration": "4 months total",
        "aliases": [
            "data science",
            "agentic data science",
            "ai data science",
            "ai agentic data science",
            "data scienec",
        ],
    },
    {
        "name": "AI Agentic Data Analytics",
        "price": "250,000 naira",
        "schedule": "Every Wednesday",
        "time": "8 PM - 10 PM WAT",
        "duration": "4 months total",
        "aliases": [
            "data analytics",
            "data analytica",
            "agentic data analytics",
            "ai data analytics",
            "ai agentic data analytics",
        ],
    },
    {
        "name": "AI Automation Workflow and System Engineering",
        "price": "300,000 naira",
        "schedule": "Every Friday",
        "time": "8 PM - 10 PM WAT",
        "duration": "4 months total",
        "aliases": [
            "automation",
            "workflow",
            "automation workflow",
            "ai automation",
            "ai automation workflow",
            "system engineering",
            "ai business system",
        ],
    },
]

COURSE_NAMES = [course["name"] for course in COURSES]


def is_real_env_value(value: Optional[str]):
    if not value:
        return False

    placeholder_markers = [
        "replace_with",
        "yourproject",
        "your_anon_orservice_role_key",
    ]
    return not any(marker in value for marker in placeholder_markers)


def has_openrouter_key():
    return is_real_env_value(OPENROUTER_API_KEY)


def get_runtime_status():
    return {
        "backend": "running",
        "openrouter_configured": has_openrouter_key(),
        "supabase_package_installed": create_client is not None,
        "supabase_configured": supabase is not None,
        "make_webhook_configured": is_real_env_value(MAKE_WEBHOOK_URL),
        "knowledge_source": "supabase" if supabase else "local_markdown",
        "allowed_origins": ALLOWED_ORIGINS,
    }


supabase: Optional[Client] = None
if is_real_env_value(SUPABASE_URL) and is_real_env_value(SUPABASE_KEY) and create_client:
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


class ChatRequest(BaseModel):
    message: str
    full_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    course_of_interest: Optional[str] = None


class CourseInterestRequest(BaseModel):
    full_name: str
    email: str
    phone: str
    course_of_interest: str
    message: Optional[str] = None


def build_lead_payload(request):
    return {
        "full_name": request.full_name,
        "email": request.email,
        "phone": request.phone,
        "course_of_interest": request.course_of_interest,
    }


def send_lead_to_make(lead):
    if not is_real_env_value(MAKE_WEBHOOK_URL):
        return False

    payload = {
        "full_name": lead.get("full_name") or "",
        "email": lead.get("email") or "",
        "phone": lead.get("phone") or "",
        "course_of_interest": lead.get("course_of_interest") or "",
        "message": lead.get("message") or "",
        "source": "Tech Academy AI Chatbot",
    }

    try:
        response = requests.post(MAKE_WEBHOOK_URL, json=payload, timeout=15)
        response.raise_for_status()
        return True
    except requests.RequestException:
        return False


def mark_lead_notification_sent(lead):
    if not supabase or not lead or not lead.get("id"):
        return

    try:
        supabase.table(LEADS_TABLE).update(
            {"notification_sent": True}
        ).eq("id", lead["id"]).execute()
    except Exception:
        return


def save_lead(request: ChatRequest):
    if not all(
        [
            request.full_name,
            request.email,
            request.phone,
            request.course_of_interest,
        ]
    ):
        return

    if not supabase:
        return

    lead_payload = build_lead_payload(request)

    try:
        saved_lead = supabase.table(LEADS_TABLE).insert(lead_payload).execute()
    except Exception:
        return

    lead = saved_lead.data[0] if saved_lead.data else lead_payload
    lead["message"] = request.message
    notification_sent = send_lead_to_make(lead)

    if notification_sent:
        mark_lead_notification_sent(lead)

    return lead


def save_course_interest(request: CourseInterestRequest):
    if not supabase:
        raise HTTPException(
            status_code=500,
            detail="Supabase is not configured. Please check SUPABASE_URL and SUPABASE_KEY.",
        )

    lead_payload = build_lead_payload(request)

    try:
        saved_lead = supabase.table(LEADS_TABLE).insert(lead_payload).execute()
    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Could not save course interest: {error}",
        )

    lead = saved_lead.data[0] if saved_lead.data else lead_payload
    if request.message:
        lead["message"] = request.message

    notification_sent = send_lead_to_make(lead)

    if notification_sent:
        mark_lead_notification_sent(lead)

    return {
        "status": "received",
        "message": "Thank you. We have received your interest.",
        "notification_sent": notification_sent,
    }


def get_local_knowledge_base():
    try:
        with open(KNOWLEDGE_BASE_PATH, "r", encoding="utf-8") as knowledge_file:
            return knowledge_file.read()
    except OSError:
        return ""


def is_course_list_question(user_message: str):
    message = user_message.lower()
    normalized_message = " ".join(message.replace("?", " ").split())
    direct_course_list_questions = [
        "what courses do you offer",
        "what course do you offer",
        "what courses are you offering",
        "what course are you offering",
        "what courses are available",
        "which courses do you offer",
        "which course do you offer",
        "list the courses",
        "list your courses",
        "show me the courses",
    ]
    course_terms = ["course", "courses", "program", "programs", "training"]
    list_terms = [
        "offer",
        "offering",
        "available",
        "list",
        "what course",
        "which course",
        "course names",
    ]
    detail_terms = [
        "price",
        "cost",
        "fee",
        "tuition",
        "schedule",
        "time",
        "duration",
        "topic",
        "topics",
        "project",
        "projects",
        "structure",
    ]

    if any(question in normalized_message for question in direct_course_list_questions):
        return True

    is_about_courses = any(term in message for term in course_terms)
    is_asking_for_list = any(term in message for term in list_terms)
    is_asking_for_details = any(term in message for term in detail_terms)

    return is_about_courses and is_asking_for_list and not is_asking_for_details


def course_names_response():
    course_list = "\n".join(f"- {course}" for course in COURSE_NAMES)
    return f"ZubeVision Tech Academy currently offers:\n{course_list}"


def find_courses_in_message(user_message: str):
    message = user_message.lower()
    matched_courses = []

    for course in COURSES:
        names_to_check = [course["name"].lower(), *course["aliases"]]

        if any(alias in message for alias in names_to_check):
            matched_courses.append(course)

    return matched_courses


def is_course_price_question(user_message: str):
    message = user_message.lower()
    price_terms = ["price", "cost", "fee", "fees", "tuition", "how much"]

    return any(term in message for term in price_terms)


def is_course_schedule_question(user_message: str):
    message = user_message.lower()
    schedule_terms = ["schedule", "time", "day", "when", "class", "classes"]

    return any(term in message for term in schedule_terms)


def course_price_response(courses):
    if len(courses) == 1:
        course = courses[0]
        return f"The price of {course['name']} is {course['price']}."

    price_lines = [f"- {course['name']}: {course['price']}" for course in courses]
    return "Here are the course prices:\n" + "\n".join(price_lines)


def course_schedule_response(courses):
    if len(courses) == 1:
        course = courses[0]
        return (
            f"{course['name']} holds {course['schedule']}, "
            f"{course['time']}."
        )

    schedule_lines = [
        f"- {course['name']}: {course['schedule']}, {course['time']}"
        for course in courses
    ]
    return "Here are the course schedules:\n" + "\n".join(schedule_lines)


def get_relevant_knowledge(user_message: str):
    if not supabase:
        return get_local_knowledge_base()

    try:
        knowledge = supabase.table(KNOWLEDGE_BASE_TABLE).select("*").execute()
    except Exception:
        return get_local_knowledge_base()

    for row in knowledge.data or []:
        topic = str(row.get("topic", "")).strip()
        content = str(row.get("content", "")).strip()

        if topic and content and topic.lower() in user_message.lower():
            return content

    return get_local_knowledge_base()


def build_system_prompt(knowledge_text: str):
    system_prompt = """
    You are AcademyBot, a friendly AI assistant for ZubeVision Tech Academy.

    ZubeVision Tech Academy teaches practical AI, data, automation, and full-stack AI engineering.

    Help students with:
    - Admissions
    - Course information
    - Tuition and payment information
    - Class schedules
    - Registration steps
    - Student support

    Use the academy knowledge base when relevant.
    Format answers for a chat interface:
    - Keep answers short and easy to scan.
    - Use clear section labels only when helpful.
    - Use bullet points for lists.
    - Do not use markdown bold markers like **.
    - Avoid long paragraphs.
    - If the student only asks what courses are available, list only the course names.
    - Do not include prices, schedules, duration, or topics unless the student specifically asks for those details.
    If you do not know something, politely tell the student to contact the academy admin for confirmation.
    """

    if knowledge_text:
        system_prompt += f"\n\nRelevant knowledge base information:\n{knowledge_text}"

    return system_prompt


@app.get("/")
def home():
    return {
        "status": "running",
        "message": "Academy AI Backend is working"
    }


@app.get("/health")
def health():
    return get_runtime_status()


@app.post("/course-interest")
def course_interest(request: CourseInterestRequest):
    return save_course_interest(request)


@app.post("/api/course-interest")
def api_course_interest(request: CourseInterestRequest):
    return save_course_interest(request)


@app.post("/chat")
def chat(request: ChatRequest):

    user_message = request.message
    save_lead(request)

    if is_course_list_question(user_message):
        return {
            "response": course_names_response()
        }

    matched_courses = find_courses_in_message(user_message)
    if is_course_price_question(user_message) and matched_courses:
        return {
            "response": course_price_response(matched_courses)
        }

    if is_course_schedule_question(user_message) and matched_courses:
        return {
            "response": course_schedule_response(matched_courses)
        }

    knowledge_text = get_relevant_knowledge(user_message)
    system_prompt = build_system_prompt(knowledge_text)

    if not has_openrouter_key():
        raise HTTPException(
            status_code=500,
            detail="OPENROUTER_API_KEY is missing. Add your real OpenRouter key to the project .env file.",
        )

    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "openai/gpt-4o-mini",
                "messages": [
                    {
                        "role": "system",
                        "content": system_prompt
                    },
                    {
                        "role": "user",
                        "content": user_message
                    }
                ]
            },
            timeout=30,
        )
        response.raise_for_status()
    except requests.RequestException as error:
        raise HTTPException(
            status_code=502,
            detail=f"OpenRouter request failed: {error}",
        )

    data = response.json()

    try:
        ai_response = data["choices"][0]["message"]["content"]
    except (KeyError, IndexError, TypeError) as error:
        raise HTTPException(
            status_code=502,
            detail=f"OpenRouter returned an unexpected response: {error}",
        )

    return {
        "response": ai_response
    }
