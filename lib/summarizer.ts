export interface ActionItem {
  text: string
  owner?: string
  priority?: "high" | "medium" | "low"
}

export interface Decision {
  text: string
  context?: string
}

export interface OpenQuestion {
  text: string
  askedBy?: string
}

export interface MeetingSummary {
  decisions: Decision[]
  actionItems: ActionItem[]
  openQuestions: OpenQuestion[]
  keyTopics: string[]
}

const topicKeywords = ["topic:", "# ", "agenda:"]
const decisionKeywords = ["decision:"]
const actionKeywords = ["action:", "next step:", "todo:"]

export function parseMeetingNotes(rawText: string): MeetingSummary {
  const lines = rawText.split("\n")
  const decisions: Decision[] = []
  const actionItems: ActionItem[] = []
  const openQuestions: OpenQuestion[] = []
  const keyTopics: string[] = []
  const seenTopics = new Set<string>()
  const seenDecisions = new Set<string>()
  const seenActions = new Set<string>()
  const seenQuestions = new Set<string>()

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const lower = trimmed.toLowerCase()

    for (const kw of topicKeywords) {
      if (lower.startsWith(kw)) {
        const topic = trimmed.slice(kw.length).trim()
        if (topic && !seenTopics.has(topic)) {
          seenTopics.add(topic)
          keyTopics.push(topic)
        }
      }
    }

    for (const kw of decisionKeywords) {
      if (lower.includes(kw)) {
        const idx = lower.indexOf(kw)
        const text = trimmed.slice(idx + kw.length).trim()
        if (text && !seenDecisions.has(text)) {
          seenDecisions.add(text)
          decisions.push({ text })
        }
      }
    }

    for (const kw of actionKeywords) {
      if (lower.includes(kw)) {
        const idx = lower.indexOf(kw)
        const raw = trimmed.slice(idx + kw.length).trim()
        const ownerMatch = raw.match(/\[(.+?)\]/) || raw.match(/\((.+?)\)/)
        const text = ownerMatch ? raw.replace(/\[.+?\]/, "").replace(/\(.+?\)/, "").trim() : raw
        if (text && !seenActions.has(text)) {
          seenActions.add(text)
          actionItems.push({
            text,
            owner: ownerMatch ? ownerMatch[1] : undefined,
          })
        }
      }
    }

    if (trimmed.includes("?") && !seenQuestions.has(trimmed)) {
      seenQuestions.add(trimmed)
      openQuestions.push({ text: trimmed })
    }
  }

  return { decisions, actionItems, openQuestions, keyTopics }
}
