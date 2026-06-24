import { type NextRequest } from 'next/server'
import { fetchQuote } from '@/lib/finnhub'
import type { ApiErrorResponse, ApiQuoteResponse } from '@/lib/types'

type Params = { ticker: string }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> },
): Promise<Response> {
  const { ticker } = await params

  try {
    const quote = await fetchQuote(ticker)
    return Response.json({ quote } satisfies ApiQuoteResponse)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch quote'
    return Response.json({ error: message } satisfies ApiErrorResponse, {
      status: 500,
    })
  }
}
