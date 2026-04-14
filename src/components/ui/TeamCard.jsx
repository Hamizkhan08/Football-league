import { Link } from 'react-router-dom'
import { Shield, ArrowRight } from 'lucide-react'
import { Badge } from './Badge'

const TEAM_INITIALS = (name) =>
  name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()

export default function TeamCard({ team, rank, highlight }) {
  const initials = TEAM_INITIALS(team.name)

  return (
    <Link to={`/teams/${team.id}`} className="block group">
      <div className="bg-white hover:bg-snow transition-colors duration-200 overflow-hidden">
        {/* Team Logo / Image - sharp edges */}
        <div className="aspect-square bg-light-gray overflow-hidden relative">
          {team.logo_url ? (
            <img 
              src={team.logo_url} 
              alt={team.name} 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-light-gray">
              <span className="font-nike font-black text-6xl text-hover-gray uppercase">{initials}</span>
            </div>
          )}
          {/* Pool Badge */}
          <div className="absolute top-3 left-3">
            <Badge variant={team.pool === 'A' ? 'poolA' : 'poolB'}>Pool {team.pool}</Badge>
          </div>
          {/* Rank Medals */}
          {highlight && (
            <div className="absolute top-3 right-3 text-xl">
              {highlight === 1 && '🥇'}
              {highlight === 2 && '🥈'}
            </div>
          )}
        </div>

        {/* Team Info */}
        <div className="pt-3 pb-4 px-0">
          <h3 className="text-nike-black font-black text-base uppercase tracking-tight leading-tight group-hover:underline">
            {team.name}
          </h3>
          <div className="flex items-center gap-1 mt-1">
            <Shield size={11} className="text-nike-secondary stroke-[2px]" />
            <p className="text-nike-secondary text-xs font-medium">{team.captain_name}</p>
          </div>
          <div className="mt-3 flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-nike-black">
            View Squad <ArrowRight size={12} className="stroke-[2.5px]" />
          </div>
        </div>
      </div>
    </Link>
  )
}
