"use client"

import { useState } from "react"
import { parseMeetingNotes, type MeetingSummary } from "@/lib/summarizer"

const sampleText = `Meeting: Q3 Planning Review
Date: 2025-03-15

Agenda: Q3 roadmap priorities
Discussion: resource allocation for design team

Decision: We will prioritize the mobile app redesign over the admin panel.

Decision: Budget for the design team will increase by 15% next quarter.

Action: [Sarah] Schedule follow-up with engineering for timeline estimates.

Action: [Mike] Draft the Q3 OKR document by next Friday.

TODO: Review the competitor analysis report.

Next step: [Anna] Set up user research sessions for the new onboarding flow.

Has anyone reviewed the latest usage metrics for the dashboard?

What is the timeline for the API v2 migration?

Topic: Design system consolidation
Topic: Performance benchmarking framework`
  .trim()

function SectionCard({
  title,
  count,
  icon,
  children,
}: {
  title: string
  count: number
  icon: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-stone-100 px-5 py-3">
        <span className="text-lg">{icon}</span>
        <h2 className="font-semibold text-stone-800">{title}</h2>
        <span className="ml-auto rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-500">
          {count}
        </span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}

export default function SummarizerApp() {
  const [text, setText] = useState("")
  const [summary, setSummary] = useState<MeetingSummary | null>(null)
  const [showSample, setShowSample] = useState(false)

  const handleAnalyze = () => {
    const source = showSample ? sampleText : text
    if (!source.trim()) return
    setSummary(parseMeetingNotes(source))
  }

  const handleLoadSample = () => {
    setShowSample(true)
    setSummary(null)
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-10">
      <header className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-stone-800">
          Meeting Note Summarizer
        </h1>
        <p className="mt-2 text-stone-500">
          Paste your transcript below to extract decisions, action items, questions, and topics.
        </p>
      </header>

      <section className="mb-8">
        <div className="flex items-center justify-between">
          <label htmlFor="transcript" className="text-sm font-medium text-stone-600">
            Transcript
          </label>
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs text-stone-400 underline underline-offset-2 hover:text-stone-600"
          >
            Load sample transcript
          </button>
        </div>
        <textarea
          id="transcript"
          rows={10}
          className="mt-2 w-full resize-y rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm leading-relaxed text-stone-800 placeholder-stone-400 shadow-sm transition-colors focus:border-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-200"
          placeholder="Paste your meeting transcript here..."
          value={showSample ? sampleText : text}
          onChange={(e) => {
            setText(e.target.value)
            setShowSample(false)
          }}
        />
      </section>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={!(showSample || text.trim())}
          className="rounded-lg bg-stone-800 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Analyze Notes
        </button>
        {summary && (
          <button
            type="button"
            onClick={() => {
              const lines: string[] = ["# Meeting Summary", ""];
              if (summary.decisions.length > 0) {
                lines.push("## Decisions", "");
                summary.decisions.forEach((d) => lines.push(`- ${d.text}`));
                lines.push("");
              }
              if (summary.actionItems.length > 0) {
                lines.push("## Action Items", "");
                summary.actionItems.forEach((a) => lines.push(`- ${a.text}${a.owner ? ` (${a.owner})` : ""}`));
                lines.push("");
              }
              if (summary.openQuestions.length > 0) {
                lines.push("## Open Questions", "");
                summary.openQuestions.forEach((q) => lines.push(`- ${q.text}`));
                lines.push("");
              }
              if (summary.keyTopics.length > 0) {
                lines.push("## Key Topics", "");
                summary.keyTopics.forEach((t) => lines.push(`- ${t}`));
                lines.push("");
              }
              navigator.clipboard.writeText(lines.join("\n"));
            }}
            className="rounded-lg border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-600 transition-colors hover:bg-stone-100"
          >
            Copy summary
          </button>
        )}
      </div>

      {summary && (
        <div className="mt-10 space-y-6">
          {summary.decisions.length > 0 && (
            <SectionCard title="Decisions" count={summary.decisions.length} icon="→">
              <ul className="space-y-2">
                {summary.decisions.map((d, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-700">
                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded-full bg-amber-50 text-center text-xs leading-5 text-amber-700">
                      {i + 1}
                    </span>
                    <span>{d.text}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {summary.actionItems.length > 0 && (
            <SectionCard title="Action Items" count={summary.actionItems.length} icon="☐">
              <ul className="space-y-3">
                {summary.actionItems.map((a, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="mt-0.5 h-5 w-5 shrink-0 rounded border border-stone-300" />
                    <div>
                      <p className="text-stone-700">{a.text}</p>
                      {a.owner && (
                        <p className="mt-0.5 text-xs text-stone-400">Owner: {a.owner}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {summary.openQuestions.length > 0 && (
            <SectionCard title="Open Questions" count={summary.openQuestions.length} icon="?">
              <ul className="space-y-2">
                {summary.openQuestions.map((q, i) => (
                  <li key={i} className="flex gap-3 text-sm text-stone-700">
                    <span className="mt-0.5 shrink-0 text-amber-500">?</span>
                    <span>{q.text}</span>
                  </li>
                ))}
              </ul>
            </SectionCard>
          )}

          {summary.keyTopics.length > 0 && (
            <SectionCard title="Key Topics" count={summary.keyTopics.length} icon="#">
              <div className="flex flex-wrap gap-2">
                {summary.keyTopics.map((t, i) => (
                  <span
                    key={i}
                    className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-600"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {summary.decisions.length === 0 &&
            summary.actionItems.length === 0 &&
            summary.openQuestions.length === 0 &&
            summary.keyTopics.length === 0 && (
              <p className="text-center text-sm text-stone-400">
                No structured items found. Try adding labels like &quot;Decision:&quot;,
                &quot;Action:&quot;, or &quot;Topic:&quot; to your notes.
              </p>
            )}
        </div>
      )}
    </div>
  )
}
