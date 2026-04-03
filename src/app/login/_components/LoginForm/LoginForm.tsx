'use client'

import { cn } from '@/lib/utils'

import { useLoginForm } from './hooks/useLoginForm'

export function LoginForm() {
  const { state, handleSubmit, handleEmailChange, handlePasswordChange } = useLoginForm()

  return (
    <div className="flex min-h-screen w-full">
      {/* Left panel — desktop only */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-16 bg-[#0d1117]">
        <div className="max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-3xl">⚔</span>
            <span className="text-3xl font-black text-[#c8a96e] tracking-tight">WoW Analyzer</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">
            AI-powered rotation coaching
          </h2>
          <p className="text-gray-400 text-lg leading-relaxed mb-10">
            Paste your combat log and receive instant, spec-aware feedback on your rotation,
            cooldown usage, and proc chains.
          </p>
          <div className="flex flex-col gap-4">
            {[
              'Identify critical rotation mistakes',
              'Track cooldown alignment',
              'Compare against SimulationCraft APL',
            ].map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="text-[#c8a96e]">✓</span>
                <span className="text-gray-300 text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — sign-in form */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 sm:px-16 bg-[#161b22]">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <span className="text-xl">⚔</span>
            <span className="text-xl font-black text-[#c8a96e]">WoW Analyzer</span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Sign in to continue</h1>
          <p className="text-gray-400 text-sm mb-8">Enter your credentials below.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={state.email}
                onChange={handleEmailChange}
                disabled={state.loading}
                placeholder="you@example.com"
                className={cn(
                  'rounded-lg border border-[#30363d] bg-[#0d1117]',
                  'px-4 py-3 text-sm text-white placeholder-gray-500',
                  'focus:border-[#c8a96e] focus:outline-none focus:ring-1 focus:ring-[#c8a96e]',
                  'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
                )}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={state.password}
                onChange={handlePasswordChange}
                disabled={state.loading}
                placeholder="••••••••"
                className={cn(
                  'rounded-lg border border-[#30363d] bg-[#0d1117]',
                  'px-4 py-3 text-sm text-white placeholder-gray-500',
                  'focus:border-[#c8a96e] focus:outline-none focus:ring-1 focus:ring-[#c8a96e]',
                  'disabled:cursor-not-allowed disabled:opacity-50 transition-colors',
                )}
              />
            </div>

            {state.error !== undefined && (
              <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={state.loading}
              className={cn(
                'w-full rounded-lg bg-[#c8a96e] px-4 py-3',
                'text-sm font-semibold text-[#0d1117]',
                'hover:bg-[#d4b87a] transition-colors',
                'disabled:cursor-not-allowed disabled:opacity-50',
              )}
            >
              {state.loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-8 text-center text-xs text-gray-500">
            Don&apos;t have an account?{' '}
            <span className="text-gray-400">Contact your administrator.</span>
          </p>
        </div>
      </div>
    </div>
  )
}
