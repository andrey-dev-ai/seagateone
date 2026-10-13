import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { LOCALES, SITE_URL, getDictionary, renderSite } from '../../lib/site.mjs'

type Props = { params: Promise<{ locale: string }> }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  if (!LOCALES.includes(locale)) notFound()
  const dict = getDictionary(locale)
  const locales: Record<string, string> = { en: 'en_GB', ru: 'ru_RU', uk: 'uk_UA', de: 'de_DE', ar: 'ar_AR' }
  return {
    title: dict.metaTitle,
    description: dict.metaDescription,
    alternates: {
      canonical: SITE_URL + '/' + locale,
      languages: { ...Object.fromEntries(LOCALES.map((language) => [language, SITE_URL + '/' + language])), 'x-default': SITE_URL + '/en' },
    },
    openGraph: {
      title: dict.metaTitle, description: dict.metaDescription, type: 'website',
      url: SITE_URL + '/' + locale, locale: locales[locale],
      alternateLocale: LOCALES.filter((language) => language !== locale).map((language) => locales[language]),
      images: [{ url: SITE_URL + '/gate-one/assets/hero.webp', width: 2560, height: 1440, alt: dict.heroAlt }],
    },
    twitter: { card: 'summary_large_image', title: dict.metaTitle, description: dict.metaDescription, images: [SITE_URL + '/gate-one/assets/hero.webp'] },
  }
}

export default async function LocalePage({ params }: Props) {
  const { locale } = await params
  if (!LOCALES.includes(locale)) notFound()
  return <div className="site-content" dangerouslySetInnerHTML={{ __html: renderSite(locale) }} />
}
