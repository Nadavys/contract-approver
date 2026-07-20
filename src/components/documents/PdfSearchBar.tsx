import Stack from '@mui/material/Stack'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import InputBase from '@mui/material/InputBase'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import { slate } from '../../theme'
import type { PdfSearch } from './usePdfSearch'

type PdfSearchBarProps = {
  search: PdfSearch
}

export default function PdfSearchBar({ search }: PdfSearchBarProps) {
  const { query, setQuery, matchCount, activeMatch, inputRef, closeSearch, goToMatch } = search

  const hasQuery = query.trim().length > 0
  const matchLabel = matchCount > 0 ? `${activeMatch + 1} / ${matchCount}` : '0 / 0'

  return (
    <Stack direction="row" spacing={2} sx={{ alignItems: 'center', minWidth: 0 }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: '9px',
          flex: 1,
          maxWidth: 440,
          minWidth: 0,
          bgcolor: slate.chip.bg,
          border: `1px solid ${slate.chip.border}`,
          borderRadius: '10px',
          px: '10px',
          height: 38,
        }}
      >
        <SearchRoundedIcon sx={{ fontSize: 16, color: slate.text.tertiary, flexShrink: 0 }} />
        <InputBase
          inputRef={inputRef}
          placeholder="Search document"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault()
              goToMatch(event.shiftKey ? -1 : 1)
            } else if (event.key === 'Escape') {
              closeSearch()
            }
          }}
          sx={{
            flex: 1,
            minWidth: 0,
            fontSize: 13,
            color: slate.text.primary,
            '& input::placeholder': { color: slate.text.tertiary, opacity: 1 },
          }}
        />
        {hasQuery && (
          <Box
            component="span"
            sx={{
              fontSize: 12,
              color: slate.text.tertiary,
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}
          >
            {matchLabel}
          </Box>
        )}
        <IconButton
          size="small"
          disabled={matchCount === 0}
          onClick={() => goToMatch(-1)}
          aria-label="Previous match"
          sx={{ p: '2px', color: slate.text.secondary }}
        >
          <KeyboardArrowUpRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
        <IconButton
          size="small"
          disabled={matchCount === 0}
          onClick={() => goToMatch(1)}
          aria-label="Next match"
          sx={{ p: '2px', color: slate.text.secondary }}
        >
          <KeyboardArrowDownRoundedIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Stack>
    </Stack>
  )
}
