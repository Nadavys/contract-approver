import { create } from 'zustand'

type User = {
  name: string
  email: string
  imageUrl: string
}

type UserStore = {
  user: User
}

export const useUserStore = create<UserStore>(() => ({
  user: {
    name: 'Jane Doe',
    email: 'Jane@doe.com',
    imageUrl: '/avatar.svg',
  },
}))
