import { useState, useEffect, useCallback } from 'react'
import { playersApi } from '../services/api'

export function usePlayers(options = {}) {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState(null)

  const fetchPlayers = useCallback(async (params = {}) => {
    try {
      setLoading(true)
      setError(null)
      const response = await playersApi.getAll({ ...options, ...params })
      setPlayers(response.players)
      setPagination(response.pagination)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [options])

  useEffect(() => {
    fetchPlayers()
  }, [fetchPlayers])

  return { players, loading, error, pagination, refetch: fetchPlayers }
}

export function usePlayer(id) {
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPlayer = useCallback(async () => {
    if (!id) {
      setPlayer(null)
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await playersApi.getById(id)
      setPlayer(response)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchPlayer()
  }, [fetchPlayer])

  return { player, loading, error, refetch: fetchPlayer }
}

export function usePlayerSearch() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  const search = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setResults([])
      return
    }

    try {
      setLoading(true)
      const response = await playersApi.search(query)
      setResults(response)
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  return { results, loading, search }
}
