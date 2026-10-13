import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { resolveLocale } from '../lib/site.mjs'

export default async function Page({ searchParams }: {
  searchParams: Promise<{ lang?: string | string[] }>
}) {
  const query = await searchParams
  const remembered = (await cookies()).get('gateone-language')?.value
  redirect('/' + resolveLocale(typeof query.lang === 'string' ? query.lang : null, remembered))
}

