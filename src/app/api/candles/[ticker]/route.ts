import { type NextRequest } from 'next/server'
import { fetchCandles } from '@/lib/finnhub'
import type { ApiCandlesResponse, ApiErrorResponse } from '@/lib/types'

type Params = { ticker: string }
type Resolution = '1' | '5' | '15' | '30' | '60' | 'D' | 'W' | 'M'
const VALID_RESOLUTIONS: Resolution[] = ['1', '5', '15', '30', '60', 'D', 'W', 'M']

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> },
): Promise<Response> {
  const { ticker } = await params
  const { searchParams } = req.nextUrl

  const rawRes = searchParams.get('resolution') ?? 'D'
  const resolution: Resolution = (VALID_RESOLUTIONS as string[]).includes(rawRes)
    ? (rawRes as Resolution)
    : 'D'

  const from = searchParams.has('from') ? Number(searchParams.get('from')) : undefined
  const to = searchParams.has('to') ? Number(searchParams.get('to')) : undefined

  try {
    const candles = await fetchCandles(ticker, resolution, from, to)
    return Response.json({ candles } satisfies ApiCandlesResponse)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch candles'
    return Response.json({ error: message } satisfies ApiErrorResponse, {
      status: 500,
    })
  }
}
