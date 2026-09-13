// Reconstitution and syringe-units calculator. Every step is shown so the
// user can verify it by hand; that verifiability is what keeps a calculator
// like this on the right side of the MHRA software-as-a-medical-device line.

export type CalcInput = {
  vialMg: number          // peptide in the vial
  waterMl: number         // bacteriostatic water added
  doseMg: number          // desired dose
  syringeUnits?: number   // units on the syringe, U-100 by default
}

export type CalcStep = { label: string; working: string; result: string }

export type CalcResult = {
  concentrationMgPerMl: number
  doseMl: number
  units: number
  dosesPerVial: number
  steps: CalcStep[]
  warnings: string[]
}

const r = (n: number, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp

export function calculate(input: CalcInput): CalcResult {
  const { vialMg, waterMl, doseMg } = input
  const syringeUnits = input.syringeUnits ?? 100
  const warnings: string[] = []

  if (!(vialMg > 0) || !(waterMl > 0) || !(doseMg > 0)) {
    throw new Error('All three values must be greater than zero.')
  }

  const concentration = vialMg / waterMl
  const doseMl = doseMg / concentration
  const units = doseMl * syringeUnits
  const dosesPerVial = vialMg / doseMg

  if (doseMg > vialMg) warnings.push('The dose is larger than the whole vial. Check the numbers.')
  if (units > syringeUnits) warnings.push(`That is more than one full syringe (${syringeUnits} units). Add more water or use a larger syringe.`)
  if (units < 5) warnings.push('Under 5 units is hard to measure accurately. Consider adding less water so the dose is a larger volume.')
  if (units % 1 !== 0) warnings.push(`${r(units)} units does not land on a whole mark. Round to the nearest mark and note the actual dose.`)

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
      label: 'Syringe units',
      working: `${r(doseMl, 3)} ml × ${syringeUnits} units per ml`,
      result: `${r(units, 1)} units`,
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
    dosesPerVial: r(dosesPerVial, 1),
    steps,
    warnings,
  }
}
