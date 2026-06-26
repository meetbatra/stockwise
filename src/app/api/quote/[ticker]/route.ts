import { type NextRequest, NextResponse } from 'next/server'
import { fetchQuote } from '@/lib/yahoo-fetch'

type Params = { ticker: string }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> },
): Promise<Response> {
  const { ticker } = await params

  try {
    const meta = await fetchQuote(ticker)
    if (!meta) {
      return NextResponse.json({ error: 'Quote not found' }, { status: 404 })
    }
    return NextResponse.json(meta)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}
