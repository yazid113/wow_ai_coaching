'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'

import type { LoginFormState } from '../loginForm.interfaces'

export function useLoginForm() {
  const router = useRouter()
  const [state, setState] = useState<LoginFormState>({
    email: '',
    password: '',
    error: undefined,
    loading: false,
  })

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, email: e.target.value, error: undefined }))
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, password: e.target.value, error: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setState((prev) => ({ ...prev, loading: true, error: undefined }))

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: state.email,
      password: state.password,
    })

    if (error !== null) {
      setState((prev) => ({ ...prev, loading: false, error: error.message }))
      return
    }

    router.push('/dashboard/analyze')
  }

  return { state, handleSubmit, handleEmailChange, handlePasswordChange }
}
