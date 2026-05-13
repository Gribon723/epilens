import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createAnalysis } from '../api/analyses'
import { getAnomalies, getTrend } from '../api/stats'

export default function useAnalysis() {
  const navigate = useNavigate()
  const [trendResult, setTrendResult] = useState(null)
  const [anomalyResult, setAnomalyResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  async function runAnalysis(records, projectYears = 5, windowSize = 5) {
    setLoading(true)
    setError(null)
    try {
      const [trend, anomalies] = await Promise.all([
        getTrend(records, projectYears),
        getAnomalies(records, windowSize),
      ])
      setTrendResult(trend)
      setAnomalyResult(anomalies)
      return { trend, anomalies }
    } catch (e) {
      setError(e.response?.data?.detail ?? 'Analysis failed.')
      return null
    } finally {
      setLoading(false)
    }
  }

  async function saveAnalysis(payload) {
    setSaving(true)
    setError(null)
    try {
      await createAnalysis(payload)
      navigate('/dashboard', { replace: true })
    } catch (e) {
      setError(e.response?.data?.detail ?? 'Could not save analysis.')
    } finally {
      setSaving(false)
    }
  }

  function reset() {
    setTrendResult(null)
    setAnomalyResult(null)
    setError(null)
  }

  return { trendResult, anomalyResult, loading, saving, error, runAnalysis, saveAnalysis, reset }
}
