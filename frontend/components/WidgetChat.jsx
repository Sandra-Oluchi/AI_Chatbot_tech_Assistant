"use client";

import { useEffect, useRef, useState } from "react";
import CourseInterestForm from "@/components/CourseInterestForm";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8015";
const API_URL = `${API_BASE_URL}/chat`;

const QUICK_PROMPTS = [
  "What courses do you offer?",
  "How much are the programs?",
  "Do I need coding experience?",
];

function BotIcon({ className = "h-5 w-5" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 8V4" />
      <rect width="16" height="12" x="4" y="8" rx="4" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M9 13h.01" />
      <path d="M15 13h.01" />
      <path d="M10 17h4" />
    </svg>
  );
}

function SendIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function XIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

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

    const bulletMatch = trimmedLine.match(/^-\s+(.+)/);
    if (bulletMatch) {
      return (
        <div key={`bullet-${index}`} className="flex gap-2">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
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

export default function WidgetChat() {
  const [open, setOpen] = useState(true);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi, I'm ZubeVision Academy Assistant. Ask me about our data, AI, courses, schedule, and registration.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState("checking");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

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

  async function sendMessage(event, quickPrompt) {
    event?.preventDefault();

    const userText = (quickPrompt || input).trim();
    if (!userText || loading) return;

    setMessages((oldMessages) => [
      ...oldMessages,
      { role: "user", text: userText },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "The backend could not answer right now.");
      }

      setMessages((oldMessages) => [
        ...oldMessages,
        { role: "assistant", text: data.response },
      ]);
    } catch {
      setMessages((oldMessages) => [
        ...oldMessages,
        {
          role: "assistant",
          text: "Sorry, I could not connect to the academy backend. Please make sure port 8015 is running.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-14 items-center gap-2 rounded-full bg-emerald-700 px-5 text-sm font-semibold text-white shadow-lg transition hover:bg-emerald-800"
        aria-label="Open academy chat"
      >
        <BotIcon />
        Chat
      </button>
    );
  }

  return (
    <section className="mx-auto flex h-[calc(100vh-32px)] min-h-[560px] w-full max-w-6xl flex-col overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-2xl">
      <header className="flex items-center justify-between bg-[#101121] p-5 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white">
            <BotIcon />
          </div>
          <div>
            <h2 className="text-base font-semibold">ZubeVision Academy Assistant</h2>
            <p className="text-xs text-zinc-300">
              <span className="mr-1 inline-block h-2 w-2 rounded-full bg-emerald-400" />
              Course and registration support
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              backendStatus === "online"
                ? "bg-emerald-400"
                : backendStatus === "checking"
                  ? "bg-amber-300"
                  : "bg-red-400"
            }`}
            aria-label={`Backend ${backendStatus}`}
            title={`Backend ${backendStatus}`}
          />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-md p-1.5 text-zinc-300 transition hover:bg-white/10 hover:text-white"
            aria-label="Close academy chat"
          >
            <XIcon />
          </button>
        </div>
      </header>

      <div className="flex-1 space-y-3 overflow-y-auto bg-[#e7e8ec] p-4">
        <CourseInterestForm />

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[84%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm ${
                message.role === "user"
                  ? "bg-emerald-700 text-white"
                  : "border border-zinc-200 bg-white text-zinc-700"
              }`}
            >
              <div className="space-y-2">{formatMessage(message.text)}</div>
            </div>
          </div>
        ))}

        {messages.length === 1 ? (
          <div className="space-y-3 pt-1">
            {QUICK_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={(event) => sendMessage(event, prompt)}
                disabled={loading}
                className="block w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-left text-sm font-medium text-zinc-600 shadow-sm transition hover:border-emerald-500 hover:text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}

        {loading ? (
          <div className="flex justify-start">
            <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-500 shadow-sm">
              AcademyBot is typing...
            </div>
          </div>
        ) : null}

        <div ref={chatEndRef} />
      </div>

      <div className="border-t border-zinc-200 bg-white">
        <div className="px-4 pt-3">
          <button
            type="button"
            onClick={(event) => sendMessage(event, "How do I register?")}
            className="text-sm font-medium text-emerald-700 transition hover:text-emerald-800"
          >
            Register for a course
          </button>
        </div>

        <form onSubmit={sendMessage} className="flex gap-2 bg-white p-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about courses or fees"
            className="min-w-0 flex-1 rounded-lg border border-zinc-300 px-3 py-3 text-sm outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
          />

          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-300 text-zinc-700 transition hover:bg-emerald-700 hover:text-white disabled:cursor-not-allowed disabled:bg-zinc-200 disabled:text-zinc-400"
            aria-label="Send message"
          >
            <SendIcon />
          </button>
        </form>

        <p className="pb-3 text-center text-[11px] text-zinc-400">
          Powered by ZubeVision Tech Academy
        </p>
      </div>
    </section>
  );
}
