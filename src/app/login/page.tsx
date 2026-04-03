import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { LoginForm } from './_components/LoginForm/LoginForm'

export const metadata = { title: 'Sign in — WoW Analyzer' }

export default async function LoginPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user !== null) {
    redirect('/dashboard/analyze')
  }

  return <LoginForm />
}
