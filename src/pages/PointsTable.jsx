import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAllMatchesWithTeams } from '../hooks/useMatches'
import { computeStandings } from '../utils/standings'
import PoolTable from '../components/points/PoolTable'
import { PageLoader } from '../components/ui/LoadingSpinner'

export default function PointsTable() {
  const { matches, teams, loading, error } = useAllMatchesWithTeams()
  const [activePool, setActivePool] = useState('A')
  const [settings, setSettings] = useState(null)

  useEffect(() => {
    async function fetchSettings() {
      const { data } = await supabase.from('tournament_settings').select('*').single()
      if (data) setSettings(data)
    }
    fetchSettings()
  }, [])

  if (loading) return <PageLoader />
  if (error)   return <div className="text-nike-red font-bold text-center py-12 uppercase tracking-widest">Error: {error}</div>

  const teamsA = teams.filter(t => t.pool === 'A')
  const teamsB = teams.filter(t => t.pool === 'B')
  const matchesA = matches.filter(m => m.pool === 'A' && !m.is_knockout)
  const matchesB = matches.filter(m => m.pool === 'B' && !m.is_knockout)

  const standingsA = computeStandings(teamsA, matchesA)
  const standingsB = computeStandings(teamsB, matchesB)

  const qualifiersCount = settings?.qualifiers_per_pool || 2

  return (
    <div className="animate-in pb-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 border-b border-light-gray">
        <p className="section-subtitle mb-3">League Table</p>
        <h1 className="nike-display text-7xl md:text-9xl">STANDINGS</h1>
        <p className="text-nike-secondary text-sm font-medium mt-4">Sorted by points, then goal difference</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 space-y-16">
        {/* Legend */}
        <div className="flex flex-wrap gap-6 text-[10px] text-nike-secondary font-bold uppercase tracking-widest">
          {[['MP','Matches Played'],['W','Wins'],['D','Draws'],['L','Losses'],['GD','Goal Diff'],['Pts','Points']].map(([k,v])=>(
            <span key={k}><strong className="text-nike-black">{k}</strong> — {v}</span>
          ))}
        </div>

        {/* Mobile tab switcher */}
        <div className="flex border border-light-gray md:hidden">
          {['A','B'].map(pool => (
            <button
              key={pool}
              onClick={() => setActivePool(pool)}
              className={`flex-1 py-4 text-sm font-black uppercase tracking-widest transition-all ${activePool === pool ? 'bg-nike-black text-white' : 'bg-white text-nike-secondary hover:bg-snow'}`}
            >
              Pool {pool}
            </button>
          ))}
        </div>

        {/* Desktop: both tables stacked */}
        <div className="hidden md:flex md:flex-col gap-16">
          <PoolTable standings={standingsA} poolName="A" qualifiersCount={qualifiersCount} />
          <PoolTable standings={standingsB} poolName="B" qualifiersCount={qualifiersCount} />
        </div>

        {/* Mobile: tab-controlled */}
        <div className="md:hidden">
          {activePool === 'A'
            ? <PoolTable standings={standingsA} poolName="A" qualifiersCount={qualifiersCount} />
            : <PoolTable standings={standingsB} poolName="B" qualifiersCount={qualifiersCount} />}
        </div>
      </div>
    </div>
  )
}
