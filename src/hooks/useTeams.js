import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useTeams(pool = null) {
  const [teams, setTeams]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true)
      let query = supabase.from('teams').select('*').order('name')
      if (pool) query = query.eq('pool', pool)
      const { data, error } = await query
      if (error) setError(error.message)
      else setTeams(data || [])
      setLoading(false)
    }
    fetchTeams()
  }, [pool])

  return { teams, loading, error }
}

export function useTeam(id) {
  const [team, setTeam]       = useState(null)
  const [players, setPlayers] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!id) return
    const fetch = async () => {
      setLoading(true)
      const [teamRes, playersRes, matchesRes] = await Promise.all([
        supabase.from('teams').select('*').eq('id', id).single(),
        supabase.from('players').select('*').eq('team_id', id).order('is_captain', { ascending: false }),
        supabase.from('matches').select('*, team_a:team_a_id(*), team_b:team_b_id(*)').or(`team_a_id.eq.${id},team_b_id.eq.${id}`).order('match_date', { ascending: false })
      ])
      
      if (teamRes.error) setError(teamRes.error.message)
      else {
        setTeam(teamRes.data)
        setPlayers(playersRes.data || [])
        setMatches(matchesRes.data || [])
      }
      setLoading(false)
    }
    fetch()
  }, [id])

  return { team, players, matches, loading, error }
}
