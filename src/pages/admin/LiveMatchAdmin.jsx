import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Settings, Info } from 'lucide-react'
import { useLiveMatch } from '../../hooks/useLiveMatch'
import LiveMatchControl from '../../components/match/LiveMatchControl'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function LiveMatchAdmin() {
  const { id } = useParams()
  const { 
    match, 
    players, 
    lineups, 
    loading, 
    updating, 
    addGoal, 
    addCard, 
    addFoul, 
    setMatchLineup, 
    startMatch, 
    endMatch, 
    updatePenalties 
  } = useLiveMatch(id)

  if (loading) return <PageLoader />
  if (!match) return (
    <div className="text-center py-20">
      <p className="text-nike-secondary mb-4 uppercase font-black">Match Not Found</p>
      <Link to="/admin/matches" className="btn-secondary">Back to Fixtures</Link>
    </div>
  )

  return (
    <div className="animate-in pb-20">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-6 py-10 border-b border-light-gray flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <Link to="/admin/matches" className="inline-flex items-center gap-2 text-nike-secondary hover:text-nike-black transition-colors text-[10px] font-black uppercase tracking-widest mb-4">
            <ArrowLeft size={14} /> Back to Fixtures
          </Link>
          <h1 className="nike-display text-4xl italic uppercase">Match Control</h1>
          <p className="text-[10px] font-black text-nike-secondary uppercase tracking-widest mt-2">
            {match.team_a?.name} vs {match.team_b?.name}
          </p>
        </div>
        <div className={`px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] border-2 ${
          match.status === 'live' ? 'bg-nike-red border-nike-red text-white animate-pulse' : 
          match.status === 'completed' ? 'bg-nike-black border-nike-black text-white' : 
          'bg-snow border-light-gray text-nike-secondary'
        }`}>
          Status: {match.status}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-nike-black text-white p-6 mb-8 flex items-start gap-4">
           <div className="bg-white/10 p-3"><Info size={20} className="text-nike-blue" /></div>
           <div>
             <h3 className="text-xs font-black uppercase tracking-widest mb-1">Live Management Mode</h3>
             <p className="text-[10px] text-white/50 leading-relaxed uppercase tracking-tight">
               Manage lineups, score goals, and track discipline from this panel. Changes are pushed live to the match detail page immediately.
             </p>
           </div>
        </div>

        <div className="bg-white border-2 border-nike-black p-8 shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]">
          <LiveMatchControl
            match={match}
            players={players}
            lineups={lineups}
            onAddGoal={addGoal}
            onAddCard={addCard}
            onAddFoul={addFoul}
            onSetLineup={setMatchLineup}
            onStartMatch={startMatch}
            onEndMatch={endMatch}
            onUpdatePenalties={updatePenalties}
            updating={updating}
          />
        </div>
      </div>
    </div>
  )
}
