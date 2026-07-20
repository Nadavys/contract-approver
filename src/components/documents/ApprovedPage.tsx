import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ButtonBase from '@mui/material/ButtonBase'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { slate } from '../../theme'
import { useDocumentStore, selectBlockingProgress, selectMinorCount } from '../../store/useDocumentStore'
import { useDocumentId } from '../../routes'
import { reviewUserFullName } from '../../types/review'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const timeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

function ReceiptRow({
  label,
  value,
  valueColor,
  last,
}: {
  label: string
  value: string
  valueColor?: string
  last?: boolean
}) {
  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        justifyContent: 'space-between',
        py: '12px',
        borderBottom: last ? 'none' : `1px solid ${slate.divider}`,
      }}
    >
      <Typography sx={{ fontSize: 13, color: slate.text.secondary }}>{label}</Typography>
      <Typography sx={{ fontSize: 13, fontWeight: 700, color: valueColor ?? slate.text.primary }}>
        {value}
      </Typography>
    </Stack>
  )
}

function TrackerNode({
  circle,
  label,
  labelColor,
  labelWeight,
}: {
  circle: ReactNode
  label: string
  labelColor: string
  labelWeight: number
}) {
  return (
    <Stack
      sx={{ alignItems: 'center', width: 100, position: 'relative', zIndex: 1 }}
    >
      {circle}
      <Typography sx={{ fontSize: 12, fontWeight: labelWeight, color: labelColor, mt: '9px' }}>
        {label}
      </Typography>
    </Stack>
  )
}

function DoneCircle() {
  return (
    <Box
      sx={{
        width: 28,
        height: 28,
        borderRadius: '50%',
        bgcolor: slate.accent.main,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <CheckRoundedIcon sx={{ fontSize: 14, color: '#fff' }} />
    </Box>
  )
}

type ApprovedPageProps = {
  onViewDocument: () => void
}

export default function ApprovedPage({ onViewDocument }: ApprovedPageProps) {
  const docId = useDocumentId()
  const review = useDocumentStore((state) => state.reviews[docId])
  const approvedDate = new Date(review.approved_at ?? review.uploaded_at)
  const blockingResolvedCount = selectBlockingProgress(review).length
  const minorCount = selectMinorCount(review)

  return (
    <Box
      tabIndex={0}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        bgcolor: slate.bg.app,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 5,
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 560, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        {/* Success mark */}
        <Box
          sx={{
            width: 84,
            height: 84,
            borderRadius: '50%',
            bgcolor: slate.success.softBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: '26px',
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              bgcolor: slate.success.main,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 20px -6px rgba(5,150,105,0.6)',
            }}
          >
            <CheckRoundedIcon sx={{ fontSize: 28, color: '#fff' }} />
          </Box>
        </Box>

        <Typography
          sx={{
            fontFamily: slate.fonts.head,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: slate.accent.main,
            mb: '12px',
          }}
        >
          Review complete
        </Typography>

        <Typography
          sx={{
            fontFamily: slate.fonts.head,
            fontSize: 29,
            fontWeight: 700,
            letterSpacing: '-0.01em',
            color: slate.text.primary,
            mb: '12px',
          }}
        >
          Contract approved by {reviewUserFullName(review.user)}
        </Typography>

        <Typography sx={{ fontSize: 15, lineHeight: 1.6, color: slate.text.secondary, maxWidth: 440, mb: '32px' }}>
          <Box component="span" sx={{ fontWeight: 700, color: '#4C5262' }}>
            {review.name}
          </Box>{' '}
          (v{review.version}) was approved on {dateFormatter.format(approvedDate)} at{' '}
          {timeFormatter.format(approvedDate)}.
        </Typography>

        {/* Receipt */}
        <Box
          sx={{
            width: '100%',
            bgcolor: slate.bg.surface,
            border: `1px solid ${slate.border}`,
            borderRadius: '14px',
            px: '20px',
            py: '6px',
            mb: '26px',
            textAlign: 'left',
          }}
        >
          <ReceiptRow label="Approved by" value={reviewUserFullName(review.user)} />
          <ReceiptRow label="Version" value={`v${review.version}`} />
          <ReceiptRow
            label="Blocking issues"
            value={`${blockingResolvedCount} resolved`}
            valueColor={slate.success.text}
          />
          <ReceiptRow
            label="Minor notes"
            value={`${minorCount} flagged`}
            valueColor={slate.text.secondary}
            last
          />
        </Box>

        {/* Progress tracker — both stages are complete: the contract has
            already been approved, there's no pending external step left. */}
        <Box sx={{ width: '100%', maxWidth: 320, position: 'relative', display: 'flex', justifyContent: 'space-between', mb: '34px' }}>
          <Box sx={{ position: 'absolute', top: '13px', left: '16%', right: '16%', height: '2px', bgcolor: slate.accent.main, zIndex: 0 }} />

          <TrackerNode
            circle={<DoneCircle />}
            label="Reviewed"
            labelColor={slate.text.primary}
            labelWeight={700}
          />
          <TrackerNode
            circle={<DoneCircle />}
            label="Approved"
            labelColor={slate.text.primary}
            labelWeight={700}
          />
        </Box>

        {/* Actions */}
        <Stack direction="row" spacing={'12px'}>
          <ButtonBase
            onClick={onViewDocument}
            sx={{
              px: '22px',
              py: '12px',
              borderRadius: '11px',
              bgcolor: slate.accent.main,
              color: '#fff',
              fontSize: 14,
              fontWeight: 700,
              boxShadow: slate.approveShadow,
              '&:hover': { bgcolor: '#6D28D9' },
            }}
          >
            View document
          </ButtonBase>
          <ButtonBase
            component={Link}
            to="/"
            sx={{
              px: '22px',
              py: '12px',
              borderRadius: '11px',
              bgcolor: slate.bg.surface,
              border: '1px solid #D3D7E0',
              color: '#3A4152',
              fontSize: 14,
              fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            Back to documents
          </ButtonBase>
        </Stack>


      </Box>
    </Box>
  )
}
