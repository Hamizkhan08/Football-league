import { Link } from 'react-router-dom'
import { Trophy, Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-white border-t border-light-gray mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Trophy size={20} className="text-nike-black stroke-[2px]" />
            <span className="text-nike-black font-nike font-black text-xl uppercase tracking-tighter">TurfLeague</span>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-xs font-bold uppercase tracking-widest">
            {[['/', 'Home'], ['/teams', 'Teams'], ['/schedule', 'Schedule'], ['/points-table', 'Standings']].map(([to, label]) => (
              <Link key={to} to={to} className="text-nike-secondary hover:text-nike-black transition-colors">{label}</Link>
            ))}
          </div>

          <p className="text-border-secondary text-xs font-medium flex items-center gap-1 uppercase tracking-widest">
            Built with <Heart size={12} className="text-nike-red fill-nike-red" /> for the game
          </p>
        </div>
      </div>
    </footer>
  )
}
