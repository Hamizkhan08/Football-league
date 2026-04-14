import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Trophy, Settings, Activity, Save, RefreshCw, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import { computeStandings } from '../../utils/standings'

export default function TournamentSettings() {
  const [settings, setSettings] = useState(null)
  const [teams, setTeams] = useState([])
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [settingsRes, teamsRes, matchesRes] = await Promise.all([
      supabase.from('tournament_settings').select('*').single(),
      supabase.from('teams').select('*'),
      supabase.from('matches').select('*, team_a:team_a_id(name), team_b:team_b_id(name)')
    ])

    if (settingsRes.data) setSettings(settingsRes.data)
    setTeams(teamsRes.data || [])
    setMatches(matchesRes.data || [])
    setLoading(false)
  }

  async function updateSettings(updates) {
    const { error } = await supabase.from('tournament_settings').update(updates).eq('id', settings.id)
    if (error) toast.error(error.message)
    else {
      setSettings({ ...settings, ...updates })
      toast.success('Settings updated!')
    }
  }

  async function generateKnockouts() {
    if (!confirm('This will finalize the group stage and create the Semi-Final matches based on current standings. Continue?')) return

    setProcessing(true)
    try {
      // Note: We use the utility function to calculate standings
      const calculateStandings = (poolTeams, poolMatches) => {
        return poolTeams.map(team => {
          const stats = computeStandings(team, poolMatches)
          return { ...team, ...stats }
        }).sort((a,b) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
      }

      const standingsA = calculateStandings(teams.filter(t => t.pool === 'A'), matches.filter(m => m.pool === 'A'))
      const standingsB = calculateStandings(teams.filter(t => t.pool === 'B'), matches.filter(m => m.pool === 'B'))

      const topA = standingsA.slice(0, settings.qualifiers_per_pool)
      const topB = standingsB.slice(0, settings.qualifiers_per_pool)

      if (topA.length < 2 || topB.length < 2) {
        throw new Error(`Insufficient teams qualified. Set qualifiers to at least 2 per pool.`)
      }

      const semiFinals = [
        {
          team_a_id: topA[0].id,
          team_b_id: topB[1].id,
          pool: 'A',
          is_knockout: true,
          match_date: new Date(Date.now() + 86400000).toISOString(),
          status: 'upcoming'
        },
        {
          team_a_id: topB[0].id,
          team_b_id: topA[1].id,
          pool: 'B',
          is_knockout: true,
          match_date: new Date(Date.now() + 90000000).toISOString(),
          status: 'upcoming'
        }
      ]

      const { error } = await supabase.from('matches').insert(semiFinals)
      if (error) throw error

      await updateSettings({ current_stage: 'knockout' })
      toast.success('Semi-Finals generated successfully!')
    } catch (err) {
      toast.error(err.message)
    } finally {
      setProcessing(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="animate-in pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 border-b border-light-gray flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="section-subtitle mb-3">Logic & Brackets</p>
          <h1 className="nike-display text-6xl md:text-8xl uppercase">OPERATIONS</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          {/* Stage Control */}
          <section className="bg-white border border-light-gray flex flex-col">
            <div className="bg-nike-black p-8">
               <div className="flex items-center gap-6">
                 <div className="w-12 h-12 bg-white flex items-center justify-center text-nike-black">
                    <Activity size={24} />
                 </div>
                 <div>
                    <h3 className="nike-headline text-white text-2xl uppercase tracking-tight">Competition Stage</h3>
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-widest">CURRENTLY IN: <span className="text-white">{settings.current_stage} stage</span></p>
                 </div>
               </div>
            </div>

            <div className="p-8 space-y-10 flex-1">
               <div className="space-y-4">
                  <label className="block text-[10px] font-black text-nike-secondary uppercase tracking-widest">QUALIFIERS ENTITLED (PER POOL)</label>
                  <div className="flex items-center gap-6">
                     <input 
                      type="number"
                      min="1"
                      className="w-24 bg-snow border border-light-gray px-4 py-3 text-xl font-black nike-display focus:outline-none focus:border-nike-black"
                      value={settings.qualifiers_per_pool}
                      onChange={(e) => updateSettings({ qualifiers_per_pool: parseInt(e.target.value) })}
                     />
                     <p className="text-[10px] font-black text-nike-secondary uppercase tracking-widest leading-relaxed">
                       Sets the threshold for teams advancing from group to knockout brackets.
                     </p>
                  </div>
               </div>

               <div className="pt-8 border-t border-light-gray">
                 <button 
                  disabled={processing || settings.current_stage === 'knockout'}
                  onClick={generateKnockouts}
                  className={`w-full py-5 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 transition-all ${
                    settings.current_stage === 'knockout'
                    ? 'bg-light-gray text-nike-secondary cursor-not-allowed'
                    : 'bg-nike-black text-white hover:bg-nike-secondary active:scale-[0.98]'
                  }`}
                 >
                    {processing ? <RefreshCw className="animate-spin" /> : <Zap size={18} />}
                    {settings.current_stage === 'knockout' ? 'KNOCKOUTS FINALIZED' : 'GENERATE SEMI-FINAL BRACKETS'}
                 </button>
               </div>
            </div>
          </section>

          {/* Rules Section */}
          <section className="bg-snow border border-light-gray p-8">
             <div className="flex items-center gap-6 mb-8">
                <div className="w-12 h-12 bg-nike-black flex items-center justify-center text-white">
                  <Trophy size={24} />
                </div>
                <h3 className="nike-headline text-3xl uppercase tracking-tight">KNOCKOUT PROTOCOL</h3>
             </div>
             
             <div className="space-y-8">
               <div className="flex gap-6">
                 <span className="nike-display text-4xl text-nike-black/20 shrink-0">01</span>
                 <p className="text-[10px] font-black text-nike-black uppercase tracking-widest leading-relaxed pt-2">
                   Knockout fixtures are decisive. No draws allowed. Penalty shootouts must be registered for all parity results.
                 </p>
               </div>
               <div className="flex gap-6">
                 <span className="nike-display text-4xl text-nike-black/20 shrink-0">02</span>
                 <p className="text-[10px] font-black text-nike-black uppercase tracking-widest leading-relaxed pt-2">
                   Bracket logic follows a Cross-Pool format: [A1 vs B2] and [B1 vs A2].
                 </p>
               </div>
               <div className="flex gap-6">
                 <span className="nike-display text-4xl text-nike-black/20 shrink-0">03</span>
                 <p className="text-[10px] font-black text-nike-black uppercase tracking-widest leading-relaxed pt-2">
                   Advancing winners will be locked for the Grand Final series. Final assignment is currently manual.
                 </p>
               </div>
             </div>
          </section>
        </div>
      </div>
    </div>
  )
}
