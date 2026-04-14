import { Link } from 'react-router-dom'
import { Target, Activity, Users } from 'lucide-react'

export default function PlayerCard({ player }) {
  return (
    <Link to={`/players/${player.id}`} className="block group">
      <div className="bg-white border border-light-gray overflow-hidden hover:border-nike-black transition-colors">
        {/* Player Image - Compact */}
        <div className="aspect-[4/5] bg-snow overflow-hidden relative border-b border-light-gray flex items-center justify-center">
          {player.image_url ? (
            <img
              src={player.image_url}
              alt={player.name}
              onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : null}
          <div className={`flex items-center justify-center w-full h-full text-nike-black font-black text-xl uppercase tracking-tighter ${player.image_url ? 'hidden' : 'flex'}`}>
            {(player.name || "?").split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          {/* Jersey No - Top Left */}
          <div className="absolute top-0 left-0 bg-nike-black text-white px-2 py-1">
            <span className="text-[9px] font-black tracking-tighter">#{player.jersey_no}</span>
          </div>
        </div>

        {/* Player Info - Tighter */}
        <div className="p-3">
          <h3 className="text-nike-black font-black text-xs uppercase tracking-tight leading-none truncate mb-1">
            {player.name}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-nike-secondary text-[8px] font-bold uppercase tracking-widest truncate">
              {player.position || 'Player'}
            </p>
            {player.is_captain && <span className="text-nike-red text-[8px] font-black uppercase">Captain</span>}
          </div>

          {/* Compact Tournament Stats */}
          <div className="mt-3 grid grid-cols-2 gap-px bg-light-gray">
            <div className="bg-white py-1.5 flex flex-col items-center">
              <span className="text-[10px] font-black text-nike-black leading-none">{player.matches_played || 0}</span>
              <span className="text-[7px] font-bold text-nike-secondary uppercase tracking-widest mt-0.5">MP</span>
            </div>
            <div className="bg-white py-1.5 flex flex-col items-center">
              <span className="text-[10px] font-black text-nike-red leading-none">{player.goals || 0}</span>
              <span className="text-[7px] font-bold text-nike-secondary uppercase tracking-widest mt-0.5">Goals</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
