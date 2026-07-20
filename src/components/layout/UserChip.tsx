import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { slate } from '../../theme'
import { useUserStore } from '../../store/useUserStore'

type UserChipProps = {
  // Callers pass explicit colors rather than this component picking a
  // default, since both header contexts (AppNavbar, DocumentsPage) sit on
  // mode-aware backgrounds and pass theme-path colors like 'text.primary'.
  nameColor: string
  emailColor: string
}

// Shown on the right side of the header on every page (previously pinned to
// the bottom of the left drawer/nav rail on each page separately).
export default function UserChip({ nameColor, emailColor }: UserChipProps) {
  const user = useUserStore((state) => state.user)

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        gap: '9px',
        pl: '12px',
        ml: '2px',
        borderLeft: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          bgcolor: slate.accent.main,
          color: '#fff',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        {user.name.charAt(0).toUpperCase()}
      </Box>
      <Box sx={{ minWidth: 0, display: { xs: 'none', sm: 'block' } }}>
        <Typography noWrap sx={{ fontSize: 13, fontWeight: 700, color: nameColor, lineHeight: 1.25 }}>
          {user.name}
        </Typography>
        <Typography noWrap sx={{ fontSize: 11, color: emailColor, lineHeight: 1.25 }}>
          {user.email}
        </Typography>
      </Box>
    </Stack>
  )
}
