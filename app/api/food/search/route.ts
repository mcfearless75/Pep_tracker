import { NextResponse } from 'next/server'
import { searchFood, lookupBarcode } from '@/lib/openFoodFacts'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q')
  const barcode = searchParams.get('barcode')
  try {
    if (barcode) {
      const product = await lookupBarcode(barcode)
      return NextResponse.json(product ? [product] : [])
    }
    if (!q || q.length < 2) return NextResponse.json([])
    return NextResponse.json((await searchFood(q)).slice(0, 10))
  } catch {
    return NextResponse.json([])
  }
}
