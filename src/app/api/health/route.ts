import { NextResponse } from 'next/server'

import { SUPPORTED_PATCH } from '@/lib/constants'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('spec_rules').select('*', { count: 'exact', head: true })

    if (error) {
      return NextResponse.json({ status: 'error', message: error.message }, { status: 500 })
    }

    return NextResponse.json({ status: 'ok', db: 'connected', patch: SUPPORTED_PATCH })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ status: 'error', message }, { status: 500 })
  }
}
