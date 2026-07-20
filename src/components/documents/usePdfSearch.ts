import { useCallback, useEffect, useRef, useState } from 'react'

function escapeHtml(value: string) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function usePdfSearch() {
  const [numPages, setNumPages] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [matchCount, setMatchCount] = useState(0)
  const [activeMatch, setActiveMatch] = useState(0)

  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const closeSearch = useCallback(() => {
    setSearchOpen(false)
    setQuery('')
  }, [])

  const goToMatch = useCallback((direction: 1 | -1) => {
    setActiveMatch((current) => {
      const marks = containerRef.current?.querySelectorAll('mark.pdf-search-mark')
      const total = marks?.length ?? 0
      if (total === 0) return 0
      return (current + direction + total) % total
    })
  }, [])

  // Cmd+F / Ctrl+F opens our scoped search box instead of the browser's
  // page-wide find (which would also match sidebar/header text).
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'f') {
        event.preventDefault()
        setSearchOpen(true)
        requestAnimationFrame(() => inputRef.current?.focus())
      } else if (event.key === 'Escape') {
        closeSearch()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeSearch])

  const customTextRenderer = useCallback(
    ({ str }: { str: string }) => {
      const trimmed = query.trim()
      const escaped = escapeHtml(str)
      if (!trimmed) return escaped
      const pattern = new RegExp(`(${escapeRegExp(trimmed)})`, 'gi')
      return escaped.replace(pattern, '<mark class="pdf-search-mark">$1</mark>')
    },
    [query],
  )

  // Reset to the first match whenever the search term changes. The actual
  // count is picked up reactively below once the highlighted marks land.
  useEffect(() => {
    setActiveMatch(0)
    if (!query.trim()) {
      setMatchCount(0)
    }
  }, [query])

  // react-pdf re-renders each page's text layer asynchronously (it streams
  // in per page, sometimes across multiple frames), so a single
  // requestAnimationFrame after a query change isn't reliably late enough to
  // see the freshly-inserted <mark> elements. A MutationObserver reacts to
  // the DOM whenever it actually changes, however long that takes.
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let rafId: number | null = null
    const recomputeMatchCount = () => {
      rafId = null
      const marks = container.querySelectorAll('mark.pdf-search-mark')
      setMatchCount(marks.length)
    }

    const observer = new MutationObserver(() => {
      if (rafId !== null) return
      rafId = requestAnimationFrame(recomputeMatchCount)
    })
    observer.observe(container, { childList: true, subtree: true, characterData: true })
    recomputeMatchCount()

    return () => {
      observer.disconnect()
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    const marks = containerRef.current?.querySelectorAll<HTMLElement>('mark.pdf-search-mark')
    if (!marks) return
    marks.forEach((mark, index) => {
      mark.classList.toggle('pdf-search-mark-active', index === activeMatch)
    })
    marks[activeMatch]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' })
  }, [activeMatch, matchCount])

  return {
    numPages,
    setNumPages,
    searchOpen,
    setSearchOpen,
    query,
    setQuery,
    matchCount,
    activeMatch,
    containerRef,
    inputRef,
    closeSearch,
    goToMatch,
    customTextRenderer,
  }
}

export type PdfSearch = ReturnType<typeof usePdfSearch>
