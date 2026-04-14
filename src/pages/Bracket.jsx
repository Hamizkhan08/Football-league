import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Trophy, ChevronRight } from 'lucide-react'
import { computeStandings } from '../utils/standings'

export default function Bracket() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [liveQualifiers, setLiveQualifiers] = useState({ sf1: [null, null], sf2: [null, null] })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const [knockoutRes, groupRes, teamsRes] = await Promise.all([
        supabase.from('matches').select('*').eq('is_knockout', true).order('match_date', { ascending: true }),
        supabase.from('matches').select('*').eq('is_knockout', false),
        supabase.from('teams').select('*')
      ])
      
      const rawKMatches = knockoutRes.data || []
      const rawGMatches = groupRes.data || []
      const allTeams    = teamsRes.data || []

      const teamMap = {}
      allTeams.forEach(t => { if (t && t.id) teamMap[t.id] = t })

      const processedKMatches = rawKMatches.map(m => ({
        ...m,
        team_a: teamMap[m.team_a_id] || null,
        team_b: teamMap[m.team_b_id] || null
      }))

      setMatches(processedKMatches)

      if (processedKMatches.length === 0 && allTeams.length > 0) {
        const standingsA = computeStandings(allTeams.filter(t => t?.pool === 'A'), rawGMatches.filter(m => m?.pool === 'A')) || []
        const standingsB = computeStandings(allTeams.filter(t => t?.pool === 'B'), rawGMatches.filter(m => m?.pool === 'B')) || []
        
        setLiveQualifiers({
          sf1: [standingsA[0]?.team || null, standingsB[1]?.team || null], 
          sf2: [standingsB[0]?.team || null, standingsA[1]?.team || null]
        })
      }
    } catch (err) {
      console.error("Critical Knockout Error:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-nike-black text-white flex items-center justify-center font-black uppercase tracking-[0.5em] animate-pulse">
      Loading Tournament Data...
    </div>
  )

  const sf1 = (matches || []).find(m => m.knockout_round === 'sf' && (m.team_a?.pool === 'A' || m.team_b?.pool === 'A')) || null
  const sf2 = (matches || []).find(m => m.knockout_round === 'sf' && (m.team_a?.pool === 'B' || m.team_b?.pool === 'B')) || null
  const finalMatch = (matches || []).find(m => m.knockout_round === 'final') || null
  const thirdPlaceMatch = (matches || []).find(m => m.knockout_round === '3rd') || null

  return (
    <div className="animate-in pb-20 overflow-x-hidden bg-white">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 border-b border-light-gray flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <p className="text-nike-secondary text-[10px] font-black uppercase tracking-[0.3em] mb-2">Championship Path</p>
          <h1 className="nike-display text-6xl md:text-9xl italic uppercase leading-none">KNOCKOUT</h1>
        </div>
        {matches.length === 0 && (
          <div className="flex items-center gap-3 bg-nike-black text-white px-6 py-4">
             <div className="w-2 h-2 rounded-full bg-nike-red animate-pulse"></div>
             <span className="text-[10px] font-black uppercase tracking-widest">Live Projected Bracket</span>
          </div>
        )}
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-0 items-center">
          
          <div className="space-y-12">
            <h2 className="text-xl font-nike font-black text-nike-secondary mb-8 border-b border-light-gray pb-2 uppercase tracking-tight">Semi-Finals</h2>
            <Card match={sf1} label="Semi-Final 1" tbdA="A1 Winner" tbdB="B2 Runner-up" lq={sf1 ? null : liveQualifiers?.sf1} />
            <div className="h-4 hidden lg:block"></div>
            <Card match={sf2} label="Semi-Final 2" tbdA="B1 Winner" tbdB="A2 Runner-up" lq={sf2 ? null : liveQualifiers?.sf2} />
          </div>

          <div className="hidden lg:flex flex-col items-center justify-center h-full px-4 pt-16">
             <div className="w-px h-32 bg-light-gray"></div>
             <div className="w-16 h-px bg-light-gray"></div>
             <div className="w-px h-32 bg-light-gray"></div>
          </div>

          <div className="lg:col-span-1 space-y-16">
            <div className="space-y-12">
              <h2 className="text-xl font-nike font-black text-nike-black mb-8 border-b border-nike-black pb-2 uppercase tracking-tight">Grand Finale</h2>
              <Card match={finalMatch} isFinal label="The Championship" tbdA="SF1 Winner" tbdB="SF2 Winner" />
            </div>

            <div className="pt-12 border-t border-light-gray">
               <h2 className="text-xl font-nike font-black text-nike-secondary mb-8 border-b border-light-gray pb-2 uppercase tracking-tight text-center">Third Place Playoff</h2>
               <div className="max-w-xs mx-auto text-center">
                <Card match={thirdPlaceMatch} label="Bronze Medal Match" tbdA="SF1 Loser" tbdB="SF2 Loser" />
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Card({ match, label, tbdA, tbdB, lq, isFinal = false }) {
  const winner = !match || match.status !== 'completed' ? null : 
    (match.score_a > match.score_b || match.penalty_score_a > match.penalty_score_b ? 'a' : 'b')

  const safeLQ = Array.isArray(lq) ? lq : [null, null]
  const teamA = match?.team_a || safeLQ[0]
  const teamB = match?.team_b || safeLQ[1]

  return (
    <div className={`relative ${isFinal ? 'lg:scale-125 lg:translate-x-4 z-10' : ''}`}>
      <div className={`border-2 ${isFinal ? 'border-nike-black shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]' : 'border-light-gray'} bg-white`}>
        <div className={`px-4 py-2 flex items-center justify-between ${isFinal ? 'bg-nike-black text-white' : 'bg-snow text-nike-secondary'}`}>
          <span className="text-[9px] font-black uppercase tracking-widest">{label}</span>
          {match?.status === 'live' && <span className="text-[8px] font-black text-nike-red animate-pulse">LIVE</span>}
        </div>

        <div className="divide-y divide-light-gray">
          <Row team={teamA} score={match?.score_a} pens={match?.penalty_score_a} win={winner === 'a'} ph={tbdA} proj={!match && !!teamA} />
          <Row team={teamB} score={match?.score_b} pens={match?.penalty_score_b} win={winner === 'b'} ph={tbdB} proj={!match && !!teamB} />
        </div>

        {match?.match_date && (
          <div className="bg-snow px-4 py-2 border-t border-light-gray flex justify-between items-center text-[8px] font-bold text-nike-secondary uppercase">
             <span>{new Date(match.match_date).toLocaleDateString()} • {new Date(match.match_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
             <ChevronRight size={10} />
          </div>
        )}
      </div>
      {isFinal && winner && <div className="absolute -top-12 left-1/2 -track-x-1/2 animate-bounce"><Trophy size={40} className="text-nike-black" /></div>}
    </div>
  )
}

function Row({ team, score, pens, win, ph, proj }) {
  const initials = (team?.name || "?").split(' ').slice(0, 2).map(w => w ? w[0] : "").join('').toUpperCase() || "?"
  return (
    <div className={`flex items-center justify-between px-6 py-5 ${win ? 'bg-nike-black text-white' : 'bg-white text-nike-black'} ${!team ? 'opacity-30' : ''}`}>
      <div className="flex items-center gap-4 min-w-0">
        <div className={`w-10 h-10 ${win ? 'bg-white/20' : 'bg-snow'} border border-light-gray flex items-center justify-center shrink-0`}>
           {team?.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover" /> : <span className="text-[10px] font-black opacity-20">{initials}</span>}
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-nike font-black uppercase leading-none truncate">{team?.name || ph}</span>
          {proj && <span className="text-[7px] font-black text-nike-blue uppercase tracking-widest mt-1">Projected</span>}
        </div>
      </div>
      {score !== undefined && !ph && (
        <div className="flex items-center gap-2 font-nike font-black text-3xl pt-1">
          {pens > 0 && <span className="text-[10px] opacity-50">({pens})</span>}
          {score}
        </div>
      )}
    </div>
  )
}


