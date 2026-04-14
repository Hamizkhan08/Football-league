import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Shield, Calendar, Trophy, ChevronRight } from 'lucide-react'
import { useTeam } from '../hooks/useTeams'
import { Badge } from '../components/ui/Badge'
import { PageLoader } from '../components/ui/LoadingSpinner'
import PlayerCard from '../components/ui/PlayerCard'
import MatchCard from '../components/match/MatchCard'

export default function TeamDetail() {
  const { id } = useParams()
  const { team, players, matches, loading, error } = useTeam(id)

  if (loading) return <PageLoader />
  if (error || !team) return (
    <div className="text-center py-16 bg-snow min-h-screen">
      <p className="nike-display text-4xl italic uppercase text-nike-black mb-4">Team Not Found</p>
      <Link to="/teams" className="btn-secondary">← Back to Teams</Link>
    </div>
  )

  const initials = team.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
  
  const completedMatches = matches.filter(m => m.status === 'completed')
  const upcomingMatches = matches.filter(m => m.status !== 'completed')

  return (
    <div className="animate-in bg-white min-h-screen pb-24">
      {/* Super Header */}
      <div className="bg-nike-black text-white pt-12 pb-24 px-6 md:px-12 lg:px-20 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <Link to="/teams" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest mb-10">
            <ArrowLeft size={14} /> Back to League Teams
          </Link>
          
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between gap-10">
             <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-24 h-24 md:w-32 md:h-32 bg-white flex items-center justify-center text-nike-black font-black text-4xl overflow-hidden border-4 border-white/10 shadow-2xl">
                  {team.logo_url ? <img src={team.logo_url} alt="" className="w-full h-full object-cover" /> : initials}
                </div>
                <div className="text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-4 mb-2">
                    <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em]">Pool {team.pool || 'A'}</span>
                    <Badge variant="gold">{team.is_qualified ? 'Qualifier' : 'League'}</Badge>
                  </div>
                  <h1 className="nike-display text-5xl md:text-8xl italic uppercase leading-none">{team.name}</h1>
                </div>
             </div>
             
             <div className="bg-white/5 border border-white/10 p-6 flex flex-col items-center md:items-end">
                <span className="text-white/40 text-[10px] font-black uppercase tracking-widest mb-1">Elite Captain</span>
                <span className="nike-headline text-xl text-white uppercase italic leading-none">{team.captain_name || 'TBD'}</span>
             </div>
          </div>
        </div>
        
        {/* Background Accent */}
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none select-none">
           <span className="nike-display text-[20vw] italic uppercase leading-none">{initials}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
          
          {/* Main Content: Squad */}
          <div className="lg:col-span-3 space-y-16">
            <section>
              <div className="flex items-end justify-between mb-8 border-b-2 border-nike-black pb-4">
                <h2 className="nike-display text-4xl italic uppercase">The Squad</h2>
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">{players.length} Registered</span>
              </div>
              
              {players.length === 0 ? (
                <div className="p-20 text-center border-2 border-dashed border-light-gray">
                   <p className="nike-headline text-nike-secondary italic uppercase">No players registered yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {players.map((player) => (
                    <PlayerCard key={player.id} player={player} />
                  ))}
                </div>
              )}
            </section>

            {/* Matches Section for Desktop (Bottom of main) */}
            <div className="hidden lg:block space-y-12 pt-8">
               <div className="grid grid-cols-2 gap-12">
                  <section>
                    <h3 className="nike-display text-2xl uppercase italic mb-6 flex items-center gap-3">
                       <Calendar size={20} className="text-nike-red" /> Upcoming 
                    </h3>
                    <div className="space-y-4">
                      {upcomingMatches.length === 0 ? (
                        <p className="text-[10px] font-black text-nike-secondary uppercase opacity-50">No upcoming fixtures</p>
                      ) : (
                        upcomingMatches.map(m => <MatchCard key={m.id} match={m} />)
                      )}
                    </div>
                  </section>

                  <section>
                    <h3 className="nike-display text-2xl uppercase italic mb-6 flex items-center gap-3">
                       <Trophy size={20} className="text-nike-blue" /> Results 
                    </h3>
                    <div className="space-y-4">
                      {completedMatches.length === 0 ? (
                        <p className="text-[10px] font-black text-nike-secondary uppercase opacity-50">No recent results</p>
                      ) : (
                        completedMatches.map(m => <MatchCard key={m.id} match={m} />)
                      )}
                    </div>
                  </section>
               </div>
            </div>
          </div>

          {/* Sidebar / Mobile Matches */}
          <aside className="lg:col-span-1 space-y-10 block lg:hidden">
             <section className="bg-snow p-8">
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-6 text-nike-secondary border-b border-light-gray pb-2">Matches</h3>
                <div className="space-y-6">
                   {matches.slice(0, 5).map(m => (
                      <Link key={m.id} to={`/match/${m.id}`} className="flex items-center justify-between group">
                         <div>
                            <p className="text-[8px] font-black text-nike-secondary uppercase tracking-widest">{new Date(m.match_date).toLocaleDateString()}</p>
                            <p className="font-nike font-black uppercase text-sm group-hover:underline">VS {m.team_a_id === id ? m.team_b?.name : m.team_a?.name}</p>
                         </div>
                         <div className="text-right">
                            {m.status === 'completed' ? (
                               <span className="font-nike font-black text-nike-red">{m.score_a} - {m.score_b}</span>
                            ) : (
                               <ChevronRight size={14} className="text-light-gray" />
                            )}
                         </div>
                      </Link>
                   ))}
                </div>
             </section>
          </aside>
        </div>
      </div>
    </div>
  )
}
