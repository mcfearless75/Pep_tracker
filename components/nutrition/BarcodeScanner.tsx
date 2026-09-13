'use client'

import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { parseFoodItem, type FoodItem } from '@/lib/openFoodFacts'

type Props = { onResult: (item: FoodItem) => void; onClose: () => void }

export function BarcodeScanner({ onResult, onClose }: Props) {
  const started = useRef(false)
  const scannerRef = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(null)
  const [status, setStatus] = useState<'loading' | 'scanning' | 'error'>('loading')
  const [error, setError] = useState('')

  useEffect(() => {
    if (started.current) return
    started.current = true
    let cancelled = false
    ;(async () => {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelled) return
        const scanner = new Html5Qrcode('barcode-reader-live')
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 280, height: 180 } },
          async (decoded: string) => {
            try { await scanner.stop() } catch {}
            try { scanner.clear() } catch {}
            const res = await fetch(`/api/food/search?barcode=${encodeURIComponent(decoded)}`)
            const products = await res.json()
            if (products[0]) onResult(parseFoodItem(products[0], 100))
            else { setError(`Barcode ${decoded} is not in the database. Search by name instead.`); setStatus('error'); return }
            onClose()
          },
          () => {},
        )
        setStatus('scanning')
      } catch (err) {
        const msg = (err as Error)?.message ?? String(err)
        setError(/permission|denied/i.test(msg) ? 'Camera permission denied. Enable it in settings and try again.' : /notfound|no camera/i.test(msg) ? 'No camera found on this device.' : msg)
        setStatus('error')
      }
    })()
    return () => {
      cancelled = true
      scannerRef.current?.stop().catch(() => {})
    }
  }, [onResult, onClose])

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-black/70 text-white safe-top">
        <h2 className="font-semibold">Scan barcode</h2>
        <button onClick={onClose} className="rounded-full bg-white/10 p-2" aria-label="Close"><X size={18} /></button>
      </div>
      <div className="relative flex-1 flex items-center justify-center">
        <div id="barcode-reader-live" className="w-full h-full" />
        {status === 'loading' && <p className="absolute text-white text-sm">Requesting camera…</p>}
        {status === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center bg-black">
            <p className="font-semibold mb-2">Camera unavailable</p>
            <p className="text-sm text-white/80 mb-4">{error}</p>
            <button onClick={onClose} className="rounded-chip bg-white/10 px-4 py-2 text-sm">Close</button>
          </div>
        )}
        {status === 'scanning' && <div className="pointer-events-none absolute w-72 h-44 border-2 border-white/50 rounded-chip" />}
      </div>
      {status === 'scanning' && <p className="bg-black/70 text-white/80 text-sm text-center py-3 safe-bottom">Line the barcode up inside the frame</p>}
    </div>
  )
}
