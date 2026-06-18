import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export function useAuth() {
  const router = useRouter()
  const queryClient = useQueryClient()

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      if (!res.ok) {
        const error = await res.json().catch(() => ({}))
        throw new Error(error.message ?? 'Não foi possível realizar o login.')
      }
      await queryClient.invalidateQueries({ queryKey: ['me'] })
      router.push('/home')
      router.refresh()
    },
    [router, queryClient],
  )

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    queryClient.clear()
    router.push('/login')
    router.refresh()
  }, [router, queryClient])

  return { login, logout }
}
