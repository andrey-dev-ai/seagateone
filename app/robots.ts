import type { MetadataRoute } from 'next'
import { SITE_URL } from '../lib/site.mjs'

export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: '*', allow: '/', disallow: '/gate-one/index.html' }, sitemap: SITE_URL + '/sitemap.xml' }
}
