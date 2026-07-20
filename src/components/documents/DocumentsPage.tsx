import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import InputBase from '@mui/material/InputBase'
import ButtonBase from '@mui/material/ButtonBase'
import IconButton from '@mui/material/IconButton'
import Badge from '@mui/material/Badge'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded'
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import { slate } from '../../theme'
import { assetPath } from '../../assetPath'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useThemeStore } from '../../store/useThemeStore'
import { useWIPDialogStore } from '../../store/useWIPDialogStore'
import { selectDocumentRows, type DocumentRow, type IssueSummary } from '../../store/documentRows'
import { documentPath } from '../../routes'
import StatusPill from './StatusPill'
import UserChip from '../layout/UserChip'
import type { IssueSeverity, ReviewStatus } from '../../types/review'

// The 3 stat-strip cards / filter chips cover every status a real Review
// can reach (see ReviewStatus in types/review.ts).
type StatusBucket = 'needs_review' | 'in_review' | 'approved'

function statusBucket(status: ReviewStatus): StatusBucket {
  switch (status) {
    case 'created':
    case 'processing':
      return 'needs_review'
    case 'on_review':
      return 'in_review'
    case 'approved':
      return 'approved'
  }
}

const thumbnailTint: Record<ReviewStatus, { bg: string; border: string; color: string }> = {
  created: { bg: slate.chip.bg, border: slate.chip.border, color: slate.text.secondary },
  processing: { bg: slate.chip.bg, border: slate.chip.border, color: slate.text.secondary },
  on_review: { bg: slate.accent.soft, border: '#DDD2F5', color: slate.accent.main },
  approved: { bg: slate.success.softBg, border: '#C8EAD7', color: slate.success.text },
}

const gridTemplate = '2.4fr 1fr 1.1fr 1fr 0.9fr'

// Matches AppNavbar's outline icon-button styling, so the dark/light toggle
// and notifications bell look identical on both screens. Theme-path colors
// (not static `slate` hex) so this adapts to dark mode like AppNavbar's does.
const outlineButtonSx = {
  width: 34,
  height: 34,
  borderRadius: '9px',
  border: '1px solid',
  borderColor: 'divider',
  color: 'text.secondary',
  flexShrink: 0,
} as const

function IssuesCell({ problems }: { problems: IssueSummary }) {
  if (problems.kind === 'text') {
    return (
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
        {problems.text}
      </Typography>
    )
  }
  const entries = Object.entries(problems.counts).filter(([, count]) => (count ?? 0) > 0) as [
    IssueSeverity,
    number,
  ][]
  if (entries.length === 0) {
    return (
      <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>
        Clean
      </Typography>
    )
  }
  return (
    <Stack direction="row" sx={{ gap: '6px', flexWrap: 'wrap' }}>
      {entries.map(([severity, count]) => (
        <Box
          key={severity}
          component="span"
          sx={{
            fontSize: 12,
            fontWeight: 700,
            borderRadius: '6px',
            px: '8px',
            py: '3px',
            color: severity === 'critical' ? slate.critical.text : '#B45309',
            bgcolor: severity === 'critical' ? slate.critical.softBg : '#FDF3E7',
          }}
        >
          {count} {severity}
        </Box>
      ))}
    </Stack>
  )
}

function DocumentRowContent({ row }: { row: DocumentRow }) {
  const tint = thumbnailTint[row.status]
  const metaLine = `v${row.version}`

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', gap: '12px', minWidth: 0 }}>
        <Box
          sx={{
            width: 34,
            height: 40,
            flexShrink: 0,
            borderRadius: '5px',
            bgcolor: tint.bg,
            border: `1px solid ${tint.border}`,
            display: 'inline-flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            pb: '5px',
            fontSize: 8,
            fontWeight: 800,
            color: tint.color,
            letterSpacing: '0.03em',
          }}
        >
          PDF
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography noWrap sx={{ fontSize: 14, fontWeight: 700, color: 'text.primary' }}>
            {row.name}
          </Typography>
          <Typography noWrap sx={{ fontSize: 12, color: 'text.secondary' }}>
            {metaLine}
          </Typography>
        </Box>
      </Stack>

      <Box>
        <StatusPill status={row.status} />
      </Box>

      <IssuesCell problems={row.problems} />

      <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{row.updatedLabel}</Typography>

      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            bgcolor: row.owner.color,
            color: '#fff',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {row.owner.initials}
        </Box>
      </Stack>
    </>
  )
}

function DocumentTableRow({ row, last }: { row: DocumentRow; last: boolean }) {
  const rowSx = {
    display: 'grid',
    gridTemplateColumns: gridTemplate,
    gap: '16px',
    px: '20px',
    py: '15px',
    alignItems: 'center',
    borderBottom: last ? 'none' : '1px solid',
    borderColor: 'divider',
  } as const

  // Every document now has real backing data in useDocumentStore, so every
  // row routes to its own review screen.
  return (
    <Box
      component={Link}
      to={documentPath(row.id)}
      sx={{ ...rowSx, textDecoration: 'none', cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
    >
      <DocumentRowContent row={row} />
    </Box>
  )
}

const filterLabel: Record<'all' | StatusBucket, string> = {
  all: 'All',
  needs_review: 'Processing',
  in_review: 'In review',
  approved: 'Approved',
}

export default function DocumentsPage() {
  const reviews = useDocumentStore((state) => state.reviews)
  const mode = useThemeStore((state) => state.mode)
  const toggleMode = useThemeStore((state) => state.toggleMode)
  const [filter, setFilter] = useState<'all' | StatusBucket>('all')
  const [query, setQuery] = useState('')
  const openWIPDialog = useWIPDialogStore((state) => state.openDialog)

  const allRows = useMemo(() => selectDocumentRows(reviews), [reviews])

  const stats = useMemo(() => {
    const counts: Record<StatusBucket, number> = {
      needs_review: 0,
      in_review: 0,
      approved: 0,
    }
    for (const row of allRows) {
      counts[statusBucket(row.status)] += 1
    }
    return counts
  }, [allRows])

  const visibleRows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allRows.filter((row) => {
      if (filter !== 'all' && statusBucket(row.status) !== filter) return false
      if (q && !row.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [allRows, filter, query])

  // "Documents" is the only real nav destination today; Approvals/Activity
  // and Settings all open the shared "not implemented" dialog.
  const navItems = [
    { label: 'Documents', icon: DescriptionRoundedIcon, active: true, onClick: undefined },
    { label: 'Approvals', icon: TaskAltRoundedIcon, active: false, onClick: openWIPDialog },
    { label: 'Activity', icon: HistoryRoundedIcon, active: false, onClick: openWIPDialog },
  ] as const

  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Nav rail */}
      <Box
        sx={{
          width: 236,
          flexShrink: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack
          component={Link}
          to="/"
          direction="row"
          sx={{
            alignItems: 'center',
            gap: '10px',
            p: '20px 20px 18px',
            borderBottom: '1px solid',
            borderColor: 'divider',
            textDecoration: 'none',
          }}
        >
          <Box component="img" src={assetPath('/logo.svg')} alt="Contract Review" sx={{ height: 22 }} />
        </Stack>

        <Stack sx={{ p: '14px 12px', gap: '3px' }}>
          {navItems.map(({ label, icon: Icon, active, onClick }) => (
            <Stack
              key={label}
              direction="row"
              onClick={onClick}
              sx={{
                alignItems: 'center',
                gap: '11px',
                px: '12px',
                py: '9px',
                borderRadius: '9px',
                fontSize: 14,
                fontWeight: active ? 700 : 600,
                color: active ? 'primary.main' : 'text.secondary',
                bgcolor: active ? 'action.selected' : 'transparent',
                cursor: onClick ? 'pointer' : 'default',
                ...(onClick ? { '&:hover': { bgcolor: 'action.hover' } } : {}),
              }}
            >
              <Icon sx={{ fontSize: 18 }} />
              {label}
            </Stack>
          ))}
          <Stack
            direction="row"
            onClick={openWIPDialog}
            sx={{
              alignItems: 'center',
              gap: '11px',
              px: '12px',
              py: '9px',
              borderRadius: '9px',
              fontSize: 14,
              fontWeight: 600,
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <SettingsRoundedIcon sx={{ fontSize: 18 }} />
            Settings
          </Stack>
        </Stack>

        <Box sx={{ flex: 1 }} />
      </Box>

      {/* Main */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.default',
        }}
      >
        {/* Top bar */}
        <Stack
          direction="row"
          sx={{
            height: 60,
            flexShrink: 0,
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            alignItems: 'center',
            gap: 2,
            px: '24px',
          }}
        >
          <Typography
            sx={{ fontFamily: slate.fonts.head, fontSize: 16, fontWeight: 700, color: 'text.primary' }}
          >
            Documents
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              gap: '9px',
              width: 300,
              bgcolor: 'action.hover',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '10px',
              px: '10px',
              height: 38,
            }}
          >
            <SearchRoundedIcon sx={{ fontSize: 16, color: 'text.secondary', flexShrink: 0 }} />
            <InputBase
              placeholder="Search documents"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              sx={{
                flex: 1,
                fontSize: 13,
                color: 'text.primary',
                '& input::placeholder': { color: 'text.secondary', opacity: 1 },
              }}
            />
          </Stack>
          <IconButton onClick={toggleMode} aria-label="Toggle light/dark mode" sx={outlineButtonSx}>
            {mode === 'light' ? (
              <DarkModeRoundedIcon sx={{ fontSize: 18 }} />
            ) : (
              <LightModeRoundedIcon sx={{ fontSize: 18 }} />
            )}
          </IconButton>
          <IconButton
            onClick={openWIPDialog}
            aria-label="Notifications"
            sx={outlineButtonSx}
          >
            <Badge color="error" variant="dot">
              <NotificationsRoundedIcon sx={{ fontSize: 18 }} />
            </Badge>
          </IconButton>
          <ButtonBase
            onClick={openWIPDialog}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              bgcolor: slate.accent.main,
              color: '#fff',
              fontSize: 13,
              fontWeight: 700,
              px: '15px',
              py: '9px',
              borderRadius: '10px',
              boxShadow: '0 6px 16px -6px rgba(124,58,237,0.6)',
              '&:hover': { bgcolor: '#6D28D9' },
            }}
          >
            <AddRoundedIcon sx={{ fontSize: 16 }} />
            Upload
          </ButtonBase>
          <UserChip nameColor="text.primary" emailColor="text.secondary" />
        </Stack>

        {/* Content */}
        <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: '24px' }}>
          {/* Stat strip */}
          <Stack direction="row" sx={{ gap: '14px', mb: '20px' }}>
            {(
              [
                { key: 'needs_review', label: 'Processing', color: 'text.primary' },
                { key: 'in_review', label: 'In review', color: 'primary.main' },
                { key: 'approved', label: 'Approved', color: 'success.main' },
              ] as const
            ).map(({ key, label, color }) => (
              <Box
                key={key}
                sx={{
                  flex: 1,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: '12px',
                  p: '15px 17px',
                }}
              >
                <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', mb: '6px' }}>
                  {label}
                </Typography>
                <Typography
                  sx={{ fontSize: 24, fontWeight: 800, color, fontVariantNumeric: 'tabular-nums' }}
                >
                  {stats[key]}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Filter chips */}
          <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', mb: '14px' }}>
            {(['all', 'needs_review', 'in_review', 'approved'] as const).map((key) => {
              const active = filter === key
              const count = key === 'all' ? allRows.length : stats[key]
              return (
                <ButtonBase
                  key={key}
                  onClick={() => setFilter(key)}
                  sx={{
                    fontSize: 13,
                    fontWeight: active ? 700 : 600,
                    // Inverted pill: bg/text swap the theme's ink/paper roles,
                    // so it stays a solid contrast pill in both light and dark mode.
                    color: active ? 'background.default' : 'text.secondary',
                    bgcolor: active ? 'text.primary' : 'background.paper',
                    border: active ? 'none' : '1px solid',
                    borderColor: 'divider',
                    px: '13px',
                    py: '6px',
                    borderRadius: '8px',
                  }}
                >
                  {filterLabel[key]}
                  {key === 'all' ? ` ${count}` : ''}
                </ButtonBase>
              )
            })}
            <Box sx={{ flex: 1 }} />
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>
              Sort: Recent
            </Typography>
          </Stack>

          {/* Table */}
          <Box
            sx={{
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '14px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: gridTemplate,
                gap: '16px',
                px: '20px',
                py: '12px',
                bgcolor: 'background.default',
                borderBottom: '1px solid',
                borderColor: 'divider',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
                textTransform: 'uppercase',
                color: 'text.secondary',
              }}
            >
              <Box>Document</Box>
              <Box>Status</Box>
              <Box>Issues</Box>
              <Box>Updated</Box>
              <Box sx={{ textAlign: 'right' }}>Owner</Box>
            </Box>

            {visibleRows.map((row, index) => (
              <DocumentTableRow key={row.id} row={row} last={index === visibleRows.length - 1} />
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
