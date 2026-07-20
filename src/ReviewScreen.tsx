import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import SideMenu from './components/layout/SideMenu'
import AppNavbar from './components/layout/AppNavbar'
import PdfViewerPage from './components/documents/PdfViewerPage'
import PdfSearchBar from './components/documents/PdfSearchBar'
import ApprovedPage from './components/documents/ApprovedPage'
import { usePdfSearch } from './components/documents/usePdfSearch'
import { useDocumentStore } from './store/useDocumentStore'
import { useDocumentId } from './routes'

export default function ReviewScreen() {
  const search = usePdfSearch()
  const docId = useDocumentId()
  const status = useDocumentStore((state) => state.reviews[docId].status)

  // Land on the confirmation screen right when an approval happens. "View
  // document" dismisses it locally to reveal the (now read-only) PDF view;
  // "Back to documents" (in ApprovedPage) is a real route to "/". Re-syncs
  // whenever the document changes too, so navigating from one approved
  // document straight to another doesn't carry over a locally-dismissed
  // confirmation from the previous one.
  const [showConfirmation, setShowConfirmation] = useState(status === 'approved')
  useEffect(() => {
    setShowConfirmation(status === 'approved')
  }, [docId, status])

  if (status === 'approved' && showConfirmation) {
    return (
      <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
        <SideMenu />
        <ApprovedPage onViewDocument={() => setShowConfirmation(false)} />
      </Box>
    )
  }

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <SideMenu />
      <Box
        sx={{
          flexGrow: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
        }}
      >
        <AppNavbar>
          <PdfSearchBar search={search} />
        </AppNavbar>
        <PdfViewerPage search={search} />
      </Box>
    </Box>
  )
}
