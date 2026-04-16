'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Bot,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react'
import type { Severity, SyncMismatch, SyncResult } from '@/lib/pixelperfect/types'

type ChatMessage = {
  role: 'ai' | 'user'
  text: string
  action?: string
}

const severityWeight: Record<Severity, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
}

const quickPrompts = [
  'What are the main errors?',
  'How do I fix colors?',
  'Give me CSS fixes',
  'What should I fix first?',
]

export function AiDesignCopilot({ result }: { result: SyncResult | null }) {
  const [mounted, setMounted] = useState(false)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: "Hi, I'm your design QA copilot. Run a comparison, then ask me what is wrong, what to fix first, or which CSS changes to make.",
    },
  ])
  const lastResultId = useRef<string | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sortedIssues = useMemo(() => sortIssues(result?.mismatches ?? []), [result])
  const verifiedIssues = useMemo(
    () => sortedIssues.filter((issue) => issue.verification !== 'not_verified'),
    [sortedIssues]
  )
  const cssPatch = useMemo(() => buildCssPatch(sortedIssues), [sortedIssues])

  useEffect(() => {
    if (!result || lastResultId.current === result.id) return
    lastResultId.current = result.id

    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        text:
          result.status === 'synced'
            ? `${result.componentName} is synced. No visual drift was detected in the latest comparison.`
            : buildOpeningMessage(result, sortedIssues),
      },
    ])
  }, [result, sortedIssues])

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: 'smooth',
    })
  }, [messages, open])

  if (!mounted) {
    return null
  }

  const sendPrompt = (text: string) => {
    const prompt = text.trim()
    if (!prompt) return

    setMessages((prev) => [
      ...prev,
      { role: 'user', text: prompt },
      { role: 'ai', text: answerPrompt(prompt, result, sortedIssues, verifiedIssues, cssPatch) },
    ])
    setDraft('')
  }

  return createPortal(
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-14 w-14 items-center justify-center rounded-lg border border-cyan-300/40 bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.45)] transition hover:bg-cyan-300"
        style={{
          position: 'fixed',
          right: 24,
          bottom: 24,
          zIndex: 2147483647,
          opacity: 1,
        }}
        aria-label="Open AI Design Copilot"
      >
        <Bot className="h-6 w-6" />
        {result?.status === 'drifted' ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border border-black bg-red-500 px-1 text-[10px] font-bold text-white">
            {Math.min(result.mismatchCount, 99)}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="pointer-events-none"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2147483646,
          }}
        >
          <div className="pointer-events-auto absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div
            className="pointer-events-auto flex flex-col overflow-hidden rounded-lg border border-white/15 text-white shadow-2xl"
            style={{
              position: 'fixed',
              right: 24,
              bottom: 96,
              width: 'min(460px, calc(100vw - 48px))',
              height: 'min(720px, calc(100vh - 128px))',
              backgroundColor: 'rgb(2 6 23)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.68), 0 0 32px rgba(34,211,238,0.18)',
              opacity: 1,
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/20 text-cyan-300">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">AI Design Copilot</h3>
                  <p className="text-xs text-slate-400">
                    {result?.status === 'drifted'
                      ? `${result.mismatchCount} issues found. Ask me what to fix.`
                      : 'Chat with your comparison results'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                aria-label="Close AI Design Copilot"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <StatusPill label="Detected" value={String(result?.mismatchCount ?? 0)} tone="text-red-300" />
                <StatusPill label="Verified" value={String(verifiedIssues.length)} tone="text-emerald-300" />
                <StatusPill
                  label="Accuracy"
                  value={result?.reviewSummary ? `${result.reviewSummary.accuracyScore}%` : 'N/A'}
                  tone="text-cyan-300"
                />
              </div>
            </div>

            <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((msg, index) => (
                <div
                  className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  key={`${msg.role}-${index}`}
                >
                  {msg.role === 'ai' ? (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="flex h-5 w-5 items-center justify-center rounded-md bg-cyan-400/15 text-cyan-300">
                        <Bot className="h-3 w-3" />
                      </span>
                      Copilot
                    </div>
                  ) : null}
                  <div
                    className={`max-w-[88%] whitespace-pre-line rounded-2xl border px-4 py-3 text-sm leading-6 ${
                      msg.role === 'ai'
                        ? 'rounded-tl-md border-white/10 bg-white/[0.06] text-slate-200'
                        : 'rounded-br-md border-cyan-400/25 bg-cyan-500/20 text-cyan-50'
                    }`}
                  >
                    {msg.text}
                  </div>
                  {msg.role === 'ai' && msg.action ? (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-lg border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-medium text-cyan-300 transition hover:bg-cyan-400/20"
                    >
                      <Sparkles className="h-3 w-3" />
                      {msg.action}
                    </button>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {quickPrompts.map((prompt) => (
                  <button
                    type="button"
                    key={prompt}
                    onClick={() => sendPrompt(prompt)}
                    className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-200 transition hover:border-cyan-300/40 hover:text-cyan-200"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <div className="relative">
                <input
                  type="text"
                  value={draft}
                  placeholder="Chat here: ask for errors, fixes, CSS, colors..."
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-4 pr-11 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/40"
                  onChange={(event) => setDraft(event.currentTarget.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      sendPrompt(draft)
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => sendPrompt(draft)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:text-white"
                  aria-label="Send message"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>,
    document.body
  )
}

function StatusPill({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5">
      <span className="text-slate-500">{label}: </span>
      <span className={`font-semibold ${tone}`}>{value}</span>
    </div>
  )
}

function sortIssues(issues: SyncMismatch[]) {
  return [...issues].sort((a, b) => {
    const severityDelta = severityWeight[b.severity] - severityWeight[a.severity]
    if (severityDelta !== 0) return severityDelta

    const verifiedDelta = Number(b.verification !== 'not_verified') - Number(a.verification !== 'not_verified')
    if (verifiedDelta !== 0) return verifiedDelta

    return String(a.field).localeCompare(String(b.field))
  })
}

function buildOpeningMessage(result: SyncResult, issues: SyncMismatch[]) {
  const criticalCount = issues.filter((issue) => issue.severity === 'critical').length
  const highCount = issues.filter((issue) => issue.severity === 'high').length
  const notVerifiedCount = issues.filter((issue) => issue.verification === 'not_verified').length
  const firstFix = issues[0]?.suggestedTailwindFix ?? issues[0]?.suggestedCssFix ?? issues[0]?.suggestedFix

  return [
    `${result.componentName}: ${result.mismatchCount} visual issue${result.mismatchCount === 1 ? '' : 's'} detected.`,
    `Priority: ${criticalCount} critical, ${highCount} high, ${notVerifiedCount} marked NOT VERIFIED.`,
    firstFix ? `Start here: ${humanizeField(issues[0].field)}. ${firstFix}` : 'No copy-ready fix is available yet.',
  ].join('\n')
}

function answerPrompt(
  prompt: string,
  result: SyncResult | null,
  issues: SyncMismatch[],
  verifiedIssues: SyncMismatch[],
  cssPatch: string
) {
  if (!result) {
    return 'No SyncResult is loaded yet. Run a comparison first, then I can suggest fixes from the captured Figma and website data.'
  }

  const query = prompt.toLowerCase()

  if (result.status === 'synced') {
    return `${result.componentName} is synced. I do not have drift fixes to suggest for this run.`
  }

  if (query.includes('verified')) {
    return formatIssueList(
      verifiedIssues,
      'Verified issues only',
      'No issues are currently verified. Items marked NOT VERIFIED need source, computed style, or pixel-sampled confirmation.'
    )
  }

  if (query.includes('color') || query.includes('hex')) {
    const colorIssues = issues.filter((issue) => issue.colorAudit || /color|background|badge|sidebar/i.test(String(issue.field)))
    return formatIssueList(colorIssues, 'Color fixes', 'No color-specific issues were found in this SyncResult.')
  }

  if (query.includes('css') || query.includes('patch') || query.includes('code')) {
    return cssPatch || 'No copy-ready CSS patch is available from this SyncResult yet.'
  }

  if (query.includes('all') || query.includes('main') || query.includes('error') || query.includes('issue')) {
    return formatIssueList(issues, 'Detected errors', 'No errors are available for this SyncResult.')
  }

  if (query.includes('top') || query.includes('fix') || query.includes('suggest') || query.includes('first')) {
    return formatIssueList(issues.slice(0, 5), 'Top fixes', 'No fixes are available for this SyncResult.')
  }

  return [
    'I can answer from the current SyncResult only.',
    formatIssueList(issues.slice(0, 3), 'Best next actions', 'No issues are available.'),
    'Ask for "Color fixes", "Only verified issues", or "CSS patch" for a narrower answer.',
  ].join('\n\n')
}

function formatIssueList(issues: SyncMismatch[], title: string, emptyText: string) {
  if (issues.length === 0) return emptyText

  const lines = issues.slice(0, 6).map((issue, index) => {
    const currentValue = issue.colorAudit?.implementationHex ?? issue.code ?? 'NOT VERIFIED'
    const expectedValue = issue.colorAudit?.expectedFigmaHex ?? issue.figma ?? 'NOT VERIFIED'
    const fix = issue.suggestedTailwindFix ?? issue.suggestedCssFix ?? issue.suggestedFix ?? 'Manual verification required.'
    const verification = issue.verification === 'not_verified' ? 'NOT VERIFIED' : 'verified'

    return `${index + 1}. ${humanizeField(issue.field)} (${issue.severity}, ${verification})
Current: ${String(currentValue)}
Expected: ${String(expectedValue)}
Fix: ${fix}`
  })

  return `${title}\n${lines.join('\n\n')}`
}

function buildCssPatch(issues: SyncMismatch[]) {
  const cssFixes = issues
    .map((issue) => issue.suggestedCssFix)
    .filter((fix): fix is string => Boolean(fix))

  if (cssFixes.length === 0) return ''

  const ruleFixes = cssFixes.filter((fix) => fix.includes('{'))
  const declarationFixes = cssFixes.filter((fix) => !fix.includes('{'))

  return [
    '/* PixelPerfect suggested patch. Verify selectors before shipping. */',
    ...ruleFixes.slice(0, 6).map((fix) => fix.trim()),
    declarationFixes.length > 0
      ? [
          '.pixelperfect-target {',
          ...declarationFixes.slice(0, 10).map((fix) => `  ${fix.replace(/\s+/g, ' ').trim()}`),
          '}',
        ].join('\n')
      : '',
  ].join('\n')
}

function humanizeField(field: SyncMismatch['field']) {
  return String(field)
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
