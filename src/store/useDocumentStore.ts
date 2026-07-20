import { create } from 'zustand'
import type { Issue, Review } from '../types/review'

export type LoadStatus = 'idle' | 'loading' | 'loaded' | 'error'

type DocumentStore = {
  reviews: Record<string, Review>
  status: LoadStatus
  error: string | null
  loadReviews: () => Promise<void>
  toggleResolved: (docId: string, issueId: string) => void
  approve: (docId: string) => void
}

// --- Derived selectors (computed from issues on read, never stored, so they
// can't drift out of sync with the resolved flags). Each takes a single
// Review — callers look it up from `reviews` by id first. ---

// A minor issue never blocks approval; a critical/major one blocks until
// it's resolved.
function isBlocking(issue: Issue) {
  return issue.severity !== 'minor'
}

export function selectOpenCount(review: Review) {
  return review.problems.filter((issue) => !issue.resolved).length
}

export function selectBlockingRemaining(review: Review) {
  return review.problems.filter((issue) => isBlocking(issue) && !issue.resolved)
}

// All blocking (critical/major) issues resolved; minor issues are ignored.
export function selectCanApprove(review: Review) {
  return review.problems.every((issue) => issue.severity === 'minor' || issue.resolved)
}

// Blocking issues in list order, each tagged with whether it's resolved yet
// — drives the approve-gate progress bar (one segment per blocking issue).
export function selectBlockingProgress(review: Review) {
  return review.problems
    .filter(isBlocking)
    .map((issue) => ({ id: issue.id, severity: issue.severity, resolved: issue.resolved }))
}

export function selectMinorCount(review: Review) {
  return review.problems.filter((issue) => issue.severity === 'minor').length
}

// The raw shape of a document as it comes from the mock API response
// (public/mock_data/documents_api_mock.json): it carries its own `id` (used
// as the `reviews` record key below) and issues with no `resolved` flag —
// that's app-local review state, not part of the source data, so it's
// stamped on at load time instead. Exported so Storybook stories can seed
// the store from the same fixture data without going through loadReviews()
// (see App.stories.tsx).
export type ReviewJson = Omit<Review, 'problems'> & {
  id: string
  problems: Omit<Issue, 'resolved'>[]
}

export function toReview(json: ReviewJson): Review {
  return {
    name: json.name,
    uploaded_at: json.uploaded_at,
    status: json.status,
    version: json.version,
    user: json.user,
    document: json.document,
    approved_at: json.approved_at,
    problems: json.problems.map((issue) => ({ ...issue, resolved: false })),
  }
}

// Fetched like a real app would load its data, rather than statically
// imported — public/mock_data/documents_api_mock.json stands in for a real
// "GET /api/documents" response (an array of documents, each with the same
// shape ReviewJson describes).
async function fetchReviews(): Promise<Record<string, Review>> {
  const response = await fetch('/mock_data/documents_api_mock.json')
  if (!response.ok) {
    throw new Error(`Failed to load documents (${response.status})`)
  }
  const rawDocuments = (await response.json()) as ReviewJson[]
  return Object.fromEntries(rawDocuments.map((doc) => [doc.id, toReview(doc)]))
}

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  reviews: {},
  status: 'idle',
  error: null,
  // Guarded against re-entry so App.tsx's mount effect can call this
  // unconditionally: a story (or a second mounted <App/>) that's already
  // seeded `reviews` directly and set status to 'loaded' won't have it
  // clobbered by a real fetch racing in afterward.
  loadReviews: async () => {
    if (get().status === 'loading' || get().status === 'loaded') return
    set({ status: 'loading', error: null })
    try {
      const reviews = await fetchReviews()
      set({ reviews, status: 'loaded' })
    } catch (err) {
      set({ status: 'error', error: err instanceof Error ? err.message : 'Failed to load documents' })
    }
  },
  toggleResolved: (docId, issueId) =>
    set((state) => {
      const review = state.reviews[docId]
      if (!review) return state
      return {
        reviews: {
          ...state.reviews,
          [docId]: {
            ...review,
            problems: review.problems.map((issue) =>
              issue.id === issueId ? { ...issue, resolved: !issue.resolved } : issue,
            ),
          },
        },
      }
    }),
  approve: (docId) =>
    set((state) => {
      const review = state.reviews[docId]
      if (!review || !selectCanApprove(review)) return state
      return {
        reviews: {
          ...state.reviews,
          [docId]: { ...review, status: 'approved', approved_at: new Date().toISOString() },
        },
      }
    }),
}))
