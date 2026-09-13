import type { Metadata, Viewport } from 'next'
import { Manrope } from 'next/font/google'
import './globals.css'

const manrope = Manrope({ subsets: ['latin'], variable: '--font-sans', weight: ['400', '500', '600', '700', '800'] })

export const metadata: Metadata = {
  title: 'Tracked',
  description: 'The GLP-1 companion that protects muscle, fixes sleep and teaches as you go.',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'Tracked' },
}

export const viewport: Viewport = {
  themeColor: '#1F8A8A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={manrope.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
