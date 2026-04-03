'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useNavbar } from './hooks/useNavbar'

const HIDDEN_PATHS = ['/login']

export function Navbar() {
  const pathname = usePathname()
  const { userEmail, handleSignOut } = useNavbar()

  if (HIDDEN_PATHS.includes(pathname)) return null

  return (
    <nav className="sticky top-0 z-50 border-b border-[#30363d] bg-[#0d1117] px-6">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between">
        <Link href="/dashboard/analyze">
          <Image
            src="/logo.svg"
            alt="WoW Analyzer"
            width={160}
            height={32}
            className="h-8 w-auto"
            priority
          />
        </Link>

        {userEmail !== undefined && (
          <div className="flex items-center gap-4">
            <span className="hidden text-xs text-gray-400 sm:block">{userEmail}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-md border border-[#30363d] px-4 py-1.5 text-sm text-gray-300 transition-colors hover:border-[#c8a96e] hover:text-[#c8a96e]"
            >
              Sign out
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
