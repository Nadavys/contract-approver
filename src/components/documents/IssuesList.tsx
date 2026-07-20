import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import ButtonBase from '@mui/material/ButtonBase'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { slate, severityColor, severityTextColor } from '../../theme'
import { useDocumentStore } from '../../store/useDocumentStore'
import { useViewerStore } from '../../store/useViewerStore'
import { useDocumentId } from '../../routes'
import type { Issue, IssueSeverity } from '../../types/review'

const severityLabel: Record<IssueSeverity, string> = {
  critical: 'Critical',
  major: 'Major',
  minor: 'Minor',
}

// Once approved, every blocking (critical/major) issue is guaranteed
// resolved (approval is gated on it), so its chip always reads "Resolved".
// Minor issues are informational and always read "Noted", regardless of
// whether they were individually toggled resolved before approval.
function StaticStatusChip({ issue }: { issue: Issue }) {
  if (issue.severity === 'minor') {
    return (
      <Box
        component="span"
        sx={{
          fontSize: 11,
          fontWeight: 700,
          color: slate.text.secondary,
          bgcolor: slate.chip.bg,
          border: `1px solid ${slate.chip.border}`,
          px: '10px',
          py: '5px',
          borderRadius: '8px',
        }}
      >
        Noted
      </Box>
    )
  }
  return (
    <Box
      component="span"
      sx={{
        fontSize: 11,
        fontWeight: 700,
        color: slate.success.text,
        bgcolor: slate.success.softBg,
        border: `1px solid ${slate.success.softBorder}`,
        px: '10px',
        py: '5px',
        borderRadius: '8px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
      }}
    >
      <CheckRoundedIcon sx={{ fontSize: 13 }} />
      Resolved
    </Box>
  )
}

function IssueCard({ issue, readOnly }: { issue: Issue; readOnly: boolean }) {
  const docId = useDocumentId()
  const toggleResolved = useDocumentStore((state) => state.toggleResolved)
  const requestJump = useViewerStore((state) => state.requestJump)
  const color = severityColor[issue.severity]
  const textColor = severityTextColor[issue.severity]

  return (
    <Box
      onClick={readOnly ? undefined : () => requestJump(issue.page)}
      sx={{
        cursor: readOnly ? 'default' : 'pointer',
        p: '12px',
        borderRadius: '11px',
        border: `1px solid ${slate.border}`,
        bgcolor: readOnly ? '#FAFAFC' : '#F3F5FA',
        boxShadow: '0 1px 3px rgba(30,41,59,0.08)',
        // Resolved (but not read-only) cards used to fade to opacity 0.5 to
        // de-emphasize them — removed because at that blend level no text
        // color can clear 4.5:1 contrast against the near-white background.
        // The green "Resolved" button already conveys the state distinctly.
        opacity: readOnly ? 0.9 : 1,
        transition: 'opacity .2s, border-color .15s',
        ...(readOnly ? {} : { '&:hover': { borderColor: '#D3D7E0' } }),
      }}
    >
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', mb: '7px' }}
      >
        <Stack direction="row" sx={{ alignItems: 'center', gap: '7px' }}>
          <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />
          <Typography
            component="span"
            sx={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.03em',
              textTransform: 'uppercase',
              color: textColor,
            }}
          >
            {severityLabel[issue.severity]}
          </Typography>
        </Stack>
        <Box
          component="span"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: slate.text.secondary,
            bgcolor: slate.chip.bg,
            px: '7px',
            py: '2px',
            borderRadius: '5px',
          }}
        >
          Page {issue.page}
        </Box>
      </Stack>

      <Typography
        sx={{ fontSize: 13, fontWeight: 700, lineHeight: 1.4, color: slate.text.primary, mb: '3px' }}
      >
        {issue.title}
      </Typography>

      <Typography
        sx={{ fontSize: 13, lineHeight: 1.5, color: slate.text.secondary, mb: '11px' }}
      >
        {issue.description}
      </Typography>

      <Stack direction="row" sx={{ justifyContent: 'flex-end' }}>
        {readOnly ? (
          <StaticStatusChip issue={issue} />
        ) : (
          <ButtonBase
            onClick={(event) => {
              // Don't also trigger the card's jump-to-page.
              event.stopPropagation()
              toggleResolved(docId, issue.id)
            }}
            sx={{
              fontSize: 12,
              fontWeight: 700,
              px: '12px',
              py: '6px',
              borderRadius: '8px',
              border: `1px solid ${issue.resolved ? slate.success.chipBorder : '#D3D7E0'}`,
              bgcolor: issue.resolved ? slate.success.softBg : slate.bg.surface,
              color: issue.resolved ? slate.success.text : '#3A4152',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {issue.resolved && <CheckRoundedIcon sx={{ fontSize: 14 }} />}
            {issue.resolved ? 'Resolved' : 'Mark resolved'}
          </ButtonBase>
        )}
      </Stack>
    </Box>
  )
}

export default function IssuesList() {
  const docId = useDocumentId()
  const issues = useDocumentStore((state) => state.reviews[docId].problems)
  const readOnly = useDocumentStore((state) => state.reviews[docId].status === 'approved')

  return (
    <Box
      tabIndex={0}
      sx={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        px: '18px',
        pt: '4px',
        pb: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '9px',
      }}
    >
      {issues.map((issue) => (
        <IssueCard key={issue.id} issue={issue} readOnly={readOnly} />
      ))}
    </Box>
  )
}
