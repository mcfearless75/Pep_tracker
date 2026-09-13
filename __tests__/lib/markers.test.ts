import { markerByKey, rangeStatus, rangeLabel } from '@/lib/bloodwork/markers'

describe('bloodwork markers', () => {
  it('flags high, low and in range', () => {
    const hba1c = markerByKey('hba1c')!
    expect(rangeStatus(hba1c, 39)).toBe('in_range')
    expect(rangeStatus(hba1c, 48)).toBe('high')
    const vitd = markerByKey('vit_d')!
    expect(rangeStatus(vitd, 30)).toBe('low')
    expect(rangeStatus(undefined, 1)).toBe('unknown')
  })
  it('describes ranges in words', () => {
    expect(rangeLabel(markerByKey('tsh')!)).toBe('0.4 to 4 mU/L')
    expect(rangeLabel(markerByKey('vit_d')!)).toBe('over 50 nmol/L')
    expect(rangeLabel(markerByKey('crp')!)).toBe('under 5 mg/L')
  })
})
