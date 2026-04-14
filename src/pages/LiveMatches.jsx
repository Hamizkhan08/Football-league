import { useMatches } from '../hooks/useMatches'
import { Link } from 'react-router-dom'
import MatchCard from '../components/match/MatchCard'
import { PageLoader } from '../components/ui/LoadingSpinner'
import { Radio } from 'lucide-react'

export default function LiveMatches() {
  const { matches: live,      loading: l1 } = useMatches(null, 'live')
  const { matches: upcoming,  loading: l2 } = useMatches(null, 'upcoming')

  if (l1 || l2) return <PageLoader />

  return (
    <div className="space-y-10 animate-in">
      <div>
        <p className="section-subtitle mb-1">Real-time</p>
        <h1 className="section-title flex items-center gap-3">
          <span className="live-dot" /> Live Matches
        </h1>
      </div>

      {/* Live now */}
      {live.length > 0 ? (
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Radio size={16} className="text-red-400" />
            <h2 className="text-lg font-bold text-white">Happening Now</h2>
            <span className="bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full text-xs font-semibold animate-pulse">{live.length} LIVE</span>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {live.map(m => (
              <div key={m.id} className="space-y-2">
                <MatchCard match={m} />
                <Link
                  to={`/live/${m.id}`}
                  className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-2.5 rounded-xl transition-all text-sm active:scale-95"
                >
                  <span className="live-dot" /> Open Live Control
                </Link>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <div className="glass-card p-10 text-center">
          <div className="text-5xl mb-4">📡</div>
          <p className="text-gray-400 font-medium mb-1">No matches live right now</p>
          <p className="text-gray-600 text-sm">Check the schedule for upcoming matches</p>
          <Link to="/schedule" className="btn-secondary mt-4 inline-flex items-center gap-2 text-sm">
            View Schedule
          </Link>
        </div>
      )}

      {/* Upcoming matches */}
      {upcoming.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-white mb-4">Upcoming Matches</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {upcoming.slice(0, 6).map(m => (
              <div key={m.id} className="space-y-2">
                <MatchCard match={m} showLink={false} />
                <Link
                  to={`/live/${m.id}`}
                  className="flex items-center justify-center gap-2 btn-secondary text-sm py-2 text-xs"
                >
                  Manage Match
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
