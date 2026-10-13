import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import Script from 'next/script'
import { LOCALES, SITE_URL } from '../lib/site.mjs'
import './globals.css'
import '../public/gate-one/styles.css'
import '../public/gate-one/enhancements.css'

export const metadata: Metadata = {
  title: 'Gate One LTD — Shipowning & Maritime',
  description: 'Gate One LTD — shipownership, dry cargo transport, chartering and port agency.',
  metadataBase: new URL(SITE_URL),
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#071f2c',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const candidate = (await headers()).get('x-gateone-locale') ?? 'en'
  const locale = LOCALES.includes(candidate) ? candidate : 'en'
  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      <body className="antialiased">
        {children}
        <Script src="/gate-one/site.js" strategy="afterInteractive" />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}

