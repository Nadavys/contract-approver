import { useEffect, useMemo, useRef } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import './pdfSearch.css'
import Box from '@mui/material/Box'
import { useViewerStore } from '../../store/useViewerStore'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useDocumentId } from '../../routes'
import type { PdfSearch } from './usePdfSearch'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

function pageId(pageNumber: number) {
  return `pdf-page-${pageNumber}`
}

type PdfViewerPageProps = {
  search: PdfSearch
}

export default function PdfViewerPage({ search }: PdfViewerPageProps) {
  const docId = useDocumentId()
  const pdfUrl = useDocumentStore((state) => state.reviews[docId].document.pdf_url)
  const { numPages, setNumPages, containerRef, customTextRenderer } = search

  const pages = useMemo(() => Array.from({ length: numPages }, (_, i) => i + 1), [numPages])

  // Issue → location: scroll the requested page to the top of the viewer and
  // pulse it. Driven by useViewerStore's nonce so repeat clicks re-fire; the
  // page itself is read from the store at fire time (not a render dep).
  const nonce = useViewerStore((state) => state.nonce)
  const pulseTimeout = useRef<number | null>(null)

  useEffect(() => {
    const { jumpPage } = useViewerStore.getState()
    if (jumpPage == null) return
    const container = containerRef.current
    const target = document.getElementById(pageId(jumpPage))
    if (!container || !target) return

    const containerRect = container.getBoundingClientRect()
    const targetRect = target.getBoundingClientRect()
    container.scrollTo({
      top: container.scrollTop + (targetRect.top - containerRect.top) - 22,
      behavior: 'smooth',
    })

    target.classList.remove('pdf-page-pulse')
    // Force reflow so re-adding the class restarts the animation.
    void target.offsetWidth
    target.classList.add('pdf-page-pulse')
    if (pulseTimeout.current) window.clearTimeout(pulseTimeout.current)
    pulseTimeout.current = window.setTimeout(
      () => target.classList.remove('pdf-page-pulse'),
      1700,
    )

    return () => {
      if (pulseTimeout.current) window.clearTimeout(pulseTimeout.current)
    }
  }, [nonce, containerRef])

  return (
    <Box
      ref={containerRef}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        bgcolor: 'background.default',
        p: 3,
      }}
    >
      <Document
        file={pdfUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        className="pdf-document-stack"
      >
        {pages.map((pageNumber) => (
          <Box
            key={pageNumber}
            id={pageId(pageNumber)}
            sx={{
              flex: '0 0 auto',
              borderRadius: 1,
              boxShadow: '0 4px 18px -6px rgba(20,22,30,0.25)',
            }}
          >
            <Page pageNumber={pageNumber} customTextRenderer={customTextRenderer} />
          </Box>
        ))}
      </Document>
    </Box>
  )
}
