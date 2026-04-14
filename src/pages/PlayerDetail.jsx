import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { ArrowLeft, Target, Handshake, Users, Trophy, Hash, Calendar } from 'lucide-react'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { Badge } from '../components/ui/Badge'
import StatCard from '../components/ui/StatCard'

export default function PlayerDetail() {
  const { id } = useParams()
  const [player, setPlayer] = useState(null)
  const [goals, setGoals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlayerData = async () => {
      setLoading(true)
      const [playerRes, goalsRes] = await Promise.all([
        supabase.from('players').select('*, team:team_id(*)').eq('id', id).single(),
        supabase.from('goals').select('*, match:match_id(*, team_a:team_a_id(name), team_b:team_b_id(name))').eq('player_id', id).order('created_at', { ascending: false })
      ])

      if (playerRes.data) setPlayer(playerRes.data)
      if (goalsRes.data) setGoals(goalsRes.data)
      setLoading(false)
    }
    fetchPlayerData()
  }, [id])

  if (loading) return <PageLoader />
  if (!player) return <div className="text-center py-20 text-gray-500">Player not found</div>

  return (
    <div className="space-y-10 animate-in max-w-5xl mx-auto">
      <Link to={`/teams/${player.team_id}`} className="inline-flex items-center gap-2 text-gray-400 hover:text-turf-400 transition-colors text-sm">
        <ArrowLeft size={16} /> Back to Team
      </Link>

      {/* Header Profile */}
      <div className="glass-card p-8 md:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-turf-500/5 rounded-full -mr-32 -mt-32" />
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-dark-700 border-2 border-turf-800 shadow-turf-lg overflow-hidden flex-shrink-0">
            {player.image_url ? (
              <img src={player.image_url} alt={player.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600 bg-dark-800">
                <Users size={64} />
              </div>
            )}
          </div>
          
          <div className="text-center md:text-left">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
              <h1 className="text-4xl font-black text-white">{player.name}</h1>
              <Badge variant={player.team?.pool === 'A' ? 'poolA' : 'poolB'}>Pool {player.team?.pool}</Badge>
              {player.is_captain && <Badge variant="captain">Team Captain</Badge>}
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-4 mb-4 text-gray-400">
              <div className="flex items-center gap-1.5 font-semibold">
                <Hash size={16} className="text-turf-500" />
                <span>Jersey #{player.jersey_no || '00'}</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-700" />
              <div className="flex items-center gap-1.5 font-semibold">
                <Trophy size={16} className="text-gold-400" />
                <span>{player.position}</span>
              </div>
            </div>
            
            <Link to={`/teams/${player.team_id}`} className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-dark-700 hover:bg-dark-600 border border-turf-900/50 transition-all">
               <div className="w-6 h-6 rounded bg-turf-800 flex items-center justify-center text-[10px] font-bold">
                 {player.team?.name.split(' ').map(w=>w[0]).join('')}
               </div>
               <span className="text-sm font-bold text-gray-200">{player.team?.name}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Total Goals" value={player.goals || 0} color="green" />
        <StatCard icon={Hash} label="Jersey #" value={player.jersey_no || '--'} color="nike-black" />
        <StatCard icon={Users} label="Matches" value={player.matches_played || 0} color="purple" />
        <StatCard icon={Trophy} label="Rank" value={1} sub="Wait list" color="gold" />
      </div>

      {/* Goal History */}
      <section>
        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
          <Calendar className="text-turf-500" /> Match History & Goals
        </h2>
        {goals.length === 0 ? (
          <div className="glass-card p-12 text-center text-gray-500 italic">
            No goals recorded for this player yet.
          </div>
        ) : (
          <div className="space-y-4">
            {goals.map((goal, idx) => (
              <div key={goal.id || idx} className="glass-card p-5 flex items-center justify-between border-l-4 border-turf-600">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-turf-400 font-bold text-sm">⚽ {goal.minute}' Minute</span>
                  </div>
                  <h3 className="text-white font-semibold">
                    {goal.match?.team_a?.name} vs {goal.match?.team_b?.name}
                  </h3>
                </div>
                <div className="text-right">
                   <p className="text-gray-500 text-xs font-mono">
                     {new Date(goal.match?.match_date || goal.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                   </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
