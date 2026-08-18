"use client";

import { useEffect, useRef, useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8015";
const API_URL = `${API_BASE_URL}/chat`;
const COURSE_INTEREST_URL = `${API_BASE_URL}/course-interest`;

const COURSES = [
  "Full-Stack AI Engineering",
  "AI Agentic Data Science",
  "AI Agentic Data Analytics",
  "AI Automation Workflow and System Engineering",
];

const QUICK_PROMPTS = [
  "What courses do you offer?",
  "How much are the programs?",
  "Do I need coding experience?",
];

const POPULAR_QUESTIONS = [
  "What courses do you offer?",
  "How much are the courses?",
  "What days are classes held?",
  "How do I register?",
  "Do I need coding experience?",
  "Can I pay in installments?",
];

function cleanMessageText(text) {
  return text
    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/#{1,6}\s?/g, "")
    .trim();
}

function formatMessage(text) {
  const normalizedText = cleanMessageText(text)
    .replace(/\s+-\s+/g, "\n- ")
    .replace(/(?<!\d)\s+(\d+)\.\s+/g, "\n$1. ")
    .replace(/\n{3,}/g, "\n\n");

  return normalizedText.split("\n").map((line, index) => {
    const trimmedLine = line.trim();

    if (!trimmedLine) {
      return <div key={`space-${index}`} className="h-2" />;
    }

    const bulletMatch = trimmedLine.match(/^[-•]\s+(.+)/);
    if (bulletMatch) {
      return (
        <div key={`bullet-${index}`} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" />
          <span>{bulletMatch[1]}</span>
        </div>
      );
    }

    const numberedMatch = trimmedLine.match(/^(\d+)\.\s+(.+)/);
    if (numberedMatch) {
      return (
        <div key={`number-${index}`} className="flex gap-2">
          <span className="font-semibold text-emerald-700">
            {numberedMatch[1]}.
          </span>
          <span>{numberedMatch[2]}</span>
        </div>
      );
    }

    return <p key={`line-${index}`}>{trimmedLine}</p>;
  });
}

export default function Chatbot() {
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [courseOfInterest, setCourseOfInterest] = useState("");
  const [chat, setChat] = useState([
    {
      role: "assistant",
      text: "Welcome to ZubeVision Tech Academy. Ask me about courses, fees, schedules, registration, or what you will build during the program.",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadStatus, setLeadStatus] = useState("");
  const [error, setError] = useState("");
  const [backendStatus, setBackendStatus] = useState("checking");
  const chatEndRef = useRef(null);

  const hasLeadDetails =
    fullName.trim() && email.trim() && phone.trim() && courseOfInterest;

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isLoading]);

  useEffect(() => {
    async function checkBackend() {
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        setBackendStatus(response.ok ? "online" : "offline");
      } catch {
        setBackendStatus("offline");
      }
    }

    checkBackend();
  }, []);

  async function submitLeadDetails(event) {
    event.preventDefault();

    if (!hasLeadDetails || leadLoading) return;

    setLeadLoading(true);
    setLeadStatus("");
    setError("");

    try {
      const response = await fetch(COURSE_INTEREST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          course_of_interest: courseOfInterest,
          message: "Submitted from the main chatbot student details panel.",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to save student details.");
      }

      setLeadStatus("Student details saved.");
    } catch (requestError) {
      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "Unable to save student details.";

      setLeadStatus(errorMessage);
    } finally {
      setLeadLoading(false);
    }
  }

  async function sendMessage(event, quickPrompt) {
    event?.preventDefault();

    const userMessage = (quickPrompt || message).trim();
    if (!userMessage || isLoading) return;

    const leadDetails = {
      full_name: fullName.trim() || undefined,
      email: email.trim() || undefined,
      phone: phone.trim() || undefined,
      course_of_interest: courseOfInterest || undefined,
    };

    setError("");
    setMessage("");
    setIsLoading(true);
    setChat((currentChat) => [
      ...currentChat,
      { role: "user", text: userMessage },
    ]);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          ...leadDetails,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.detail || "The backend could not answer right now.");
      }

      setChat((currentChat) => [
        ...currentChat,
        { role: "assistant", text: data.response },
      ]);
    } catch (requestError) {
      const errorMessage =
        requestError instanceof Error
          ? requestError.message
          : "Unable to reach the backend.";

      setError(errorMessage);
      setChat((currentChat) => [
        ...currentChat,
        {
          role: "assistant",
          text: "I could not connect to the AI service right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-7xl overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm lg:grid-cols-[340px_minmax(0,1fr)]">
      <aside className="border-b border-zinc-200 bg-[#f2f3f5] p-5 lg:border-b-0 lg:border-r">
        <div>
          <p className="text-sm font-bold text-emerald-700">
            ZubeVision Tech Academy
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-zinc-950">
            AI course advisor
          </h1>
          <p className="mt-4 text-sm leading-6 text-zinc-600">
            Get direct answers from the academy knowledge base and share your
            details when you are ready to register.
          </p>
        </div>

        <div className="mt-7 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-zinc-950">
            Popular questions
          </h2>

          <div className="mt-4 grid gap-2">
            {POPULAR_QUESTIONS.map((question) => (
              <button
                key={question}
                type="button"
                onClick={(event) => sendMessage(event, question)}
                disabled={isLoading}
                className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-left text-sm font-medium leading-5 text-zinc-700 transition hover:border-emerald-500 hover:bg-emerald-50 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={submitLeadDetails}
          className="mt-7 rounded-lg border border-zinc-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-zinc-950">
              Student details
            </h2>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                hasLeadDetails
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-100 text-amber-800"
              }`}
            >
              {hasLeadDetails ? "4/4" : "1/4"}
            </span>
          </div>

          <div className="mt-5 grid gap-4">
            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Full name
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                className="h-11 rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="Your name"
                required
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-11 rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Phone number
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-11 rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                placeholder="+234..."
                required
              />
            </label>

            <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
              Course of interest
              <select
                value={courseOfInterest}
                onChange={(event) => setCourseOfInterest(event.target.value)}
                className="h-11 rounded-md border border-zinc-300 bg-zinc-50 px-3 text-sm font-normal outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                required
              >
                <option value="">Choose course</option>
                {COURSES.map((course) => (
                  <option key={course} value={course}>
                    {course}
                  </option>
                ))}
              </select>
            </label>

            <button
              type="submit"
              disabled={!hasLeadDetails || leadLoading}
              className="h-11 rounded-md bg-emerald-700 px-4 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {leadLoading ? "Saving..." : "Save student details"}
            </button>

            {leadStatus ? (
              <p className="text-xs font-medium text-emerald-700">
                {leadStatus}
              </p>
            ) : null}
          </div>
        </form>
      </aside>

      <div className="flex min-h-[680px] flex-col bg-[#e7e8ec]">
        <div className="flex flex-col gap-4 border-b border-zinc-200 bg-[#f2f3f5] p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
              Live academy assistant
            </p>
            <h2 className="mt-2 text-xl font-semibold text-zinc-950">
              Ask, compare, register
            </h2>
          </div>
          <span
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              backendStatus === "online"
                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                : backendStatus === "checking"
                  ? "bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200"
                  : "bg-red-50 text-red-700 ring-1 ring-red-100"
            }`}
          >
            Backend: {backendStatus}
          </span>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-5 sm:p-6">
          {chat.map((chatMessage, index) => (
            <div
              key={`${chatMessage.role}-${index}`}
              className={`flex ${
                chatMessage.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[88%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[72%] ${
                  chatMessage.role === "user"
                    ? "bg-emerald-700 text-white"
                    : "border border-zinc-200 bg-white text-zinc-700"
                }`}
              >
                <div className="space-y-2">{formatMessage(chatMessage.text)}</div>
              </div>
            </div>
          ))}

          {isLoading ? (
            <div className="flex justify-start">
              <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500 shadow-sm">
                AcademyBot is preparing an answer...
              </div>
            </div>
          ) : null}

          {chat.length === 1 ? (
            <div className="space-y-3 pt-1">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={(event) => sendMessage(event, prompt)}
                  disabled={isLoading}
                  className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-600 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {prompt}
                </button>
              ))}
            </div>
          ) : null}

          <div ref={chatEndRef} />
        </div>

        {error ? (
          <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <form
          onSubmit={sendMessage}
          className="flex flex-col gap-3 border-t border-zinc-200 bg-white p-4 sm:flex-row"
        >
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="min-h-12 min-w-0 flex-1 resize-none rounded-md border border-zinc-300 bg-white px-4 py-3 text-sm leading-5 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            placeholder="Ask about courses or fees"
            rows={1}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className="h-12 rounded-md bg-emerald-700 px-6 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
