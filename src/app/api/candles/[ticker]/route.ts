import { type NextRequest, NextResponse } from 'next/server'
import { fetchCandles } from '@/lib/yahoo-fetch'

type Params = { ticker: string }

const DEFAULT_INTERVAL = '1d'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> },
): Promise<Response> {
  const { ticker } = await params
  const { searchParams } = req.nextUrl

  const now = Math.floor(Date.now() / 1000)
  const from = searchParams.has('from')
    ? Number(searchParams.get('from'))
    : now - 130 * 24 * 60 * 60 // ~130 calendar days ≈ 90 trading days
  const to = searchParams.has('to') ? Number(searchParams.get('to')) : now
  const interval = searchParams.get('interval') ?? DEFAULT_INTERVAL

  try {
    const candles = await fetchCandles(ticker, from, to, interval)
    return NextResponse.json(candles)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch candles' }, { status: 500 })
  }
}
