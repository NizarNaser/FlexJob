"use client";

import { useState } from "react";
import { useApp } from "@/lib/store";
import { useRouter } from "next/navigation";

interface Message {
  role: "user" | "assistant";
  text: string;
}

function generateReply(input: string, ctx: ReturnType<typeof useApp>): string {
  const text = input.toLowerCase();

  if (text.includes("cv") || text.includes("resume")) {
    return "For a strong CV: lead with your most relevant experience, list concrete skills (e.g. \"Barista\", \"Forklift certified\"), and keep it under one page. You can upload or edit your CV summary from your worker dashboard.";
  }

  if (text.includes("schedule") || text.includes("availability") || text.includes("time")) {
    return "You can set exactly which days and hours you're free in the Availability Planner on your worker dashboard. Turn on \"Match my availability\" in the job search filters to only see jobs that fit your chosen times.";
  }

  if (text.includes("post a job") || text.includes("hire") || text.includes("employer")) {
    return "As an employer, go to \"Post a Job\", describe the role, set the pay rate and the days/hours you need covered, and workers with matching availability will see it first.";
  }

  const matchedCategory = ctx.jobs.find((j) => text.includes(j.category.toLowerCase().split(" ")[0]));
  if (matchedCategory) {
    return `I found a job that might fit: "${matchedCategory.title}" at ${matchedCategory.employerName} (${matchedCategory.location}), paying $${matchedCategory.payRate}/hr. Check the Find Work page and filter by category "${matchedCategory.category}" to see more like it.`;
  }

  if (text.includes("job") || text.includes("work") || text.includes("find")) {
    return "Head to \"Find Work\" and use the filters — category, pay range, location, time of day, or \"Match my availability\" — to narrow down jobs that fit your schedule.";
  }

  if (text.includes("review") || text.includes("rating")) {
    return "After a job is completed, both the worker and employer can leave a rating and written review on each other's profile. Verified reviews only appear after a completed job, which keeps ratings trustworthy.";
  }

  return "I can help you find flexible jobs, plan your availability, improve your CV, or write a job posting. What would you like help with?";
}

export default function AIAssistant() {
  const app = useApp();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! I'm the FlexJob assistant. Ask me to help find flexible jobs, plan your schedule, or improve your CV.",
    },
  ]);
  const [input, setInput] = useState("");

  function send() {
    const trimmed = input.trim();
    if (!trimmed) return;
    const reply = generateReply(trimmed, app);
    setMessages((prev) => [...prev, { role: "user", text: trimmed }, { role: "assistant", text: reply }]);
    setInput("");
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-96 w-80 flex-col overflow-hidden rounded-2xl border border-blue-100 bg-white shadow-2xl">
          <div className="flex items-center justify-between bg-blue-600 px-4 py-3 text-white">
            <span className="text-sm font-semibold">AI Job Assistant</span>
            <button onClick={() => setOpen(false)} aria-label="Close assistant">
              ✕
            </button>
          </div>
          <div className="flex-1 space-y-2 overflow-y-auto p-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  m.role === "assistant"
                    ? "bg-blue-50 text-slate-700"
                    : "ml-auto bg-blue-600 text-white"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 border-t border-blue-100 p-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask about jobs, schedule, CV..."
              className="flex-1 rounded-full border border-blue-200 px-3 py-1.5 text-sm outline-none focus:border-blue-500"
            />
            <button
              onClick={send}
              className="rounded-full bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
            >
              Send
            </button>
          </div>
          <button
            onClick={() => router.push("/jobs")}
            className="border-t border-blue-100 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50"
          >
            Browse jobs with filters →
          </button>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-2xl text-white shadow-lg hover:bg-blue-700"
        aria-label="Open AI assistant"
      >
        🤖
      </button>
    </div>
  );
}
