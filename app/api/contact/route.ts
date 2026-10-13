import { NextRequest, NextResponse } from 'next/server'
import { formatTelegramMessage, MAX_BODY_BYTES, parseContactSubmission } from '../../../lib/contact.mjs'

export const runtime = 'nodejs'
const noStore = { 'Cache-Control': 'no-store' }
const fail = (status: number) => NextResponse.json({ ok: false }, { status, headers: noStore })

export async function POST(request: NextRequest) {
  // Reject non-site origins. Never trust a browser-supplied URL inside the message.
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')
  if (!origin || !host) return fail(403)
  try {
    const url = new URL(origin)
    if (url.host !== host || !['https:', 'http:'].includes(url.protocol)) return fail(403)
    if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') return fail(403)
  } catch { return fail(403) }
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return fail(415)
  if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) return fail(413)

  let body = ''
  try {
    // Limit streamed bodies too; content-length can be absent or false.
    const reader = request.body?.getReader()
    if (!reader) return fail(400)
    const chunks: Uint8Array[] = []
    let length = 0
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > MAX_BODY_BYTES) { await reader.cancel(); return fail(413) }
      chunks.push(value)
    }
    body = new TextDecoder().decode(Buffer.concat(chunks.map(c => Buffer.from(c))))
  } catch { return fail(400) }
  let data: unknown
  try { data = JSON.parse(body) } catch { return fail(400) }
  const enquiry = parseContactSubmission(data)
  if (!enquiry) return fail(400)
  if (enquiry.spam) return NextResponse.json({ ok: true }, { headers: noStore })

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!token || !chatId || !/^\d{6,15}:[A-Za-z0-9_-]{20,}$/.test(token) || !/^-?\d{5,20}$/.test(chatId)) {
    console.error('Gate One contact service is not configured')
    return fail(503)
  }
  try {
    const response = await fetch('https://api.telegram.org/bot' + token + '/sendMessage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text: formatTelegramMessage(enquiry), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
      cache: 'no-store',
    })
    if (!response.ok) { console.error('Gate One Telegram delivery failure: ', response.status); return fail(502) }
    return NextResponse.json({ ok: true }, { headers: noStore })
  } catch {
    console.error('Gate One Telegram service unavailable')
    return fail(502)
  }
}
export const GET = () => fail(405)
