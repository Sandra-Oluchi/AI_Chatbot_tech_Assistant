"use client";

import { useState } from "react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8015";
const COURSE_INTEREST_URL = `${API_BASE_URL}/course-interest`;

const COURSES = [
  "Full-Stack AI Engineering",
  "AI Agentic Data Science",
  "AI Agentic Data Analytics",
  "AI Automation Workflow and System Engineering",
];

export default function CourseInterestForm() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    courseName: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  function handleChange(event) {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(COURSE_INTEREST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          course_of_interest: formData.courseName,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Unable to submit interest right now.");
      }

      setStatus("Thank you. We have received your interest.");
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        courseName: "",
        message: "",
      });
    } catch {
      setStatus("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-2 rounded-lg border border-zinc-200 bg-white p-3 shadow-sm"
    >
      <h3 className="text-sm font-semibold text-zinc-900">
        Interested in a course?
      </h3>

      <input
        name="fullName"
        value={formData.fullName}
        onChange={handleChange}
        placeholder="Full name"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        required
      />

      <input
        name="email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        placeholder="Email address"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        required
      />

      <input
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Phone number"
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        required
      />

      <select
        name="courseName"
        value={formData.courseName}
        onChange={handleChange}
        className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        required
      >
        <option value="">Choose course</option>
        {COURSES.map((course) => (
          <option key={course} value={course}>
            {course}
          </option>
        ))}
      </select>

      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
        placeholder="Message optional"
        className="min-h-16 w-full resize-none rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
      >
        {loading ? "Submitting..." : "Submit interest"}
      </button>

      {status ? <p className="text-xs text-emerald-700">{status}</p> : null}
    </form>
  );
}
