import { useState } from 'react'
import { Plus, Flag, Square, Play, UserCheck, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LiveMatchControl({ match, players, lineups, onAddGoal, onAddCard, onAddFoul, onSetLineup, onStartMatch, onEndMatch, onUpdatePenalties, updating }) {
  const [selectedPlayer, setSelectedPlayer] = useState('')
  const [goalMinute, setGoalMinute]         = useState('')
  const [cardPlayer, setCardPlayer]         = useState('')
  const [cardType, setCardType]             = useState('yellow')
  const [cardMinute, setCardMinute]         = useState('')
  const [lineupMode, setLineupMode]         = useState(null) // 'A' or 'B' team
  const [selectedLineup, setSelectedLineup] = useState([])

  const teamAPlayers = players.filter(p => p.team_id === match.team_a_id)
  const teamBPlayers = players.filter(p => p.team_id === match.team_b_id)

  // Get lineup players for goal/card dropdowns
  const lineupPlayerIds = lineups.map(l => l.player_id)
  const activeTeamAPlayers = lineupPlayerIds.length > 0
    ? teamAPlayers.filter(p => lineupPlayerIds.includes(p.id))
    : teamAPlayers
  const activeTeamBPlayers = lineupPlayerIds.length > 0
    ? teamBPlayers.filter(p => lineupPlayerIds.includes(p.id))
    : teamBPlayers

  const handleGoal = async () => {
    if (!selectedPlayer) { toast.error('Select a player'); return }
    const player = players.find(p => p.id === selectedPlayer)
    if (!player) return
    const min = parseInt(goalMinute) || 1
    await onAddGoal(player.id, player.team_id, min)
    setSelectedPlayer('')
    setGoalMinute('')
  }

  const handleCard = async () => {
    if (!cardPlayer) { toast.error('Select a player'); return }
    const player = players.find(p => p.id === cardPlayer)
    if (!player) return
    const min = parseInt(cardMinute) || 1
    await onAddCard(player.id, player.team_id, cardType, min)
    setCardPlayer('')
    setCardMinute('')
  }

  // Toggle player in lineup selection
  const toggleLineupPlayer = (playerId, isStarter) => {
    setSelectedLineup(prev => {
      const exists = prev.find(p => p.player_id === playerId)
      if (exists) return prev.filter(p => p.player_id !== playerId)
      return [...prev, { player_id: playerId, is_starter: isStarter }]
    })
  }

  const saveLineup = async () => {
    if (!lineupMode) return
    const teamId = lineupMode === 'A' ? match.team_a_id : match.team_b_id
    const starters = selectedLineup.filter(p => p.is_starter).length
    const subs = selectedLineup.filter(p => !p.is_starter).length
    
    if (starters !== 5) {
      toast.error(`Select exactly 5 starters (currently ${starters})`)
      return
    }
    if (subs > 4) {
      toast.error(`Maximum 4 substitutes allowed (currently ${subs})`)
      return
    }
    
    await onSetLineup(teamId, selectedLineup)
    setLineupMode(null)
    setSelectedLineup([])
  }

  const teamAHasLineup = lineups.some(l => teamAPlayers.find(p => p.id === l.player_id))
  const teamBHasLineup = lineups.some(l => teamBPlayers.find(p => p.id === l.player_id))

  return (
    <div className="space-y-4">
      {/* Lineup Setup (Pre-match) */}
      {match.status === 'upcoming' && (
        <div className="space-y-3">
          <h4 className="text-white font-semibold flex items-center gap-2 text-sm">
            <UserCheck size={14} className="text-turf-400" /> Squad Selection (9 per team)
          </h4>
          
          {!lineupMode ? (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => { setLineupMode('A'); setSelectedLineup([]) }}
                className={`py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex flex-col items-center gap-1 ${
                  teamAHasLineup 
                    ? 'bg-turf-600/20 text-turf-400 border border-turf-600/30' 
                    : 'bg-dark-700 text-gray-400 border border-turf-900/30 hover:border-turf-600/50'
                }`}
              >
                <span>{match.team_a?.name?.split(' ')[0]}</span>
                <span className="text-[10px] opacity-60">{teamAHasLineup ? '✅ Set' : 'Select Squad'}</span>
              </button>
              <button
                onClick={() => { setLineupMode('B'); setSelectedLineup([]) }}
                className={`py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex flex-col items-center gap-1 ${
                  teamBHasLineup 
                    ? 'bg-turf-600/20 text-turf-400 border border-turf-600/30' 
                    : 'bg-dark-700 text-gray-400 border border-turf-900/30 hover:border-turf-600/50'
                }`}
              >
                <span>{match.team_b?.name?.split(' ')[0]}</span>
                <span className="text-[10px] opacity-60">{teamBHasLineup ? '✅ Set' : 'Select Squad'}</span>
              </button>
            </div>
          ) : (
            <div className="glass-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-white font-bold text-sm">
                  {lineupMode === 'A' ? match.team_a?.name : match.team_b?.name}
                </p>
                <button onClick={() => { setLineupMode(null); setSelectedLineup([]) }} className="text-gray-500 text-xs hover:text-red-400">Cancel</button>
              </div>
              
              <p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
                Starters: {selectedLineup.filter(p => p.is_starter).length}/5 · Subs: {selectedLineup.filter(p => !p.is_starter).length}/4
              </p>

              <div className="space-y-1 max-h-64 overflow-y-auto">
                {(lineupMode === 'A' ? teamAPlayers : teamBPlayers).map(p => {
                  const selected = selectedLineup.find(s => s.player_id === p.id)
                  return (
                    <div key={p.id} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                      selected ? (selected.is_starter ? 'bg-turf-600/20 border border-turf-600/30' : 'bg-yellow-500/10 border border-yellow-500/30') : 'hover:bg-dark-700/60'
                    }`}>
                      <span className="text-xs text-gray-500 w-5 text-center">#{p.jersey_no}</span>
                      <span className="text-sm text-white font-medium flex-1">{p.name}</span>
                      <span className="text-[10px] text-gray-600">{p.position}</span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => toggleLineupPlayer(p.id, true)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            selected?.is_starter ? 'bg-turf-600 text-white' : 'bg-dark-700 text-gray-500 hover:text-turf-400'
                          }`}
                        >Start</button>
                        <button 
                          onClick={() => toggleLineupPlayer(p.id, false)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-bold uppercase ${
                            selected && !selected.is_starter ? 'bg-yellow-600 text-white' : 'bg-dark-700 text-gray-500 hover:text-yellow-400'
                          }`}
                        >Sub</button>
                      </div>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={saveLineup}
                disabled={updating}
                className="w-full bg-turf-600 hover:bg-turf-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-xl transition-all active:scale-95 text-sm"
              >
                Save Lineup
              </button>
            </div>
          )}
          
          {/* Start Match */}
          <button
            onClick={onStartMatch}
            disabled={updating || (!teamAHasLineup || !teamBHasLineup)}
            className="w-full flex items-center justify-center gap-2 bg-turf-600 hover:bg-turf-500 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition-all active:scale-95 shadow-turf"
          >
            <Play size={18} fill="white" /> Start Match
          </button>
          {(!teamAHasLineup || !teamBHasLineup) && (
            <p className="text-[10px] text-yellow-500/60 text-center flex items-center justify-center gap-1">
              <AlertTriangle size={10} /> Set both team lineups before starting
            </p>
          )}
        </div>
      )}

      {match.status === 'live' && (
        <>
          {/* Add Goal */}
          <div className="glass-card p-4 space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2 text-sm">
              <span>⚽</span> Record Goal
            </h4>
            <select
              value={selectedPlayer}
              onChange={e => setSelectedPlayer(e.target.value)}
              className="w-full bg-dark-700 border border-turf-900/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-turf-600"
            >
              <option value="">— Select Scorer —</option>
              <optgroup label={match.team_a?.name}>
                {activeTeamAPlayers.map(p => (
                  <option key={p.id} value={p.id}>#{p.jersey_no} {p.name}</option>
                ))}
              </optgroup>
              <optgroup label={match.team_b?.name}>
                {activeTeamBPlayers.map(p => (
                  <option key={p.id} value={p.id}>#{p.jersey_no} {p.name}</option>
                ))}
              </optgroup>
            </select>
            <div className="flex gap-2">
              <input
                type="number"
                min="1" max="60"
                placeholder="Min"
                value={goalMinute}
                onChange={e => setGoalMinute(e.target.value)}
                className="w-20 bg-dark-700 border border-turf-900/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-turf-600"
              />
              <button
                onClick={handleGoal}
                disabled={updating || !selectedPlayer}
                className="flex-1 flex items-center justify-center gap-2 bg-turf-600 hover:bg-turf-500 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg transition-all active:scale-95 text-sm"
              >
                <Plus size={15} /> Add Goal
              </button>
            </div>
          </div>

          {/* Give Card */}
          <div className="glass-card p-4 space-y-3">
            <h4 className="text-white font-semibold flex items-center gap-2 text-sm">
              <span>🟨</span> Give Card
            </h4>
            <select
              value={cardPlayer}
              onChange={e => setCardPlayer(e.target.value)}
              className="w-full bg-dark-700 border border-turf-900/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-turf-600"
            >
              <option value="">— Select Player —</option>
              <optgroup label={match.team_a?.name}>
                {activeTeamAPlayers.map(p => (
                  <option key={p.id} value={p.id}>#{p.jersey_no} {p.name}</option>
                ))}
              </optgroup>
              <optgroup label={match.team_b?.name}>
                {activeTeamBPlayers.map(p => (
                  <option key={p.id} value={p.id}>#{p.jersey_no} {p.name}</option>
                ))}
              </optgroup>
            </select>
            <div className="flex gap-2">
              <select
                value={cardType}
                onChange={e => setCardType(e.target.value)}
                className="bg-dark-700 border border-turf-900/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-turf-600"
              >
                <option value="yellow">🟨 Yellow</option>
                <option value="red">🟥 Red</option>
              </select>
              <input
                type="number"
                min="1" max="60"
                placeholder="Min"
                value={cardMinute}
                onChange={e => setCardMinute(e.target.value)}
                className="w-20 bg-dark-700 border border-turf-900/50 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-turf-600"
              />
              <button
                onClick={handleCard}
                disabled={updating || !cardPlayer}
                className="flex-1 flex items-center justify-center gap-2 bg-yellow-700/30 hover:bg-yellow-700/50 border border-yellow-700/40 disabled:opacity-50 text-yellow-400 font-semibold py-2.5 rounded-lg transition-all active:scale-95 text-sm"
              >
                Give Card
              </button>
            </div>
          </div>

          {/* Knockout Penalty Management */}
          {match.is_knockout && match.score_a === match.score_b && (
            <div className="glass-card p-4 space-y-3 border-t-2 border-gold-500/30">
              <h4 className="text-gold-400 font-semibold flex items-center gap-2 text-sm">
                <span>🏆</span> Penalty Shootout
              </h4>
              <div className="flex items-center gap-3">
                 <div className="flex-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">{match.team_a?.name}</label>
                    <input 
                      type="number" 
                      className="w-full bg-dark-700 border border-turf-900/50 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-gold-500" 
                      placeholder="Pens" 
                      defaultValue={match.penalty_score_a ?? ''} 
                      onChange={(e) => onUpdatePenalties(e.target.value, match.penalty_score_b)}
                    />
                 </div>
                 <span className="text-gray-600 font-bold mt-4">:</span>
                 <div className="flex-1">
                    <label className="text-[10px] text-gray-500 uppercase font-bold">{match.team_b?.name}</label>
                    <input 
                      type="number" 
                      className="w-full bg-dark-700 border border-turf-900/50 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none focus:border-gold-500" 
                      placeholder="Pens" 
                      defaultValue={match.penalty_score_b ?? ''} 
                      onChange={(e) => onUpdatePenalties(match.penalty_score_a, e.target.value)}
                    />
                 </div>
              </div>
            </div>
          )}

          {/* End Match */}
          <button
            onClick={onEndMatch}
            disabled={updating}
            className="w-full flex items-center justify-center gap-2 bg-red-700 hover:bg-red-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all active:scale-95"
          >
            <Square size={16} fill="white" /> End Match
          </button>
        </>
      )}

      {match.status === 'completed' && (
        <div className="text-center py-4 text-turf-400 font-semibold text-sm">
          ✅ Match has ended
        </div>
      )}
    </div>
  )
}
