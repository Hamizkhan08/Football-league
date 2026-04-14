import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

export function useLiveMatch(matchId) {
  const [match, setMatch]         = useState(null)
  const [goals, setGoals]         = useState([])
  const [cards, setCards]         = useState([])
  const [lineups, setLineups]     = useState([])
  const [players, setPlayers]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [updating, setUpdating]   = useState(false)

  // Fetch initial match data + goals + cards + lineups + players
  const fetchMatch = useCallback(async () => {
    if (!matchId) return
    setLoading(true)
    const [matchRes, goalsRes, cardsRes, lineupsRes] = await Promise.all([
      supabase.from('matches').select(`
        *,
        team_a:team_a_id(id, name, logo_url),
        team_b:team_b_id(id, name, logo_url)
      `).eq('id', matchId).single(),
      supabase.from('goals').select(`
        *,
        player:player_id(id, name, jersey_no),
        team:team_id(id, name)
      `).eq('match_id', matchId).order('minute'),
      supabase.from('match_cards').select(`
        *,
        player:player_id(id, name, jersey_no),
        team:team_id(id, name)
      `).eq('match_id', matchId).order('minute'),
      supabase.from('match_lineups').select(`
        *,
        player:player_id(id, name, jersey_no, position, image_url)
      `).eq('match_id', matchId),
    ])

    if (matchRes.data) {
      setMatch(matchRes.data)
      // Fetch players from both teams
      const { data: pData } = await supabase
        .from('players')
        .select('*')
        .in('team_id', [matchRes.data.team_a_id, matchRes.data.team_b_id])
        .order('name')
      setPlayers(pData || [])
    }
    if (goalsRes.data) setGoals(goalsRes.data)
    if (cardsRes.data) setCards(cardsRes.data)
    if (lineupsRes.data) setLineups(lineupsRes.data)
    setLoading(false)
  }, [matchId])

  useEffect(() => {
    fetchMatch()
  }, [fetchMatch])

  // Realtime subscription for match updates
  useEffect(() => {
    if (!matchId) return

    const matchSub = supabase
      .channel(`match-${matchId}`)
      .on('postgres_changes', {
        event: 'UPDATE', schema: 'public', table: 'matches',
        filter: `id=eq.${matchId}`
      }, payload => {
        setMatch(prev => ({ ...prev, ...payload.new }))
      })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'goals',
        filter: `match_id=eq.${matchId}`
      }, () => {
        fetchMatch()
      })
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'match_cards',
        filter: `match_id=eq.${matchId}`
      }, () => {
        fetchMatch()
      })
      .on('postgres_changes', {
        event: '*', schema: 'public', table: 'match_lineups',
        filter: `match_id=eq.${matchId}`
      }, () => {
        fetchMatch()
      })
      .subscribe()

    return () => { supabase.removeChannel(matchSub) }
  }, [matchId, fetchMatch])

  // Add a goal
  const addGoal = async (playerId, teamId, minute) => {
    if (!match) return
    setUpdating(true)
    const isTeamA = teamId === match.team_a_id

    // Insert goal record
    const { error: goalError } = await supabase.from('goals').insert({
      match_id: matchId, player_id: playerId, team_id: teamId, minute,
    })
    if (goalError) { toast.error('Failed to record goal'); setUpdating(false); return }

    // Update match score
    const scoreKey = isTeamA ? 'score_a' : 'score_b'
    const newScore = (isTeamA ? match.score_a : match.score_b) + 1
    await supabase.from('matches').update({ [scoreKey]: newScore }).eq('id', matchId)

    // Update player goals count
    const player = players.find(p => p.id === playerId)
    if (player) {
      await supabase.from('players').update({ goals: (player.goals || 0) + 1 }).eq('id', playerId)
    }

    toast.success('⚽ Goal recorded!')
    setUpdating(false)
  }

  // Add a card
  const addCard = async (playerId, teamId, cardType, minute) => {
    if (!match) return
    setUpdating(true)
    const { error } = await supabase.from('match_cards').insert({
      match_id: matchId, player_id: playerId, team_id: teamId,
      card_type: cardType, minute: minute || 1,
    })
    if (error) toast.error('Failed to record card')
    else {
      // Also increment fouls counter on match
      const isTeamA = teamId === match.team_a_id
      const foulKey = isTeamA ? 'fouls_a' : 'fouls_b'
      const newFouls = (isTeamA ? match.fouls_a : match.fouls_b) + 1
      await supabase.from('matches').update({ [foulKey]: newFouls }).eq('id', matchId)
      toast.success(`${cardType === 'yellow' ? '🟨' : '🟥'} Card recorded!`)
    }
    setUpdating(false)
  }

  // Add a foul (legacy, still works)
  const addFoul = async (teamId) => {
    if (!match) return
    setUpdating(true)
    const isTeamA = teamId === match.team_a_id
    const foulKey = isTeamA ? 'fouls_a' : 'fouls_b'
    const newFouls = (isTeamA ? match.fouls_a : match.fouls_b) + 1
    const { error } = await supabase.from('matches').update({ [foulKey]: newFouls }).eq('id', matchId)
    if (error) toast.error('Failed to record foul')
    else {
      setMatch(prev => ({ ...prev, [foulKey]: newFouls }))
      toast.success('Foul recorded')
    }
    setUpdating(false)
  }

  // Set lineup (array of { player_id, is_starter })
  const setMatchLineup = async (teamId, selectedPlayers) => {
    if (!match) return
    setUpdating(true)
    
    // Delete existing lineups for this team in this match
    const existingIds = lineups
      .filter(l => players.find(p => p.id === l.player_id && p.team_id === teamId))
      .map(l => l.id)
    
    if (existingIds.length > 0) {
      await supabase.from('match_lineups').delete().in('id', existingIds)
    }

    // Insert new lineups
    const rows = selectedPlayers.map(sp => ({
      match_id: matchId,
      player_id: sp.player_id,
      is_starter: sp.is_starter,
    }))
    
    const { error } = await supabase.from('match_lineups').insert(rows)
    if (error) toast.error('Failed to set lineup')
    else toast.success('✅ Lineup saved!')
    setUpdating(false)
  }

  // Start match
  const startMatch = async () => {
    setUpdating(true)
    const { error } = await supabase.from('matches').update({ status: 'live' }).eq('id', matchId)
    if (error) toast.error('Failed to start match')
    else {
      setMatch(prev => ({ ...prev, status: 'live' }))
      toast.success('🟢 Match started!')
      // Increment matches_played for lineup players
      const lineupPlayerIds = lineups.map(l => l.player_id)
      for (const pid of lineupPlayerIds) {
        const p = players.find(pl => pl.id === pid)
        if (p) {
          await supabase.from('players').update({ matches_played: (p.matches_played || 0) + 1 }).eq('id', pid)
        }
      }
    }
    setUpdating(false)
  }

  // End match
  const endMatch = async () => {
    setUpdating(true)
    const { error } = await supabase.from('matches').update({ status: 'completed' }).eq('id', matchId)
    if (error) toast.error('Failed to end match')
    else {
      setMatch(prev => ({ ...prev, status: 'completed' }))
      toast.success('✅ Match completed!')
    }
    setUpdating(false)
  }

  // Update penalties (for knockouts)
  const updatePenalties = async (pA, pB) => {
    if (!match) return
    setUpdating(true)
    const { error } = await supabase.from('matches').update({
      penalty_score_a: parseInt(pA) || 0,
      penalty_score_b: parseInt(pB) || 0
    }).eq('id', matchId)
    
    if (error) toast.error('Failed to update penalty scores')
    else toast.success('Penalty scores updated')
    setUpdating(false)
  }

  return { match, goals, cards, lineups, players, loading, updating, addGoal, addCard, addFoul, setMatchLineup, startMatch, endMatch, updatePenalties, refetch: fetchMatch }
}
