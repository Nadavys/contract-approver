import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import documentsApiMock from '../public/mock_data/documents_api_mock.json'
import { useDocumentStore, toReview, type ReviewJson } from './store/useDocumentStore'
import { useUserStore } from './store/useUserStore'
import { useThemeStore } from './store/useThemeStore'
import type { Review } from './types/review'

// Seeded from the same fixture the real app fetches (see App.stories.tsx
// for why stories set status: 'loaded' directly rather than letting
// App's own loadReviews() run).
const rawDocuments = documentsApiMock as ReviewJson[]
const baseReviews: Record<string, Review> = Object.fromEntries(
  rawDocuments.map((doc) => [doc.id, toReview(doc)]),
)
const LIVE_DOCUMENT_ID = rawDocuments[0].id
const baseReview: Review = baseReviews[LIVE_DOCUMENT_ID]
const baseUser = useUserStore.getState().user

function resetStores() {
  useDocumentStore.setState({ reviews: baseReviews, status: 'loaded', error: null })
  useUserStore.setState({ user: baseUser })
  useThemeStore.setState({ mode: 'light' })
}

// Exercises the "/" route (DocumentsPage) — the landing screen with the nav
// rail, stat strip, filter chips, and the documents table. Every row is
// driven by useDocumentStore's `reviews`, same as the review screen stories.
const meta = {
  title: 'App/Documents List',
  component: App,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MemoryRouter initialEntries={['/']}>
        <Story />
      </MemoryRouter>
    ),
  ],
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  beforeEach: () => {
    resetStores()
  },
}

export const LiveRowApproved: Story = {
  name: 'Live row approved',
  beforeEach: () => {
    resetStores()
    useDocumentStore.setState((state) => ({
      reviews: {
        ...state.reviews,
        [LIVE_DOCUMENT_ID]: {
          ...baseReview,
          status: 'approved',
          approved_at: '2026-07-09T14:14:00Z',
          problems: baseReview.problems.map((issue) =>
            issue.severity === 'minor' ? issue : { ...issue, resolved: true },
          ),
        },
      },
    }))
  },
}
