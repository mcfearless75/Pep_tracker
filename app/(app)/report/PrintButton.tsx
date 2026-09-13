'use client'

export function PrintButton() {
  return <button type="button" onClick={() => window.print()} className="rounded-chip bg-accent text-accent-ink px-4 py-2 text-sm font-bold">Save as PDF</button>
}
