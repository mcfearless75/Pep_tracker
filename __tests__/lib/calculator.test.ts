import { calculate, SYRINGE_SIZES } from '@/lib/protocol/calculator'

describe('calculate', () => {
  it('10 mg in 2 ml, 0.5 mg dose = 10 IU on the default 1 ml syringe', () => {
    const r = calculate({ vialMg: 10, waterMl: 2, doseMg: 0.5 })
    expect(r.concentrationMgPerMl).toBe(5)
    expect(r.doseMl).toBe(0.1)
    expect(r.units).toBe(10)
    expect(r.syringeCapacityUnits).toBe(100)
    expect(r.dosesPerVial).toBe(20)
    expect(r.steps).toHaveLength(4)
    expect(r.warnings).toEqual([])
  })
  it('warns when the dose is more than the syringe holds', () => {
    const r = calculate({ vialMg: 5, waterMl: 5, doseMg: 2 })
    expect(r.units).toBe(200)
    expect(r.warnings.some(w => w.includes('more than your'))).toBe(true)
  })
  it('warns on tiny volumes and fractional units', () => {
    const r = calculate({ vialMg: 10, waterMl: 1, doseMg: 0.25 })
    expect(r.units).toBe(2.5)
    expect(r.warnings.some(w => w.includes('Under 5 IU'))).toBe(true)
    expect(r.warnings.some(w => w.includes('whole mark'))).toBe(true)
  })
  it('rejects zero or negative inputs', () => {
    expect(() => calculate({ vialMg: 0, waterMl: 2, doseMg: 1 })).toThrow()
  })

  describe('IU is fixed at U-100 regardless of syringe size', () => {
    it('the same dose reads the same IU on every barrel size', () => {
      const readings = SYRINGE_SIZES.map(s => calculate({ vialMg: 10, waterMl: 2, doseMg: 0.5, syringeSize: s.key }).units)
      expect(readings).toEqual([10, 10, 10])
    })
  })

  it('a dose that fits a 1 ml syringe can overflow a 0.3 ml syringe', () => {
    // 20 IU fits inside a 30 IU (0.3 ml) barrel with room to spare...
    const small = calculate({ vialMg: 10, waterMl: 2, doseMg: 1, syringeSize: '0.3ml' })
    expect(small.units).toBe(20)
    expect(small.syringeCapacityUnits).toBe(30)
    expect(small.warnings.some(w => w.includes('more than your'))).toBe(false)

    // ...but 40 IU does not.
    const overflow = calculate({ vialMg: 10, waterMl: 2, doseMg: 2, syringeSize: '0.3ml' })
    expect(overflow.units).toBe(40)
    expect(overflow.warnings.some(w => w.includes('0.3 ml') && w.includes('30 IU'))).toBe(true)
  })

  it('capacity matches the labelled size for each option', () => {
    expect(SYRINGE_SIZES.map(s => s.capacityUnits)).toEqual([30, 50, 100])
  })

  it('an unrecognised syringe size falls back to 1 ml', () => {
    // @ts-expect-error deliberately invalid input, e.g. from bad persisted state
    const r = calculate({ vialMg: 10, waterMl: 2, doseMg: 0.5, syringeSize: 'bogus' })
    expect(r.syringeCapacityUnits).toBe(100)
  })
})
