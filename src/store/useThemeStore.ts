import { create } from 'zustand'

type ThemeMode = 'light' | 'dark'

type ThemeStore = {
  mode: ThemeMode
  toggleMode: () => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  mode: 'light',
  toggleMode: () =>
    set((state) => ({ mode: state.mode === 'light' ? 'dark' : 'light' })),
}))
