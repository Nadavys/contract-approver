import { useEffect, useMemo } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import { getTheme } from './theme'
import { useThemeStore } from './store/useThemeStore'
import { useDocumentStore } from './store/useDocumentStore'
import ReviewScreen from './ReviewScreen'
import DocumentsPage from './components/documents/DocumentsPage'
import WIPDialog from './components/layout/WIPDialog'

// Every document has real data in useDocumentStore now. Any id not found
// there (typos, stale links) bounces back to the documents list rather than
// rendering a broken review screen.
function DocumentRoute() {
  const { id } = useParams()
  const exists = useDocumentStore((state) => !!id && id in state.reviews)
  if (!exists) return <Navigate to="/" replace />
  return <ReviewScreen />
}

// Shown in place of the routes while useDocumentStore's initial fetch is
// in flight (or failed) — see loadReviews() in useDocumentStore.ts.
function LoadingScreen({ error }: { error: string | null }) {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        bgcolor: 'background.default',
      }}
    >
      {error ? (
        <Typography sx={{ color: 'error.main', fontSize: 14 }}>{error}</Typography>
      ) : (
        <CircularProgress />
      )}
    </Box>
  )
}

function App() {
  const mode = useThemeStore((state) => state.mode)
  const theme = useMemo(() => getTheme(mode), [mode])
  const status = useDocumentStore((state) => state.status)
  const error = useDocumentStore((state) => state.error)
  const loadReviews = useDocumentStore((state) => state.loadReviews)

  // Fetched once on mount, like a real app loading its initial data (see
  // useDocumentStore.ts's loadReviews()). Guarded there against re-entry,
  // so this is safe to call unconditionally.
  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {status === 'loaded' ? (
        <Routes>
          <Route path="/" element={<DocumentsPage />} />
          <Route path="/documents/:id" element={<DocumentRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      ) : (
        <LoadingScreen error={status === 'error' ? (error ?? 'Failed to load documents.') : null} />
      )}
      {/* Mounted once here (not per-page) so every "not implemented" trigger
          across both screens shares one dialog instance/store. */}
      <WIPDialog />
    </ThemeProvider>
  )
}

export default App
