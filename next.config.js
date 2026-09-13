/** @type {import('next').NextConfig} */
const nextConfig = {
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
