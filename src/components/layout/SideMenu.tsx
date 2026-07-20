import { Link } from 'react-router-dom'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import ButtonBase from '@mui/material/ButtonBase'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import { slate, severityColor } from '../../theme'
import {
  useDocumentStore,
  selectCanApprove,
  selectOpenCount,
  selectBlockingRemaining,
  selectBlockingProgress,
  selectMinorCount,
} from '../../store/useDocumentStore'
import { useDocumentId } from '../../routes'
import DocumentInfo from '../documents/DocumentInfo'
import IssuesList from '../documents/IssuesList'

const drawerWidth = 308

const stampDateFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
})
const stampTimeFormatter = new Intl.DateTimeFormat('en-US', {
  hour: 'numeric',
  minute: '2-digit',
})

// Replaces the approve gate once the review has actually been approved —
// read-only receipt, no button.
function ApprovedStamp({ approvedAt }: { approvedAt: string }) {
  const approvedDate = new Date(approvedAt)
  return (
    <Box sx={{ px: '18px', py: '14px', borderTop: `1px solid ${slate.divider}` }}>
      <Stack
        direction="row"
        sx={{
          alignItems: 'center',
          gap: '10px',
          bgcolor: slate.success.softBg,
          border: `1px solid ${slate.success.softBorder}`,
          borderRadius: '12px',
          p: '12px 13px',
        }}
      >
        <Box
          sx={{
            width: 20,
            height: 20,
            flexShrink: 0,
            borderRadius: '50%',
            bgcolor: slate.success.main,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CheckRoundedIcon sx={{ fontSize: 13, color: '#fff' }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: slate.success.text, lineHeight: 1.3 }}>
            Contract Approved
          </Typography>
          <Typography sx={{ fontSize: 11, color: slate.success.text }}>
            {stampDateFormatter.format(approvedDate)} · {stampTimeFormatter.format(approvedDate)}
          </Typography>
        </Box>
      </Stack>
    </Box>
  )
}

function ApproveGate() {
  const docId = useDocumentId()
  const review = useDocumentStore((state) => state.reviews[docId])
  const approve = useDocumentStore((state) => state.approve)
  const canApprove = selectCanApprove(review)
  const blockingRemaining = selectBlockingRemaining(review).length
  const progress = selectBlockingProgress(review)
  const minorCount = selectMinorCount(review)

  return (
    <Box sx={{ px: '18px', py: '14px', borderTop: `1px solid ${slate.divider}` }}>
      {canApprove ? (
        <Box
          sx={{
            bgcolor: slate.success.softBg,
            border: `1px solid ${slate.success.softBorder}`,
            borderRadius: '12px',
            p: '12px 13px',
            mb: '10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <Box
            sx={{
              width: 16,
              height: 16,
              borderRadius: '50%',
              bgcolor: slate.success.main,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckRoundedIcon sx={{ fontSize: 11, color: '#fff' }} />
          </Box>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: slate.success.text }}>
            All blocking issues resolved
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            bgcolor: slate.critical.softBg,
            border: `1px solid ${slate.critical.softBorder}`,
            borderRadius: '12px',
            p: '12px 13px',
            mb: '10px',
          }}
        >
          <Stack direction="row" sx={{ alignItems: 'center', gap: '8px', mb: '9px' }}>
            <Box
              sx={{
                width: 16,
                height: 16,
                border: `2px solid ${slate.critical.main}`,
                borderRadius: '5px',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: slate.critical.main,
                fontSize: 11,
                fontWeight: 800,
                flexShrink: 0,
                lineHeight: 1,
              }}
            >
              !
            </Box>
            <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: slate.critical.text }}>
              {blockingRemaining} blocking {blockingRemaining === 1 ? 'issue' : 'issues'} left
              before it can be approved
            </Typography>
          </Stack>
          <Stack direction="row" sx={{ gap: '5px' }}>
            {progress.map((segment) => (
              <Box
                key={segment.id}
                sx={{
                  height: 5,
                  flex: 1,
                  borderRadius: '3px',
                  bgcolor: segment.resolved
                    ? severityColor[segment.severity]
                    : 'rgba(0,0,0,0.12)',
                }}
              />
            ))}
          </Stack>
        </Box>
      )}

      <ButtonBase
        disabled={!canApprove}
        onClick={() => approve(docId)}
        sx={{
          width: '100%',
          p: '12px',
          borderRadius: '11px',
          fontSize: 14,
          fontWeight: 700,
          ...(canApprove
            ? {
                bgcolor: slate.accent.main,
                color: '#fff',
                boxShadow: slate.approveShadow,
                '&:hover': { bgcolor: '#6D28D9' },
              }
            : {
                bgcolor: '#EAEBF0',
                color: '#A6AAB6',
                cursor: 'not-allowed',
              }),
        }}
      >
        Approve this contract
      </ButtonBase>

      <Typography
        sx={{
          fontSize: 11,
          color: 'text.secondary',
          textAlign: 'center',
          mt: '8px',
          lineHeight: 1.4,
        }}
      >
        {canApprove
          ? minorCount > 0
            ? `${minorCount} minor ${minorCount === 1 ? 'issue' : 'issues'} can be addressed later.`
            : 'Ready to approve.'
          : 'Critical & major issues must be resolved first.'}
      </Typography>
    </Box>
  )
}

export default function SideMenu() {
  const docId = useDocumentId()
  const openCount = useDocumentStore((state) => selectOpenCount(state.reviews[docId]))
  const totalCount = useDocumentStore((state) => state.reviews[docId].problems.length)
  const status = useDocumentStore((state) => state.reviews[docId].status)
  const isApproved = status === 'approved'
  const approvedAt = useDocumentStore((state) => state.reviews[docId].approved_at)

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', sm: 'block' },
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Brand row */}
      <Stack
        component={Link}
        to="/"
        direction="row"
        sx={{
          alignItems: 'center',
          gap: '10px',
          p: '20px 22px 16px',
          borderBottom: `1px solid ${slate.divider}`,
          textDecoration: 'none',
        }}
      >
        <Box component="img" src="/logo.svg" alt="Contract Review" sx={{ height: 22 }} />
      </Stack>

      <DocumentInfo />

      {totalCount > 0 ? (
        <>
          {/* Issues header */}
          <Stack
            direction="row"
            sx={{ alignItems: 'center', justifyContent: 'space-between', p: '16px 22px 8px' }}
          >
            <Typography
              sx={{
                fontFamily: slate.fonts.head,
                fontSize: 13,
                fontWeight: 600,
                letterSpacing: '0.02em',
                color: 'text.secondary',
              }}
            >
              Issues
            </Typography>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary' }}>
              {isApproved
                ? `${totalCount} total · locked`
                : `${openCount} open · ${totalCount} total`}
            </Typography>
          </Stack>

          <IssuesList />
        </>
      ) : (
        // No issues on this document — nothing to list, but keep a flex:1
        // spacer so the gate/user row below stay pinned to the bottom.
        <Box sx={{ flex: 1, minHeight: 0 }} />
      )}

      {/* Only an active on_review document can actually be approved — for
          created/processing there's nothing actionable to show here, so the
          gate is hidden entirely rather than rendering a disabled button. */}
      {status === 'on_review' ? (
        <ApproveGate />
      ) : isApproved && approvedAt ? (
        <ApprovedStamp approvedAt={approvedAt} />
      ) : null}
    </Drawer>
  )
}
