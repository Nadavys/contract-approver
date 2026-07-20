import Box from '@mui/material/Box'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import type { ReviewStatus } from '../../types/review'

type PillStyle = {
  label: string
  color: string
  bg: string
  dotColor?: string
  // The terminal state (approved) gets a check instead of a dot.
  hasCheck?: boolean
}

const pillStyle: Record<ReviewStatus, PillStyle> = {
  created: { label: 'Processing', color: '#B45309', bg: '#FDF3E7', dotColor: '#D97706' },
  processing: { label: 'Processing', color: '#B45309', bg: '#FDF3E7', dotColor: '#D97706' },
  on_review: { label: 'On review', color: '#7C3AED', bg: '#EFE9FC', dotColor: '#7C3AED' },
  approved: { label: 'Approved', color: '#047857', bg: '#E6F6EE', hasCheck: true },
}

export default function StatusPill({ status }: { status: ReviewStatus }) {
  const style = pillStyle[status]
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1.4,
        color: style.color,
        bgcolor: style.bg,
        borderRadius: 999,
        px: '10px',
        py: '4px',
      }}
    >
      {style.hasCheck ? (
        <CheckRoundedIcon sx={{ fontSize: 11 }} />
      ) : (
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: style.dotColor }} />
      )}
      {style.label}
    </Box>
  )
}
