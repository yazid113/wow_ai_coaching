function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export const env = {
  supabase: {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  },
  anthropic: {
    apiKey: requireEnv('ANTHROPIC_API_KEY'),
  },
  blizzard: {
    clientId: requireEnv('BLIZZARD_CLIENT_ID'),
    clientSecret: requireEnv('BLIZZARD_CLIENT_SECRET'),
    region: process.env['BLIZZARD_API_REGION'] ?? 'us',
  },
  wcl: {
    clientId: requireEnv('WCL_CLIENT_ID'),
    clientSecret: requireEnv('WCL_CLIENT_SECRET'),
  },
  app: {
    url: process.env['NEXT_PUBLIC_APP_URL'] ?? 'http://localhost:3000',
    nodeEnv: process.env['NODE_ENV'],
    syncSecret: requireEnv('SYNC_SECRET'),
    patchVersion: requireEnv('PATCH_VERSION'),
  },
} as const
