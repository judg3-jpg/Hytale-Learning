import { useState, useEffect, useCallback } from 'react'
import { dashboardApi } from '../services/api'

export function useDashboardStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardApi.getStats()
      setStats(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refetch: fetchStats }
}

export function useDashboardRecent() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRecent = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await dashboardApi.getRecent()
      setData(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRecent()
  }, [fetchRecent])

  return { data, loading, error, refetch: fetchRecent }
}
