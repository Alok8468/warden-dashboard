import { useEffect, useState, useRef } from 'react'

export default function CountUp({ value, duration = 1500, decimals = 0 }) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef(null)

  useEffect(() => {
    const target = typeof value === 'number' ? value : 0
    if (target === 0) { setDisplayed(0); return }

    const start = Date.now()
    const startVal = 0

    const tick = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = startVal + (target - startVal) * eased
      setDisplayed(decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current))
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick)
      }
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current) }
  }, [value, duration, decimals])

  return <>{decimals > 0 ? displayed.toFixed(decimals) : displayed}</>
}
