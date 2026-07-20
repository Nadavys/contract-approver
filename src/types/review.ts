export type IssueSeverity = 'critical' | 'major' | 'minor'

export interface Issue {
  id: string
  title: string
  severity: IssueSeverity
  description: string
  page: number
  resolved: boolean
}

export interface ReviewUser {
  id: string
  first_name: string
  last_name: string
}

export function reviewUserFullName(user: ReviewUser): string {
  return `${user.first_name} ${user.last_name}`
}

export interface ReviewDocument {
  pdf_url: string
}

export type ReviewStatus = 'created' | 'processing' | 'on_review' | 'approved'

export interface Review {
  name: string
  uploaded_at: string // ISO date-time
  status: ReviewStatus
  version: number
  user: ReviewUser
  problems: Issue[]
  document: ReviewDocument
  approved_at?: string // ISO date-time, set when status transitions to 'approved'
}
