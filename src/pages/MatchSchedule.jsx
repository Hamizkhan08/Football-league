import { useState } from 'react'
import { useMatches } from '../hooks/useMatches'
import MatchCard from '../components/match/MatchCard'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { Calendar, Search, Filter } from 'lucide-react'

export default function MatchSchedule() {
  const { matches, loading, error } = useMatches()
  const [filter, setFilter]         = useState('all')
  const [search, setSearch]         = useState('')

  if (loading) return <PageLoader />
  if (error)   return <div className="text-nike-red font-bold text-center py-12 uppercase tracking-widest">Error: {error}</div>

  const filtered = matches.filter(m => {
    // Stage/Status filter
    const matchesFilter = filter === 'all' 
      || (filter === 'pool-a' && m.pool === 'A')
      || (filter === 'pool-b' && m.pool === 'B')
      || (m.status === filter)

    // Search filter
    const matchesSearch = !search 
      || m.team_a?.name?.toLowerCase()?.includes(search.toLowerCase())
      || m.team_b?.name?.toLowerCase()?.includes(search.toLowerCase())

    return matchesFilter && matchesSearch
  })

  const poolAMatches = filtered.filter(m => m.pool === 'A')
  const poolBMatches = filtered.filter(m => m.pool === 'B')

  const FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'pool-a',    label: 'Pool A' },
    { key: 'pool-b',    label: 'Pool B' },
    { key: 'live',      label: '🔴 Live' },
    { key: 'completed', label: 'Completed' },
  ]

  return (
    <div className="animate-in pb-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 border-b border-light-gray flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <p className="section-subtitle mb-3">Tournament Timings</p>
          <h1 className="nike-display text-7xl md:text-9xl italic leading-none uppercase">Schedule</h1>
        </div>
        <div className="flex flex-col gap-4">
           {/* Search Bar */}
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-light-gray group-focus-within:text-nike-black transition-colors" size={18} />
              <input 
                type="text"
                placeholder="Find a Team..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border-2 border-light-gray px-12 py-4 w-full md:w-80 text-xs font-black uppercase tracking-widest focus:outline-none focus:border-nike-black transition-all"
              />
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 space-y-12">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                  filter === f.key
                    ? 'bg-nike-black border-nike-black text-white'
                    : 'bg-white border-light-gray text-nike-secondary hover:border-nike-black hover:text-nike-black'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="text-[10px] font-black text-nike-secondary uppercase tracking-widest italic">
            Found {filtered.length} matches
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-snow p-24 text-center border-2 border-dashed border-light-gray">
            <Calendar size={48} className="text-light-gray mx-auto mb-4" />
            <p className="nike-headline text-nike-secondary text-base uppercase">No matches found</p>
            <p className="text-[10px] text-nike-secondary/50 font-black uppercase mt-2 italic">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="space-y-20">
            {poolAMatches.length > 0 && (
              <section className="animate-in slide-in-from-bottom-4">
                <div className="flex items-center gap-6 mb-8">
                  <h2 className="nike-headline text-4xl uppercase shrink-0">Pool A</h2>
                  <div className="h-px bg-light-gray flex-1"></div>
                  <span className="text-[10px] font-black text-nike-secondary uppercase tracking-widest">{poolAMatches.length} fixtures</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {poolAMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </section>
            )}
            {poolBMatches.length > 0 && (
              <section className="animate-in slide-in-from-bottom-8">
                <div className="flex items-center gap-6 mb-8">
                  <h2 className="nike-headline text-4xl uppercase shrink-0">Pool B</h2>
                  <div className="h-px bg-light-gray flex-1"></div>
                  <span className="text-[10px] font-black text-nike-secondary uppercase tracking-widest">{poolBMatches.length} fixtures</span>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  {poolBMatches.map(m => <MatchCard key={m.id} match={m} />)}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

