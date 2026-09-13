export type FoodItem = {
  food_name: string
  barcode: string | null
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fibre_g: number | null
}

type OffProduct = {
  product_name?: string
  code?: string
  nutriments?: Record<string, number | undefined>
}

export function parseFoodItem(product: OffProduct, servingGrams: number): FoodItem {
  const f = servingGrams / 100
  const n = product.nutriments ?? {}
  const r1 = (v: number | undefined) => Math.round((v ?? 0) * f * 10) / 10
  return {
    food_name: product.product_name?.trim() || 'Unknown',
    barcode: product.code ?? null,
    calories: Math.round((n['energy-kcal_100g'] ?? 0) * f),
    protein_g: r1(n.proteins_100g),
    carbs_g: r1(n.carbohydrates_100g),
    fat_g: r1(n.fat_100g),
    fibre_g: n.fiber_100g == null ? null : r1(n.fiber_100g),
  }
}

const UA = 'Tracked/0.1 (GLP-1 companion; contact via app)'

export async function searchFood(query: string): Promise<OffProduct[]> {
  const url = `https://uk.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,code,nutriments`
  const res = await fetch(url, { headers: { 'User-Agent': UA } })
  const data = await res.json()
  return data.products ?? []
}

export async function lookupBarcode(barcode: string): Promise<OffProduct | null> {
  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json?fields=product_name,code,nutriments`, { headers: { 'User-Agent': UA } })
  const data = await res.json()
  return data.status === 1 ? data.product : null
}
