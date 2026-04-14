import { useTeams } from '../hooks/useTeams'
import TeamCard from '../components/ui/TeamCard'
import { PageLoader } from '../components/ui/LoadingSpinner'

export default function Teams() {
  const { teams, loading, error } = useTeams()

  const poolA = teams.filter(t => t.pool === 'A')
  const poolB = teams.filter(t => t.pool === 'B')

  if (loading) return <PageLoader />
  if (error)   return <div className="text-nike-red font-bold text-center py-12 uppercase tracking-widest">Error: {error}</div>

  return (
    <div className="animate-in pb-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 border-b border-light-gray">
        <p className="section-subtitle mb-3">Season 2026</p>
        <h1 className="nike-display text-7xl md:text-9xl">THE ROSTERS</h1>
        <p className="text-nike-secondary text-sm font-medium mt-4">{teams.length} teams competing across 2 pools</p>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 space-y-20">
        {/* Pool A */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b-2 border-light-gray pb-4">
            <div>
              <p className="section-subtitle mb-2">Group Stage</p>
              <h2 className="nike-headline text-5xl">POOL A</h2>
            </div>
            <span className="text-nike-secondary text-xs font-black uppercase tracking-widest">{poolA.length} Teams</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {poolA.map(team => <TeamCard key={team.id} team={team} />)}
          </div>
        </section>

        <div className="border-t border-light-gray" />

        {/* Pool B */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b-2 border-light-gray pb-4">
            <div>
              <p className="section-subtitle mb-2">Group Stage</p>
              <h2 className="nike-headline text-5xl">POOL B</h2>
            </div>
            <span className="text-nike-secondary text-xs font-black uppercase tracking-widest">{poolB.length} Teams</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {poolB.map(team => <TeamCard key={team.id} team={team} />)}
          </div>
        </section>
      </div>
    </div>
  )
}
