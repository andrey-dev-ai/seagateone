/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: {
    '/*': ['./content/*.json', './public/gate-one/index.html'],
  },
  async redirects() {
    const localized = ['en', 'ru', 'uk', 'de', 'ar'].map(locale => ({
      source: '/gate-one/index.html',
      has: [{ type: 'query', key: 'lang', value: locale }],
      destination: '/' + locale,
      permanent: false,
    }))
    return [...localized, { source: '/gate-one/index.html', destination: '/en', permanent: false }]
  },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    }]
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig

