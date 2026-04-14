import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ArrowLeft, Clock, Users, Settings } from 'lucide-react'
import { useLiveMatch } from '../hooks/useLiveMatch'
import { useAuth } from '../context/AuthContext'
import LiveMatchControl from '../components/match/LiveMatchControl'
import GoalEvent from '../components/match/GoalEvent'
import { Badge } from '../components/ui/Badge'
import { PageLoader } from '../components/ui/LoadingSpinner'

function useTimer(isLive) {
  const [seconds, setSeconds] = useState(0)
  useEffect(() => {
    if (!isLive) return
    const id = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(id)
  }, [isLive])
  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')
  return `${mm}:${ss}`
}

function ScoreBoard({ match, timer }) {
  const teamA = match.team_a
  const teamB = match.team_b
  const initA = teamA?.name?.split(' ').slice(0,2).map(w=>w[0]).join('')
  const initB = teamB?.name?.split(' ').slice(0,2).map(w=>w[0]).join('')

  return (
    <div className={`glass-card p-6 md:p-8 border ${match.status === 'live' ? 'border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)]' : ''}`}>
      <div className="flex items-center justify-center gap-2 mb-6">
        <Badge variant={match.status === 'live' ? 'live' : match.status === 'completed' ? 'completed' : 'upcoming'}>
          {match.status}
        </Badge>
        <Badge variant={match.pool === 'A' ? 'poolA' : 'poolB'}>Pool {match.pool}</Badge>
        {match.is_knockout && <Badge variant="gold">Knockout</Badge>}
      </div>

      <div className="grid grid-cols-3 items-center gap-4">
        {/* Team A */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-turf-700 to-turf-900 flex items-center justify-center text-white font-black text-xl border border-turf-600/40 mx-auto mb-3 shadow-turf overflow-hidden">
            {teamA?.logo_url ? <img src={teamA.logo_url} alt={teamA.name} className="w-full h-full object-cover" /> : initA}
          </div>
          <h3 className="text-white font-bold text-base leading-tight">{teamA?.name}</h3>
          <p className="text-gray-500 text-xs mt-1">🟨 {match.fouls_a} fouls</p>
        </div>

        {/* Score */}
        <div className="text-center">
          {match.status === 'live' && (
            <div className="flex items-center justify-center gap-1 text-red-400 text-xs font-semibold mb-2">
              <Clock size={12} /> {timer}
            </div>
          )}
          <div className="bg-dark-700 border border-turf-900/50 rounded-2xl px-4 py-3 relative overflow-hidden">
            {match.is_knockout && (
              <div className="absolute top-0 left-0 right-0 bg-gold-500/10 text-[8px] font-black uppercase text-gold-400 py-0.5 tracking-tighter">
                Knockout
              </div>
            )}
            <div className="flex items-center justify-center gap-3">
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-white tabular-nums">{match.score_a ?? 0}</span>
                {match.penalty_score_a !== null && match.penalty_score_a !== undefined && (
                  <span className="text-sm font-black text-gold-500">({match.penalty_score_a})</span>
                )}
              </div>
              <span className="text-2xl text-gray-600 font-bold">—</span>
              <div className="flex flex-col items-center">
                <span className="text-5xl font-black text-white tabular-nums">{match.score_b ?? 0}</span>
                {match.penalty_score_b !== null && match.penalty_score_b !== undefined && (
                  <span className="text-sm font-black text-gold-500">({match.penalty_score_b})</span>
                )}
              </div>
            </div>
          </div>
          {match.status === 'upcoming' && (
            <p className="text-gray-500 text-xs mt-2">
              {match.match_date ? new Date(match.match_date).toLocaleString('en-IN', { day:'numeric', month:'short', hour:'2-digit', minute:'2-digit' }) : 'TBD'}
            </p>
          )}
        </div>

        {/* Team B */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pitch-700 to-pitch-900 flex items-center justify-center text-white font-black text-xl border border-pitch-600/40 mx-auto mb-3 shadow-turf overflow-hidden">
            {teamB?.logo_url ? <img src={teamB.logo_url} alt={teamB.name} className="w-full h-full object-cover" /> : initB}
          </div>
          <h3 className="text-white font-bold text-base leading-tight">{teamB?.name}</h3>
          <p className="text-gray-500 text-xs mt-1">🟨 {match.fouls_b} fouls</p>
        </div>
      </div>
    </div>
  )
}

/** Squad lineup panel for a single team */
function SquadPanel({ team, teamPlayers, lineups, goals, cards, isStarter }) {
  // Filter by starter/sub
  const lineupForTeam = lineups.filter(l => {
    const p = teamPlayers.find(tp => tp.id === l.player_id)
    return p && l.is_starter === isStarter
  })

  if (lineupForTeam.length === 0) return null

  return (
    <div className="space-y-1">
      {lineupForTeam.map(l => {
        const player = teamPlayers.find(p => p.id === l.player_id)
        if (!player) return null
        
        const playerGoals = goals.filter(g => g.player_id === player.id)
        const playerCards = cards.filter(c => c.player_id === player.id)
        
        return (
          <div key={l.id} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-dark-700/40 transition-colors group">
            {/* Jersey */}
            <span className="text-[10px] font-black text-gray-600 w-5 text-center tabular-nums">
              {player.jersey_no}
            </span>
            
            {/* Player avatar */}
            <div className="w-7 h-7 rounded-full bg-dark-700 border border-turf-900/30 overflow-hidden flex-shrink-0 flex items-center justify-center text-[10px] font-bold text-gray-500">
              {player.image_url 
                ? <img src={player.image_url} alt="" className="w-full h-full object-cover" />
                : player.name[0]}
            </div>
            
            {/* Name + Position */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white font-medium truncate leading-tight">
                {player.name}
                {player.is_captain && <span className="text-gold-400 text-[9px] ml-1 font-black">(C)</span>}
              </p>
              <p className="text-[10px] text-gray-600 leading-tight">{player.position}</p>
            </div>
            
            {/* Event icons */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              {playerGoals.map((g, i) => (
                <span key={i} className="text-xs" title={`Goal ${g.minute}'`}>⚽</span>
              ))}
              {playerCards.map((c, i) => (
                <span key={i} className="text-xs" title={`${c.card_type} card ${c.minute}'`}>
                  {c.card_type === 'yellow' ? '🟨' : '🟥'}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function LiveMatchDetail() {
  const { id } = useParams()
  const { isAuthenticated, isAdmin } = useAuth()
  const { match, goals, cards, lineups, players, loading, updating, addGoal, addCard, addFoul, setMatchLineup, startMatch, endMatch, updatePenalties } = useLiveMatch(id)
  const timer = useTimer(match?.status === 'live')

  if (loading) return <PageLoader />
  if (!match)  return (
    <div className="text-center py-16">
      <p className="text-gray-500 mb-4">Match not found</p>
      <Link to="/schedule" className="btn-secondary">← Back to Schedule</Link>
    </div>
  )

  const teamAPlayers = players.filter(p => p.team_id === match.team_a_id)
  const teamBPlayers = players.filter(p => p.team_id === match.team_b_id)
  const teamAGoals = goals.filter(g => g.team_id === match.team_a_id)
  const teamBGoals = goals.filter(g => g.team_id === match.team_b_id)
  const hasLineups = lineups.length > 0

  return (
    <div className="space-y-6 animate-in max-w-4xl mx-auto">
      <Link to="/schedule" className="inline-flex items-center gap-2 text-gray-400 hover:text-turf-400 transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Schedule
      </Link>

      {/* Scoreboard */}
      <ScoreBoard match={match} timer={timer} />

      {/* Squad Lineups */}
      {hasLineups && (
        <div className="grid md:grid-cols-2 gap-4">
          {/* Team A Squad */}
          <div className="glass-card p-4">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2 border-b border-turf-900/30 pb-2">
              <Users size={14} className="text-turf-400" />
              {match.team_a?.name} — Starting 5
            </h3>
            <SquadPanel team={match.team_a} teamPlayers={teamAPlayers} lineups={lineups} goals={goals} cards={cards} isStarter={true} />
            
            {/* Substitutes */}
            <div className="mt-3 pt-3 border-t border-turf-900/20">
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2">Substitutes</p>
              <SquadPanel team={match.team_a} teamPlayers={teamAPlayers} lineups={lineups} goals={goals} cards={cards} isStarter={false} />
            </div>
          </div>

          {/* Team B Squad */}
          <div className="glass-card p-4">
            <h3 className="text-white font-bold text-sm mb-3 flex items-center gap-2 border-b border-turf-900/30 pb-2">
              <Users size={14} className="text-turf-400" />
              {match.team_b?.name} — Starting 5
            </h3>
            <SquadPanel team={match.team_b} teamPlayers={teamBPlayers} lineups={lineups} goals={goals} cards={cards} isStarter={true} />
            
            {/* Substitutes */}
            <div className="mt-3 pt-3 border-t border-turf-900/20">
              <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest mb-2">Substitutes</p>
              <SquadPanel team={match.team_b} teamPlayers={teamBPlayers} lineups={lineups} goals={goals} cards={cards} isStarter={false} />
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Goal Timeline */}
        <div className="glass-card p-5">
          <h3 className="text-white font-bold text-base mb-4 flex items-center gap-2">
            <span>⚽</span> Goal Timeline
          </h3>
          {goals.length === 0 ? (
            <p className="text-gray-600 text-sm text-center py-4">No goals yet</p>
          ) : (
            <div className="space-y-1">
              {goals.map(g => (
                <GoalEvent key={g.id} goal={g} isRight={g.team_id === match.team_b_id} />
              ))}
            </div>
          )}
        </div>

        {/* Info or Admin Redirect */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-5">
             <h3 className="text-white font-bold text-sm mb-2 flex items-center gap-2">
               <Users size={14} className="text-turf-400" /> Match Info
             </h3>
             <p className="text-gray-500 text-xs leading-relaxed">
               Lineups are locked once the match begins. Goals are recorded live by the tournament officials.
             </p>
          </div>

          {isAdmin && (
            <Link 
              to={`/admin/matches/${id}/control`}
              className="bg-nike-blue text-white p-6 flex items-center justify-between group hover:bg-nike-black transition-all"
            >
              <div>
                <h3 className="nike-headline text-lg italic uppercase leading-none">Manage Match</h3>
                <p className="text-[10px] font-black uppercase text-white/50 mt-1 tracking-widest">Open Admin Panel</p>
              </div>
              <Settings className="group-hover:rotate-90 transition-transform" />
            </Link>
          )}
        </div>
      </div>

      {/* Team-wise goal breakdown */}
      {goals.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {[{team: match.team_a, goals: teamAGoals}, {team: match.team_b, goals: teamBGoals}].map(({team, goals: tg}) => (
            <div key={team?.id} className="glass-card p-4">
              <p className="text-white font-semibold text-sm mb-3">{team?.name}</p>
              {tg.length === 0
                ? <p className="text-gray-600 text-xs">No goals</p>
                : tg.map(g => (
                    <div key={g.id} className="flex items-center gap-2 py-1">
                      <span className="text-sm">⚽</span>
                      <span className="text-gray-300 text-xs">{g.player?.name}</span>
                      <span className="text-gray-600 text-xs ml-auto">{g.minute}'</span>
                    </div>
                  ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
