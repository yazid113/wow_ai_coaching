'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { createClient } from '@/lib/supabase/client'

interface UseNavbarReturn {
  userEmail: string | undefined
  handleSignOut: () => Promise<void>
}

export function useNavbar(): UseNavbarReturn {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined)

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUserEmail(user?.email ?? undefined)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUserEmail(session?.user.email ?? undefined)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return { userEmail, handleSignOut }
}
