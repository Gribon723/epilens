import { useEffect, useState } from 'react'
import { getIndicatorData, getIndicators } from '../api/indicators'

// Module-level cache so the indicators list is fetched only once per session
let indicatorsCache = null
let indicatorsCachePromise = null

export default function useIndicators() {
  const [indicators, setIndicators] = useState(indicatorsCache ?? [])
  const [loading, setLoading] = useState(!indicatorsCache)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (indicatorsCache) return

    if (!indicatorsCachePromise) {
      indicatorsCachePromise = getIndicators()
    }

    indicatorsCachePromise
      .then((data) => {
        indicatorsCache = data
        setIndicators(data)
      })
      .catch(() => setError('Could not load indicators. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  async function fetchData(code) {
    return getIndicatorData(code)
  }

  return { indicators, loading, error, fetchData }
}
