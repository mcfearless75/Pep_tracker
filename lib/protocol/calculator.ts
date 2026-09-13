// Reconstitution and syringe-units calculator. Every step is shown so the
// user can verify it by hand; that verifiability is what keeps a calculator
// like this on the right side of the MHRA software-as-a-medical-device line.
//
// Insulin syringes are graduated in IU (international units) at a fixed
// U-100 scale — 100 units per ml — no matter what size the barrel is. What
// changes between syringe sizes is the barrel's total capacity: a 0.3 ml
// syringe holds 30 units, a 0.5 ml syringe 50 units, a 1 ml syringe 100
// units. Mixing those up (checking a dose against the wrong capacity) is a
// real source of dosing errors, so the two are kept as separate inputs.

export type SyringeSize = '0.3ml' | '0.5ml' | '1ml'

export const SYRINGE_SIZES: { key: SyringeSize; label: string; capacityUnits: number }[] = [
  { key: '0.3ml', label: '0.3 ml (30 IU)', capacityUnits: 30 },
  { key: '0.5ml', label: '0.5 ml (50 IU)', capacityUnits: 50 },
  { key: '1ml', label: '1 ml (100 IU)', capacityUnits: 100 },
]

const UNITS_PER_ML = 100 // fixed by the U-100 insulin scale printed on the barrel

export type CalcInput = {
  vialMg: number              // peptide in the vial
  waterMl: number             // bacteriostatic water added
  doseMg: number              // desired dose
  syringeSize?: SyringeSize   // barrel size, 1 ml by default
}

export type CalcStep = { label: string; working: string; result: string }

export type CalcResult = {
  concentrationMgPerMl: number
  doseMl: number
  units: number
  syringeCapacityUnits: number
  dosesPerVial: number
  steps: CalcStep[]
  warnings: string[]
}

const r = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp

export function calculate(input: CalcInput): CalcResult {
  const { vialMg, waterMl, doseMg } = input
  const size = SYRINGE_SIZES.find(s => s.key === input.syringeSize) ?? SYRINGE_SIZES[2]
  const capacity = size.capacityUnits
  const warnings: string[] = []

  if (!(vialMg > 0) || !(waterMl > 0) || !(doseMg > 0)) {
    throw new Error('All three values must be greater than zero.')
  }

  const concentration = vialMg / waterMl
  const doseMl = doseMg / concentration
  const units = doseMl * UNITS_PER_ML
  const dosesPerVial = vialMg / doseMg

  if (doseMg > vialMg) warnings.push('The dose is larger than the whole vial. Check the numbers.')
  if (units > capacity) warnings.push(`That is more than your ${size.label} syringe holds (${capacity} IU). Add more water, use a larger syringe, or split the dose.`)
  if (units < 5) warnings.push('Under 5 IU is hard to measure accurately. Consider adding less water so the dose is a larger volume, or use a 0.3 ml syringe for finer marks.')
  if (units % 1 !== 0) warnings.push(`${r(units)} IU does not land on a whole mark. Round to the nearest mark and note the actual dose.`)

  const steps: CalcStep[] = [
    {
      label: 'Concentration',
      working: `${vialMg} mg ÷ ${waterMl} ml`,
      result: `${r(concentration, 3)} mg per ml`,
    },
    {
      label: 'Volume for your dose',
      working: `${doseMg} mg ÷ ${r(concentration, 3)} mg/ml`,
      result: `${r(doseMl, 3)} ml`,
    },
    {
      label: 'IU on the syringe',
      working: `${r(doseMl, 3)} ml × ${UNITS_PER_ML} IU per ml (U-100 scale)`,
      result: `${r(units, 1)} IU`,
    },
    {
      label: 'Doses in the vial',
      working: `${vialMg} mg ÷ ${doseMg} mg`,
      result: `${r(dosesPerVial, 1)} doses`,
    },
  ]

  return {
    concentrationMgPerMl: r(concentration, 3),
    doseMl: r(doseMl, 3),
    units: r(units, 1),
    syringeCapacityUnits: capacity,
    dosesPerVial: r(dosesPerVial, 1),
    steps,
    warnings,
  }
}
