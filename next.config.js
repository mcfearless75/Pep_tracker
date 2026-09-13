/** @type {import('next').NextConfig} */
const nextConfig = {
  // Public Supabase values baked in as defaults so a fresh Vercel project works
  // before any dashboard env is set. Both are public by design (RLS protects
  // data); the service role key and ANTHROPIC_API_KEY are never here.
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://bucllwnlmxlfsgfyyhpn.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'sb_publishable_gicWKYknJ2nmHAU3u7N5PA_RyqBggZR',
  },
  experimental: {
    // Capacitor packages reference native / DOM APIs; keep them out of the server bundle.
    serverComponentsExternalPackages: [
      '@capacitor/core',
      '@capacitor/push-notifications',
      '@capacitor/splash-screen',
      '@capacitor/android',
      '@capacitor/ios',
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=()' },
        ],
      },
    ]
  },
}

module.exports = nextConfig
