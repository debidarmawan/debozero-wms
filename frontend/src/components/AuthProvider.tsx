'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const setHasHydrated = useAuthStore((state) => state.setHasHydrated)
  const _hasHydrated = useAuthStore((state) => state._hasHydrated)

  useEffect(() => {
    setHasHydrated(true)
  }, [setHasHydrated])

  // Don't render children until hydration is complete
  if (!_hasHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return <>{children}</>
}
