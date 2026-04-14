import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMatches(pool = null, status = null) {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true)
      let query = supabase
        .from('matches')
        .select(`
          *,
          team_a:team_a_id(id, name, logo_url, pool),
          team_b:team_b_id(id, name, logo_url, pool)
        `)
        .order('match_date', { ascending: true })

      if (pool)   query = query.eq('pool', pool)
      if (status) query = query.eq('status', status)

      const { data, error } = await query
      if (error) setError(error.message)
      else setMatches(data || [])
      setLoading(false)
    }

    fetchMatches()
  }, [pool, status])

  return { matches, loading, error, setMatches }
}

export function useAllMatchesWithTeams() {
  const [matches, setMatches] = useState([])
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const [matchRes, teamRes] = await Promise.all([
        supabase.from('matches').select(`
          *,
          team_a:team_a_id(id, name, logo_url),
          team_b:team_b_id(id, name, logo_url)
        `).order('match_date'),
        supabase.from('teams').select('*'),
      ])
      if (matchRes.error) setError(matchRes.error.message)
      else {
        setMatches(matchRes.data || [])
        setTeams(teamRes.data || [])
      }
      setLoading(false)
    }
    fetch()
  }, [])

  return { matches, teams, loading, error }
}
