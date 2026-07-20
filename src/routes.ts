import { useParams } from 'react-router-dom'
import { useDocumentStore } from './store/useDocumentStore'

export function documentPath(id: string) {
  return `/documents/${id}`
}

// Reads the current document id from the matched "/documents/:id" route.
// Safe to call from any component rendered under that route — React
// Router's params are available to any descendant, not just the route's
// own element — so review-screen components read it directly rather than
// having it threaded down as a prop. Falls back to whichever document
// happens to be first in the loaded `reviews` record (there's currently
// only one) rather than a hardcoded id, since `reviews` is now fetched
// asynchronously (see useDocumentStore.ts) and isn't known at module load
// time. App.tsx only renders routes once loading has finished, so by the
// time anything calls this, `reviews` is populated.
export function useDocumentId(): string {
  const { id } = useParams<{ id: string }>()
  const fallbackId = useDocumentStore((state) => Object.keys(state.reviews)[0])
  return id ?? fallbackId ?? ''
}
