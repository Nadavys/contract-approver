import { create } from 'zustand'

type ViewerStore = {
  // The page an issue click wants to reveal. `nonce` changes on every
  // request so PdfViewerPage re-triggers the scroll+pulse even when the
  // same page is requested twice in a row.
  jumpPage: number | null
  nonce: number
  requestJump: (page: number) => void
}

export const useViewerStore = create<ViewerStore>((set) => ({
  jumpPage: null,
  nonce: 0,
  requestJump: (page) => set((state) => ({ jumpPage: page, nonce: state.nonce + 1 })),
}))
