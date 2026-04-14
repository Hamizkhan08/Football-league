import { Link } from 'react-router-dom'
import { Shield, ArrowRight } from 'lucide-react'
import { Badge } from './Badge'

const TEAM_INITIALS = (name) =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

export default function TeamCard({ team, rank, highlight }) {
  const initials = TEAM_INITIALS(team.name)

  return (
    <Link to={`/teams/${team.id}`} className="block group">
      <div className="bg-white hover:bg-snow transition-colors duration-200 overflow-hidden flex sm:flex-col items-stretch h-[120px] sm:h-auto border border-light-gray sm:border-none">
        
        {/* Team Logo / Image - Left on mobile, Top on desktop */}
        <div className="w-[120px] sm:w-full sm:aspect-square bg-light-gray overflow-hidden relative shrink-0">
          {team.logo_url ? (
            <img 
              src={team.logo_url} 
              alt={team.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-light-gray">
              <span className="font-nike font-black text-4xl sm:text-6xl text-hover-gray uppercase">{initials}</span>
            </div>
          )}
          {/* Pool Badge */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3">
            <Badge variant={team.pool === 'A' ? 'poolA' : 'poolB'} className="text-[8px] sm:text-[10px]">Pool {team.pool}</Badge>
          </div>
          {/* Rank Medals */}
          {highlight && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 text-lg sm:text-xl">
              {highlight === 1 && '🥇'}
              {highlight === 2 && '🥈'}
            </div>
          )}
        </div>

        {/* Team Info - Right on mobile, Bottom on desktop */}
        <div className="p-4 sm:pt-3 sm:pb-4 sm:px-0 flex flex-col justify-center sm:justify-start w-full">
          <h3 className="text-nike-black font-black text-sm sm:text-base uppercase tracking-tight leading-tight group-hover:underline line-clamp-1">
            {team.name}
          </h3>
          <div className="flex items-center gap-1 mt-1 sm:mt-1 border-t border-light-gray pt-2 sm:border-none sm:pt-0">
            <Shield size={11} className="text-nike-secondary stroke-[2px] hidden sm:block" />
            <p className="text-nike-secondary text-[10px] sm:text-xs font-bold uppercase tracking-widest sm:font-medium sm:tracking-normal sm:normal-case truncate">
              {team.captain_name || 'TBD'}
            </p>
          </div>
          <div className="mt-auto sm:mt-3 flex items-center justify-between sm:justify-start gap-1 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-nike-black pt-2 sm:pt-0 border-t border-light-gray sm:border-none">
            <span>View Squad</span>
            <ArrowRight size={12} className="stroke-[2.5px]" />
          </div>
        </div>

      </div>
    </Link>
  )
}
