import { calculate } from '@/lib/protocol/calculator'

describe('calculate', () => {
  it('10 mg in 2 ml, 0.5 mg dose = 10 units', () => {
    const r = calculate({ vialMg: 10, waterMl: 2, doseMg: 0.5 })
    expect(r.concentrationMgPerMl).toBe(5)
    expect(r.doseMl).toBe(0.1)
    expect(r.units).toBe(10)
    expect(r.dosesPerVial).toBe(20)
    expect(r.steps).toHaveLength(4)
    expect(r.warnings).toEqual([])
  })
  it('warns when the dose is more than one syringe', () => {
    const r = calculate({ vialMg: 5, waterMl: 5, doseMg: 2 })
    expect(r.units).toBe(200)
    expect(r.warnings.some(w => w.includes('more than one full syringe'))).toBe(true)
  })
  it('warns on tiny volumes and fractional units', () => {
    const r = calculate({ vialMg: 10, waterMl: 1, doseMg: 0.25 })
    expect(r.units).toBe(2.5)
    expect(r.warnings.some(w => w.includes('Under 5 units'))).toBe(true)
    expect(r.warnings.some(w => w.includes('whole mark'))).toBe(true)
  })
  it('rejects zero or negative inputs', () => {
    expect(() => calculate({ vialMg: 0, waterMl: 2, doseMg: 1 })).toThrow()
  })
})
