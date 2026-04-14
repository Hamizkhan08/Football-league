import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { Target, Trophy, Hash } from 'lucide-react'

export default function TopScorers() {
  const [scorers, setScorers] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchScorers = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('players')
        .select('*, team:team_id(id, name, pool)')
        .order('goals', { ascending: false })
        .gt('goals', -1)
      setScorers(data || [])
      setLoading(false)
    }
    fetchScorers()
  }, [])

  if (loading) return <PageLoader />

  const sorted = [...scorers].sort((a, b) => b.goals - a.goals)
  const top = sorted.filter(p => p.goals > 0)
  const others = sorted.filter(p => p.goals === 0)
  const displayed = [...top, ...others].slice(0, 20)

  const MEDAL = ['🥇', '🥈', '🥉']

  return (
    <div className="animate-in pb-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 border-b border-light-gray flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="section-subtitle mb-3">Player Rankings</p>
          <h1 className="nike-display text-5xl md:text-9xl italic leading-none uppercase">Golden Boot</h1>
        </div>
        <div className="max-w-xs">
          <p className="text-[10px] font-black text-nike-secondary uppercase tracking-widest leading-relaxed">
            The chase for the CPL 2026 top scorer. Every goal brings a player closer to legendary status.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 space-y-12">
        
        {/* Top 3 Podium */}
        {displayed.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-2">
            {displayed.slice(0, 3).map((player, idx) => (
              <div key={player.id} className={`p-8 md:p-5 text-center border ${idx === 0 ? 'bg-nike-black text-white border-nike-black shadow-2xl md:scale-105 z-10' : 'bg-light-gray border-light-gray'}`}>
                <div className="text-3xl mb-3">{MEDAL[idx]}</div>
                <div className={`w-14 h-14 mx-auto mb-3 overflow-hidden flex items-center justify-center ${idx === 0 ? 'bg-white/10' : 'bg-white'}`}>
                  {player.image_url ? (
                    <img 
                      src={player.image_url} 
                      alt={player.name} 
                      onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block'; }}
                      className="w-full h-full object-cover" 
                    />
                  ) : null}
                  <span className={`font-black text-sm uppercase ${idx === 0 ? 'text-white' : 'text-nike-black'} ${player.image_url ? 'hidden' : 'block'}`}>
                    {(player.name || "?").split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </span>
                </div>
                <p className={`font-black text-xs md:text-sm uppercase leading-tight ${idx === 0 ? 'text-white' : 'text-nike-black'}`}>{player.name}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span className={`text-[9px] font-black uppercase ${idx === 0 ? 'text-white/40' : 'text-nike-secondary'}`}>#{player.jersey_no || '00'}</span>
                  <p className={`text-[9px] font-bold uppercase ${idx === 0 ? 'text-white/60' : 'text-nike-secondary'}`}>{player.team?.name}</p>
                </div>
                <div className="mt-4">
                  <span className={`text-3xl font-black tabular-nums ${idx === 0 ? 'text-white' : 'text-nike-black'}`}>
                    {player.goals}
                  </span>
                  <span className={`text-[10px] font-black uppercase ml-2 ${idx === 0 ? 'text-white/60' : 'text-nike-secondary'}`}>Goals</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Full Rankings Table */}
        <div className="border border-light-gray overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-nike-black text-white">
                  <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest w-12 text-center">Rank</th>
                  <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest">Player</th>
                  <th className="text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hidden sm:table-cell">Team</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest">MP</th>
                  <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest">Goals</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((player, idx) => (
                  <tr key={player.id} className={`border-b border-light-gray transition-colors ${idx === 0 ? 'bg-snow border-l-4 border-l-nike-black' : 'bg-white hover:bg-snow'}`}>
                    <td className="px-5 py-4 text-center">
                      {idx < 3 && player.goals > 0
                        ? <span className="text-lg">{MEDAL[idx]}</span>
                        : <span className="text-nike-secondary font-bold text-xs">{idx + 1}</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-nike-black overflow-hidden flex-shrink-0 flex items-center justify-center text-white text-[10px] font-black">
                          #{player.jersey_no || '00'}
                        </div>
                        <div>
                          <span className="text-nike-black font-bold uppercase text-xs tracking-tight block">{player.name}</span>
                          <span className="text-[9px] font-black text-nike-secondary uppercase tracking-widest">{player.position}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-nike-secondary text-xs font-medium hidden sm:table-cell">
                      <span className="block font-bold text-nike-black">{player.team?.name}</span>
                      <span className="text-[9px] font-black uppercase tracking-tighter opacity-60">Pool {player.team?.pool}</span>
                    </td>
                    <td className="px-4 py-4 text-center text-nike-secondary font-bold tabular-nums text-xs">{player.matches_played}</td>
                    <td className="px-4 py-4 text-center">
                       <span className="text-nike-black font-black text-base tabular-nums">{player.goals}</span>
                    </td>
                  </tr>
                ))}
                {displayed.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-nike-secondary font-black uppercase tracking-widest text-xs">No stats yet — matches need to be played</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

