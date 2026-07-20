import { create } from 'zustand'

type WIPDialogStore = {
  open: boolean
  openDialog: () => void
  closeDialog: () => void
}

export const useWIPDialogStore = create<WIPDialogStore>((set) => ({
  open: false,
  openDialog: () => set({ open: true }),
  closeDialog: () => set({ open: false }),
}))
