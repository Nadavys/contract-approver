import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ConstructionRoundedIcon from '@mui/icons-material/ConstructionRounded'
import { useWIPDialogStore } from '../../store/useWIPDialogStore'

// Mounted once, globally (see App.tsx) — reads its own open state from
// useWIPDialogStore rather than taking props, so any page can trigger it
// via openDialog() without threading open/onClose down through props.
export default function WIPDialog() {
  const open = useWIPDialogStore((state) => state.open)
  const closeDialog = useWIPDialogStore((state) => state.closeDialog)

  return (
    <Dialog
      open={open}
      onClose={closeDialog}
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            width: 360,
            textAlign: 'center',
            overflow: 'visible',
          },
        },
      }}
    >
      <IconButton
        onClick={closeDialog}
        size="small"
        aria-label="Close"
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          color: 'text.secondary',
        }}
      >
        <CloseRoundedIcon fontSize="small" />
      </IconButton>
      <DialogContent sx={{ pt: 5, pb: 2 }}>
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            mx: 'auto',
            mb: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #ede6ff 0%, #d9c4ff 100%)',
          }}
        >
          <ConstructionRoundedIcon sx={{ fontSize: 34, color: '#7e14ff' }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Work In Progress
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          This page isn't built yet.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
        <Button
          onClick={closeDialog}
          variant="contained"
          disableElevation
          sx={{ borderRadius: 999, px: 4, textTransform: 'none' }}
        >
          Got it
        </Button>
      </DialogActions>
    </Dialog>
  )
}
