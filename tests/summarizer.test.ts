import { describe, it, expect } from "vitest"
import { parseMeetingNotes } from "../lib/summarizer"

const sample = `Meeting: Q3 Planning Review
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

describe("parseMeetingNotes", () => {
  it("extracts decisions", () => {
    const result = parseMeetingNotes(sample)
    expect(result.decisions).toHaveLength(2)
    expect(result.decisions[0].text).toContain("prioritize the mobile app redesign")
    expect(result.decisions[1].text).toContain("Budget for the design team")
  })

  it("extracts action items with owners", () => {
    const result = parseMeetingNotes(sample)
    expect(result.actionItems).toHaveLength(4)
    expect(result.actionItems[0].text).toContain("Schedule follow-up")
    expect(result.actionItems[0].owner).toBe("Sarah")
    expect(result.actionItems[1].owner).toBe("Mike")
  })

  it("extracts open questions", () => {
    const result = parseMeetingNotes(sample)
    expect(result.openQuestions).toHaveLength(2)
    expect(result.openQuestions[0].text).toContain("latest usage metrics")
    expect(result.openQuestions[1].text).toContain("API v2 migration")
  })

  it("extracts key topics", () => {
    const result = parseMeetingNotes(sample)
    expect(result.keyTopics).toHaveLength(3)
    expect(result.keyTopics).toContain("Q3 roadmap priorities")
    expect(result.keyTopics).toContain("Design system consolidation")
    expect(result.keyTopics).toContain("Performance benchmarking framework")
  })

  it("handles empty input", () => {
    const result = parseMeetingNotes("")
    expect(result.decisions).toHaveLength(0)
    expect(result.actionItems).toHaveLength(0)
    expect(result.openQuestions).toHaveLength(0)
    expect(result.keyTopics).toHaveLength(0)
  })

  it("handles input with no structured content", () => {
    const result = parseMeetingNotes("Just some random notes without any labels or questions")
    expect(result.decisions).toHaveLength(0)
    expect(result.actionItems).toHaveLength(0)
    expect(result.openQuestions).toHaveLength(0)
    expect(result.keyTopics).toHaveLength(0)
  })

  it("deduplicates repeated items", () => {
    const text = `Decision: First decision
Decision: First decision
Topic: A topic
Topic: A topic`
    const result = parseMeetingNotes(text)
    expect(result.decisions).toHaveLength(1)
    expect(result.keyTopics).toHaveLength(1)
  })
})
