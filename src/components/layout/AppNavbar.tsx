import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import ButtonBase from '@mui/material/ButtonBase'
import Box from '@mui/material/Box'
import Badge from '@mui/material/Badge'
import Stack from '@mui/material/Stack'
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded'
import { slate } from '../../theme'
import { useThemeStore } from '../../store/useThemeStore'
import { useWIPDialogStore } from '../../store/useWIPDialogStore'
import UserChip from './UserChip'

type AppNavbarProps = {
  children?: ReactNode
}

const outlineButtonSx = {
  width: 34,
  height: 34,
  borderRadius: '9px',
  border: `1px solid ${slate.border}`,
  color: 'text.secondary',
} as const

export default function AppNavbar({ children }: AppNavbarProps) {
  const mode = useThemeStore((state) => state.mode)
  const toggleMode = useThemeStore((state) => state.toggleMode)
  const openWIPDialog = useWIPDialogStore((state) => state.openDialog)

  return (
    <AppBar position="sticky" color="inherit" sx={{ bgcolor: 'background.paper' }}>
      <Toolbar sx={{ minHeight: 60, height: 60, gap: 2, px: '20px' }}>
        {children}
        <Box sx={{ flex: 1 }} />
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexShrink: 0 }}>
          <ButtonBase
            component={Link}
            to="/"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '7px',
              height: 34,
              px: '12px',
              borderRadius: '9px',
              border: `1px solid ${slate.border}`,
              color: 'text.secondary',
              fontSize: 13,
              fontWeight: 600,
              '&:hover': { bgcolor: slate.chip.bg },
            }}
          >
            <DescriptionRoundedIcon sx={{ fontSize: 17 }} />
            Documents
          </ButtonBase>
          <Box
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: slate.text.tertiary,
              bgcolor: slate.chip.bg,
              border: `1px solid ${slate.border}`,
              px: '8px',
              py: '4px',
              borderRadius: '7px',
              display: { xs: 'none', md: 'block' },
            }}
          >
            ⌘F to search
          </Box>
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
          <UserChip nameColor="text.primary" emailColor="text.secondary" />
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
