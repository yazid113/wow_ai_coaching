'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { createClient } from '@/lib/supabase/client'

const PROTECTED_PREFIX = '/dashboard'

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT' && pathname.startsWith(PROTECTED_PREFIX)) {
        router.replace('/login')
      }
      if (event === 'SIGNED_IN') {
        router.refresh()
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [pathname, router])

  return <>{children}</>
}
