import { type NextRequest, NextResponse } from 'next/server'
import { fetchNews } from '@/lib/finnhub'

type Params = { ticker: string }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> },
): Promise<Response> {
  const { ticker } = await params

  // fetchNews always returns [] on missing key or any error — never throws
  const news = await fetchNews(ticker)
  return NextResponse.json(news)
}
