import { parseFoodItem } from '@/lib/openFoodFacts'

describe('parseFoodItem', () => {
  it('scales per-100g values to the serving', () => {
    const item = parseFoodItem({ product_name: 'Skyr', code: '123', nutriments: { 'energy-kcal_100g': 60, proteins_100g: 11, carbohydrates_100g: 4, fat_100g: 0.2, fiber_100g: 0 } }, 150)
    expect(item).toEqual({ food_name: 'Skyr', barcode: '123', calories: 90, protein_g: 16.5, carbs_g: 6, fat_g: 0.3, fibre_g: 0 })
  })
  it('handles missing fields', () => {
    const item = parseFoodItem({}, 100)
    expect(item.food_name).toBe('Unknown')
    expect(item.fibre_g).toBeNull()
  })
})
