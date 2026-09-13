import { formatWeight, parseWeightToKg, formatLength } from '@/lib/units'

describe('units', () => {
  it('formats weight both ways', () => {
    expect(formatWeight(84.6, 'metric')).toBe('84.6 kg')
    expect(formatWeight(84.6, 'imperial')).toBe('13 st 5 lb')
    expect(formatLength(91.4, 'imperial')).toBe('36 in')
  })
  it('parses imperial input', () => {
    expect(parseWeightToKg('13 st 4', 'imperial')).toBeCloseTo(84.37, 1)
    expect(parseWeightToKg('13st4lb', 'imperial')).toBeCloseTo(84.37, 1)
    expect(parseWeightToKg('186', 'imperial')).toBeCloseTo(84.37, 1)
    expect(parseWeightToKg('84.6', 'metric')).toBe(84.6)
    expect(parseWeightToKg('', 'metric')).toBeNull()
  })
})
