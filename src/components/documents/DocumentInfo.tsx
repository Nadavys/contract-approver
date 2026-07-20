import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { slate } from '../../theme'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useDocumentId } from '../../routes'
import { reviewUserFullName } from '../../types/review'
import StatusPill from './StatusPill'

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})

export default function DocumentInfo() {
  const docId = useDocumentId()
  const review = useDocumentStore((state) => state.reviews[docId])
  const isApproved = review.status === 'approved'
  const metaDate =
    isApproved && review.approved_at ? review.approved_at : review.uploaded_at
  const metaLabel = isApproved ? 'Approved' : 'Uploaded'

  return (
    <Box sx={{ px: '22px', py: 2, borderBottom: `1px solid ${slate.divider}` }}>
      <Typography
        noWrap
        sx={{ fontFamily: slate.fonts.ui, fontSize: 14, fontWeight: 700, mb: 1.5 }}
      >
        {review.name}
      </Typography>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mb: 1.5 }}>
        <StatusPill status={review.status} />
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
          v{review.version}
        </Typography>
      </Stack>

      <Stack direction="row" sx={{ justifyContent: 'space-between', fontSize: 12 }}>
        <Typography component="span" sx={{ fontSize: 12, color: 'text.secondary' }}>
          {metaLabel} {dateFormatter.format(new Date(metaDate))}
        </Typography>
        <Typography
          component="span"
          noWrap
          sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', maxWidth: 110 }}
        >
          {reviewUserFullName(review.user)}
        </Typography>
      </Stack>
    </Box>
  )
}
