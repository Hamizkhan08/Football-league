import { Link } from 'react-router-dom'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { Badge } from '../ui/Badge'

const STATUS_VARIANT = { upcoming: 'upcoming', live: 'live', completed: 'completed' }

function TeamScore({ team, score, side }) {
  const initials = team?.name?.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '??'
  return (
    <div className={`flex items-center gap-3 ${side === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      <div className="w-10 h-10 bg-light-gray flex items-center justify-center text-nike-black font-black text-sm flex-shrink-0 overflow-hidden">
        {team?.logo_url ? <img src={team.logo_url} alt={team.name} className="w-full h-full object-cover" /> : initials}
      </div>
      <div className={side === 'right' ? 'text-right' : ''}>
        <p className="text-nike-black font-black text-sm uppercase leading-tight">{team?.name || 'TBD'}</p>
        <p className="text-nike-secondary text-[10px] font-bold uppercase tracking-widest">Team</p>
      </div>
    </div>
  )
}

export default function MatchCard({ match }) {
  const isScored = match.status === 'completed' || match.status === 'live'
  const date = match.match_date ? new Date(match.match_date) : null

  return (
    <Link to={`/match/${match.id}`} className="block group">
      <div className={`bg-white hover:bg-snow transition-colors duration-200 border-l-4 ${match.status === 'live' ? 'border-l-nike-red' : 'border-l-nike-black'} p-5`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Badge variant={match.pool === 'A' ? 'poolA' : 'poolB'}>Pool {match.pool}</Badge>
            <Badge variant={STATUS_VARIANT[match.status] || 'upcoming'}>{match.status}</Badge>
            {match.is_knockout && <Badge variant="gold">KO</Badge>}
          </div>
          {date && (
            <div className="flex items-center gap-1.5 text-nike-secondary text-[10px] font-bold uppercase tracking-wider">
              <Calendar size={10} />
              <span>{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
              <Clock size={10} className="ml-1" />
              <span>{date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>

        {/* Teams & Score */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <TeamScore team={match.team_a} score={isScored ? match.score_a : null} side="left" />
          </div>

          <div className="flex flex-col items-center px-2 flex-shrink-0">
            {isScored ? (
              <div className="bg-nike-black text-white px-4 py-2 flex items-center gap-2">
                <span className="text-2xl font-black tabular-nums">{match.score_a}</span>
                <span className="text-nike-secondary font-black">—</span>
                <span className="text-2xl font-black tabular-nums">{match.score_b}</span>
              </div>
            ) : (
              <div className="bg-light-gray px-4 py-2">
                <span className="text-nike-black text-sm font-black uppercase tracking-widest">VS</span>
              </div>
            )}
          </div>

          <div className="flex-1 flex justify-end">
            <TeamScore team={match.team_b} score={isScored ? match.score_b : null} side="right" />
          </div>
        </div>

        {/* Fouls row */}
        {isScored && (match.fouls_a > 0 || match.fouls_b > 0) && (
          <div className="mt-4 flex justify-between text-[10px] text-nike-secondary font-bold uppercase tracking-widest border-t border-light-gray pt-3">
            <span>🟨 {match.fouls_a} fouls</span>
            <span>{match.fouls_b} fouls 🟨</span>
          </div>
        )}

        {/* View Details CTA */}
        <div className="mt-4 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-nike-black group-hover:gap-2 transition-all border-t border-light-gray pt-3">
          Match Details <ArrowRight size={12} className="stroke-[2.5px]" />
        </div>
      </div>
    </Link>
  )
}
