import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import documentsApiMock from '../public/mock_data/documents_api_mock.json'
import { useDocumentStore, toReview, type ReviewJson } from './store/useDocumentStore'
import { useUserStore } from './store/useUserStore'
import { useThemeStore } from './store/useThemeStore'
import { documentPath } from './routes'
import type { Issue, IssueSeverity, Review, ReviewStatus } from './types/review'

// Seeded from the same fixture the real app fetches (see App.stories.tsx
// for why stories set status: 'loaded' directly rather than letting App's
// own loadReviews() run).
const rawDocument = (documentsApiMock as ReviewJson[])[0]
const LIVE_DOCUMENT_ID = rawDocument.id
const baseReview: Review = toReview(rawDocument)
const baseUser = useUserStore.getState().user

// Documents no longer carry a page count — mock issues just cycle across a
// plausible page range for variety.
const MOCK_PAGE_COUNT = 34

type ThemeMode = 'light' | 'dark'

type PlaygroundArgs = {
  status: ReviewStatus
  version: number
  criticalCount: number
  majorCount: number
  minorCount: number
  userName: string
  themeMode: ThemeMode
}

function buildIssues(args: PlaygroundArgs): Issue[] {
  const counts: [IssueSeverity, number][] = [
    ['critical', args.criticalCount],
    ['major', args.majorCount],
    ['minor', args.minorCount],
  ]
  return counts.flatMap(([severity, count]) =>
    Array.from({ length: count }, (_, index) => ({
      id: `${severity}-${index}`,
      title: `Mock ${severity} issue #${index + 1}`,
      severity,
      description: `Mock ${severity} issue #${index + 1}`,
      page: (index % MOCK_PAGE_COUNT) + 1,
      resolved: false,
    })),
  )
}

// Storybook-only: pushed straight into the stores during render (not an
// effect) so <App/> sees the args-driven state on its very first paint.
// Controls in the panel re-render this on every change, which re-runs the
// same setState calls, so it stays live as you drag/type.
function renderPlayground(args: PlaygroundArgs) {
  useDocumentStore.setState((state) => ({
    reviews: {
      ...state.reviews,
      [LIVE_DOCUMENT_ID]: {
        ...baseReview,
        status: args.status,
        version: args.version,
        problems: buildIssues(args),
      },
    },
    status: 'loaded',
    error: null,
  }))
  useUserStore.setState({ user: { ...baseUser, name: args.userName } })
  useThemeStore.setState({ mode: args.themeMode })

  return (
    <MemoryRouter initialEntries={[documentPath(LIVE_DOCUMENT_ID)]}>
      <App />
    </MemoryRouter>
  )
}

const meta: Meta<PlaygroundArgs> = {
  title: 'App/Review Screen Playground',
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    status: 'on_review',
    version: baseReview.version,
    criticalCount: 1,
    majorCount: 1,
    minorCount: 2,
    userName: baseUser.name,
    themeMode: 'light',
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['created', 'processing', 'on_review', 'approved'] satisfies ReviewStatus[],
    },
    version: { control: { type: 'number', min: 1 } },
    criticalCount: { control: { type: 'range', min: 0, max: 8, step: 1 } },
    majorCount: { control: { type: 'range', min: 0, max: 8, step: 1 } },
    minorCount: { control: { type: 'range', min: 0, max: 8, step: 1 } },
    userName: { control: 'text' },
    themeMode: { control: 'inline-radio', options: ['light', 'dark'] satisfies ThemeMode[] },
  },
  render: renderPlayground,
}

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
