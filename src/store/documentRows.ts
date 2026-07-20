import { slate } from '../theme'
import { reviewUserFullName } from '../types/review'
import type { IssueSeverity, Review, ReviewStatus } from '../types/review'

// View-model shapes for the documents table — owned here rather than
// types/review.ts since they're presentation, not domain, shapes (mirrors
// PdfSearch being defined in usePdfSearch.ts rather than a shared types
// file).
export type IssueSummary =
  | { kind: 'severities'; counts: Partial<Record<IssueSeverity, number>> }
  | { kind: 'text'; text: string }

export type DocumentRow = {
  id: string
  name: string
  version: number
  status: ReviewStatus
  problems: IssueSummary
  updatedLabel: string
  owner: { initials: string; color: string }
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

function formatUpdated(iso: string): string {
  const date = new Date(iso)
  const now = new Date()
  const diffHours = (now.getTime() - date.getTime()) / 3_600_000
  if (diffHours < 24 && date.toDateString() === now.toDateString()) {
    return diffHours < 1 ? 'Just now' : `${Math.floor(diffHours)}h ago`
  }
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return dateFormatter.format(date)
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Mirrors the exact per-status empty-state text from the design handoff:
// a review with no issues reads differently depending on where it is in
// its lifecycle (not yet looked at vs. looked at and clean).
function issuesSummaryFor(review: Review): IssueSummary {
  if (review.status === 'approved') {
    const minorCount = review.problems.filter((issue) => issue.severity === 'minor').length
    return { kind: 'text', text: minorCount > 0 ? `${minorCount} minor noted` : 'Clean' }
  }
  if (review.problems.length === 0) {
    if (review.status === 'created' || review.status === 'processing') {
      return { kind: 'text', text: 'Not started' }
    }
    return { kind: 'text', text: 'Clean' }
  }
  const blockingCounts: Partial<Record<IssueSeverity, number>> = {}
  for (const issue of review.problems) {
    if (issue.severity !== 'minor' && !issue.resolved) {
      blockingCounts[issue.severity] = (blockingCounts[issue.severity] ?? 0) + 1
    }
  }
  return { kind: 'severities', counts: blockingCounts }
}

// Derives the documents table's rows directly from useDocumentStore's full
// per-document data, so the table and the review-screen sidebar can never
// drift out of sync (there's a single source of truth: `reviews`).
export function selectDocumentRows(reviews: Record<string, Review>): DocumentRow[] {
  return Object.entries(reviews).map(([id, review]) => ({
    id,
    name: review.name,
    version: review.version,
    status: review.status,
    problems: issuesSummaryFor(review),
    updatedLabel: formatUpdated(review.approved_at ?? review.uploaded_at),
    owner: {
      initials: initialsFor(reviewUserFullName(review.user)),
      color: slate.accent.main,
    },
  }))
}
