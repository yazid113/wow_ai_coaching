import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

import { AnalyzePage } from './_components/AnalyzePage/AnalyzePage'

export const metadata = { title: 'Analyse — WoW Analyzer' }

export default async function Page() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user === null) {
    redirect('/login')
  }

  return <AnalyzePage />
}
