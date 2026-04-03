import type { Metadata } from 'next'
import localFont from 'next/font/local'

import { SupabaseProvider } from '@/components/providers/SupabaseProvider'
import { Navbar } from '@/components/shared/Navbar/Navbar'

import './globals.css'

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
})

const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
})

export const metadata: Metadata = {
  title: 'WoW Analyzer — AI Rotation Coaching',
  description: 'Analyze your World of Warcraft combat logs with AI-powered rotation coaching.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SupabaseProvider>
          <Navbar />
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
