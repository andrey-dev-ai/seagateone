import type { MetadataRoute } from 'next'
import { LOCALES, SITE_URL } from '../lib/site.mjs'

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(LOCALES.map((locale) => [locale, SITE_URL + '/' + locale]))
  return LOCALES.map((locale) => ({
    url: SITE_URL + '/' + locale,
    alternates: { languages: { ...languages, 'x-default': SITE_URL + '/en' } },
  }))
}
