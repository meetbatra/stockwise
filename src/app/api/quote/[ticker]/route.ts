import { type NextRequest, NextResponse } from 'next/server'
import { fetchChartMeta } from '@/lib/yahoo'

type Params = { ticker: string }

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<Params> },
): Promise<Response> {
  const { ticker } = await params

  try {
    const meta = await fetchChartMeta(ticker)
    return NextResponse.json(meta)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch quote' }, { status: 500 })
  }
}
