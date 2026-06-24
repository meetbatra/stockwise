import { type NextRequest } from 'next/server'
import { fetchNews } from '@/lib/finnhub'
import type { ApiErrorResponse, ApiNewsResponse } from '@/lib/types'

type Params = { ticker: string }

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<Params> },
): Promise<Response> {
  const { ticker } = await params
  const limit = Number(req.nextUrl.searchParams.get('limit') ?? '10')

  try {
    const news = await fetchNews(ticker, limit)
    return Response.json({ news } satisfies ApiNewsResponse)
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Failed to fetch news'
    return Response.json({ error: message } satisfies ApiErrorResponse, {
      status: 500,
    })
  }
}
