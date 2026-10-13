import { NextRequest, NextResponse } from 'next/server'

const locales = ['en', 'ru', 'uk', 'de', 'ar']
export function proxy(request: NextRequest) {
  const candidate = request.nextUrl.pathname.split('/')[1]
  const headers = new Headers(request.headers)
  // Always replace caller-provided locale headers with an allowlisted route value.
  headers.set('x-gateone-locale', locales.includes(candidate) ? candidate : 'en')
  return NextResponse.next({ request: { headers } })
}
export const config = { matcher: ['/', '/:locale'] }
