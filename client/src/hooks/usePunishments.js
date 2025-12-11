import { useState, useEffect, useCallback } from 'react'
import { punishmentsApi } from '../services/api'

export function usePunishments(options = {}) {
  const [punishments, setPunishments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const fetchPunishments = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await punishmentsApi.getAll({ ...options, ...params })
      setPunishments(response.punishments)
      setPagination(response.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [options])

  useEffect(() => {
    fetchPunishments()
  }, [fetchPunishments])

  const createPunishment = async (data) => {
    try {
      const response = await punishmentsApi.create(data)
      await fetchPunishments()
      return response
    } catch (err) {
      throw err
    }
  }

  const revokePunishment = async (id, reason) => {
    try {
      await punishmentsApi.revoke(id, reason)
      await fetchPunishments()
    } catch (err) {
      throw err
    }
  }

  return { 
    punishments, 
    loading, 
    error, 
    pagination, 
    refetch: fetchPunishments,
    createPunishment,
    revokePunishment,
  }
}

export function useActivePunishments() {
  const [punishments, setPunishments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchActive = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await punishmentsApi.getActive()
      setPunishments(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchActive()
  }, [fetchActive])

  return { punishments, loading, error, refetch: fetchActive }
}

export function usePunishmentStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await punishmentsApi.getStats()
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
