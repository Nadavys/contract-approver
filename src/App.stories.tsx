import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import documentsApiMock from '../public/mock_data/documents_api_mock.json'
import { useDocumentStore, toReview, type ReviewJson } from './store/useDocumentStore'
import { useUserStore } from './store/useUserStore'
import { useThemeStore } from './store/useThemeStore'
import { documentPath } from './routes'
import type { IssueSeverity, Review } from './types/review'

// Stories seed the store directly from the same fixture the real app
// fetches (public/mock_data/documents_api_mock.json) and mark it 'loaded',
// rather than letting App's own loadReviews() run — that would race a
// real fetch against whatever a story's beforeEach just set up (see
// loadReviews()'s re-entry guard in useDocumentStore.ts).
const rawDocuments = documentsApiMock as ReviewJson[]
const baseReviews: Record<string, Review> = Object.fromEntries(
  rawDocuments.map((doc) => [doc.id, toReview(doc)]),
)
const LIVE_DOCUMENT_ID = rawDocuments[0].id
const baseReview: Review = baseReviews[LIVE_DOCUMENT_ID]
const baseUser = useUserStore.getState().user

// Documents no longer carry a page count — mock issues just cycle across a
// plausible page range for variety.
const MOCK_PAGE_COUNT = 34

function resetStores() {
  useDocumentStore.setState({ reviews: baseReviews, status: 'loaded', error: null })
  useUserStore.setState({ user: baseUser })
  useThemeStore.setState({ mode: 'light' })
}

// Patches only the live document's review, leaving the other seed documents
// (and their own stories/state) untouched.
function setLiveReview(overrides: Partial<Review>) {
  useDocumentStore.setState((state) => ({
    reviews: {
      ...state.reviews,
      [LIVE_DOCUMENT_ID]: { ...state.reviews[LIVE_DOCUMENT_ID], ...overrides },
    },
  }))
}

// These stories exercise the review/approved screens specifically, so they
// start the in-memory router on a document's route rather than "/" (which
// would render DocumentsPage instead — see App/Documents List). Defaults to
// the live document; individual stories override via
// `parameters.initialRoute` (React Router errors if you nest a second
// <MemoryRouter> inside a per-story decorator, so this has to stay a single
// decorator parameterized per story rather than stacked ones).
const meta = {
  title: 'App/Review Screen',
  component: App,
  parameters: {
    layout: 'fullscreen',
    initialRoute: documentPath(LIVE_DOCUMENT_ID),
  },
  decorators: [
    (Story, context) => (
      <MemoryRouter initialEntries={[context.parameters.initialRoute as string]}>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

// The real app reads everything from these Zustand stores (see
// CLAUDE.md), so "different settings" here just means calling
// `.setState(...)` on them before the story renders. `beforeEach` always
// starts from `resetStores()` so stories stay independent of each other.

export const OnReview: Story = {
  name: 'On review (default)',
  beforeEach: () => {
    resetStores()
  },
}

export const NoIssues: Story = {
  beforeEach: () => {
    resetStores()
    setLiveReview({ problems: [] })
  },
}

export const CriticalIssuesOnly: Story = {
  beforeEach: () => {
    resetStores()
    setLiveReview({ problems: baseReview.problems.filter((issue) => issue.severity === 'critical') })
  },
}

export const GateCleared: Story = {
  name: 'Approve gate cleared (blocking resolved)',
  beforeEach: () => {
    resetStores()
    // Resolve every critical/major issue so the green "clear" gate + enabled
    // Approve button show; minor issues stay open.
    setLiveReview({
      problems: baseReview.problems.map((issue) =>
        issue.severity === 'minor' ? issue : { ...issue, resolved: true },
      ),
    })
  },
}

export const Approved: Story = {
  name: 'Approved (confirmation screen)',
  beforeEach: () => {
    resetStores()
    // Blocking issues resolved (as they must be to reach 'approved'); minor
    // issues left as-is, so the receipt card shows "2 resolved" / "2 flagged".
    setLiveReview({
      status: 'approved',
      approved_at: '2026-07-09T14:14:00Z',
      problems: baseReview.problems.map((issue) =>
        issue.severity === 'minor' ? issue : { ...issue, resolved: true },
      ),
    })
  },
}

export const ManyIssues: Story = {
  name: 'Many issues (scroll/overflow)',
  beforeEach: () => {
    resetStores()
    const severities: IssueSeverity[] = ['critical', 'major', 'minor']
    setLiveReview({
      problems: Array.from({ length: 20 }, (_, index) => ({
        id: `issue-${index}`,
        title: `Mock issue #${index + 1}`,
        severity: severities[index % severities.length],
        description: `Mock issue #${index + 1} for scroll/overflow testing.`,
        page: (index % MOCK_PAGE_COUNT) + 1,
        resolved: false,
      })),
    })
  },
}

export const DarkMode: Story = {
  beforeEach: () => {
    resetStores()
    useThemeStore.setState({ mode: 'dark' })
  },
}

export const DifferentUser: Story = {
  beforeEach: () => {
    resetStores()
    useUserStore.setState({
      user: { name: 'Jane Reviewer', email: 'jane@example.com', imageUrl: '/avatar.svg' },
    })
    setLiveReview({ user: { id: 'user_99', first_name: 'Jane', last_name: 'Reviewer' } })
  },
}
