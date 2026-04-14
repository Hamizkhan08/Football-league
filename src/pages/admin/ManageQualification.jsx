import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Trophy, CheckCircle, XCircle, Shield, ArrowRight, UserCheck } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import { computeStandings } from '../../utils/standings'

export default function ManageQualification() {
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [teamsRes, matchesRes] = await Promise.all([
      supabase.from('teams').select('*').order('name'),
      supabase.from('matches').select('*')
    ])
    setTeams(teamsRes.data || [])
    setMatches(matchesRes.data || [])
    setLoading(false)
  }

  async function toggleQualification(teamId, currentStatus) {
    setUpdating(teamId)
    const { error } = await supabase
      .from('teams')
      .update({ is_qualified: !currentStatus })
      .eq('id', teamId)

    if (error) {
      toast.error(error.message)
    } else {
      setTeams(prev => prev.map(t => t.id === teamId ? { ...t, is_qualified: !currentStatus } : t))
      toast.success(`Team ${!currentStatus ? 'Promoted' : 'Demoted'}`)
    }
    setUpdating(null)
  }

  if (loading) return <PageLoader />

  const poolA = computeStandings(teams.filter(t => t.pool === 'A'), matches)
  const poolB = computeStandings(teams.filter(t => t.pool === 'B'), matches)

  const PoolTable = ({ title, teamsData }) => (
    <div className="border border-light-gray bg-white overflow-hidden shadow-sm">
      <div className="bg-nike-black px-8 py-5 flex items-center justify-between">
        <h2 className="nike-headline text-white text-xl uppercase italic tracking-tight">{title}</h2>
        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">{teamsData.length} Teams</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-snow border-b border-light-gray">
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-nike-secondary">Rank</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-nike-secondary">Team</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-nike-secondary text-center">PTS</th>
              <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-nike-secondary text-center">GD</th>
              <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-nike-secondary text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-light-gray">
            {teamsData.map((row, idx) => (
              <tr key={row.team.id} className={`hover:bg-snow/50 transition-colors ${row.team.is_qualified ? 'bg-nike-blue/5' : ''}`}>
                <td className="px-8 py-6">
                  <span className={`w-8 h-8 flex items-center justify-center text-xs font-black ${idx < 3 ? 'bg-nike-black text-white' : 'text-nike-secondary'}`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="px-6 py-6">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-snow border border-light-gray rounded-sm overflow-hidden flex-shrink-0">
                       {row.team.logo_url && <img src={row.team.logo_url} className="w-full h-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-black text-sm uppercase tracking-tight">{row.team.name}</p>
                      <p className="text-[9px] font-bold text-nike-secondary uppercase tracking-widest">Captain: {row.team.captain_name}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-6 text-center font-black text-sm">{row.pts}</td>
                <td className="px-6 py-6 text-center font-black text-sm text-nike-secondary italic">{row.gd > 0 ? `+${row.gd}` : row.gd}</td>
                <td className="px-8 py-6 text-right">
                  <button
                    onClick={() => toggleQualification(row.team.id, row.team.is_qualified)}
                    disabled={updating === row.team.id}
                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest border-2 transition-all ${
                      row.team.is_qualified
                        ? 'bg-nike-red border-nike-red text-white hover:bg-white hover:text-nike-red'
                        : 'bg-white border-nike-black text-nike-black hover:bg-nike-black hover:text-white'
                    }`}
                  >
                    {updating === row.team.id ? (
                      <span className="flex items-center gap-2">Processing...</span>
                    ) : row.team.is_qualified ? (
                      <span className="flex items-center gap-2 justify-end text-right"><XCircle size={14} /> Remove</span>
                    ) : (
                      <span className="flex items-center gap-2 justify-end text-right"><UserCheck size={14} /> Qualify</span>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )

  return (
    <div className="animate-in pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 border-b border-light-gray flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="section-subtitle mb-3">Playoff Eligibility</p>
          <h1 className="nike-display text-7xl md:text-9xl italic leading-none uppercase">Promotion</h1>
        </div>
        <div className="max-w-md">
           <p className="text-[10px] font-black text-nike-secondary uppercase tracking-widest leading-relaxed">
             Manual qualification override. Review the standings below and promote teams to the knockout bracket. Promoted teams will appear in the "Knockout Fixtures" scheduler.
           </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 space-y-16">
        <PoolTable title="Pool A Standings" teamsData={poolA} />
        <PoolTable title="Pool B Standings" teamsData={poolB} />
        
        {/* Footer info */}
        <div className="bg-snow p-8 border border-light-gray flex items-start gap-6">
           <div className="w-12 h-12 bg-nike-black text-white flex items-center justify-center flex-shrink-0">
              <Trophy size={24} />
           </div>
           <div>
              <h3 className="nike-headline text-xl uppercase tracking-tight mb-2">Bracket Logic Note</h3>
              <p className="text-[10px] font-black text-nike-secondary uppercase tracking-widest leading-relaxed">
                Teams promoted here are immediately eligible for Quarter-Final/Semi-Final selection. Ensure you have the correct number of teams (typically 2 or 4 per pool) for a balanced bracket.
              </p>
           </div>
        </div>
      </div>
    </div>
  )
}
