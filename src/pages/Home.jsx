import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Users, Swords, Target, TrendingUp, ChevronRight } from 'lucide-react'
import { supabase } from '../lib/supabase'
import StatCard from '../components/ui/StatCard'
import MatchCard from '../components/match/MatchCard'
import { PageLoader } from '../components/ui/LoadingSpinner'
import SponsorTicker from '../components/ui/SponsorTicker'

export default function Home() {
  const [stats, setStats]     = useState({ teams: 0, matches: 0, goals: 0, players: 0 })
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const [teamsRes, matchesRes, goalsRes, playersRes, upcomingRes] = await Promise.all([
        supabase.from('teams').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('goals').select('id', { count: 'exact', head: true }),
        supabase.from('players').select('id', { count: 'exact', head: true }),
        supabase.from('matches').select('*, team_a:team_a_id(id,name,logo_url), team_b:team_b_id(id,name,logo_url)').neq('status', 'completed').order('match_date').limit(4),
      ])
      setStats({
        teams:   teamsRes.count  || 0,
        matches: matchesRes.count || 0,
        goals:   goalsRes.count  || 0,
        players: playersRes.count || 0,
      })
      setMatches(upcomingRes.data || [])
      setLoading(false)
    }
    fetchData()

    const ch = supabase.channel('home-refresh')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'matches' }, fetchData)
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="animate-in space-y-10 pb-20">
      {/* Full-Bleed Hero Banner */}
      <section className="relative w-full h-[85vh] min-h-[600px] overflow-hidden bg-nike-black">
        <img 
          src="https://images.unsplash.com/photo-1574629810360-7efbbe195018?q=80&w=2000&auto=format&fit=crop" 
          alt="Football Hero"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-nike-black via-nike-black/60 to-transparent" />
        
        <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6 animate-slide-in">
            <Trophy size={20} className="text-white" />
            <span className="text-white text-xs font-bold uppercase tracking-[0.3em]">Season 2026 • Elite 10</span>
          </div>
          
          <h1 className="nike-display text-[12vw] md:text-[100px] lg:text-[130px] mb-8 animate-slide-in" style={{ animationDelay: '100ms' }}>
            <span className="text-white">WIN FROM</span> <br />
            <span className="text-nike-red">WITHIN.</span>
          </h1>
          
          <p className="text-hover-gray text-lg md:text-xl max-w-xl mb-12 leading-tight font-medium animate-slide-in" style={{ animationDelay: '200ms' }}>
            The premier college football championship. CPL 2026 brings together the elite squads for a fight that will define history.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 animate-slide-in" style={{ animationDelay: '300ms' }}>
            <Link to="/schedule" className="bg-white text-nike-black hover:bg-hover-gray px-10 py-5 rounded-nike text-sm font-black uppercase tracking-widest transition-all text-center sm:text-left">
              Join the Fight
            </Link>
            <Link to="/points-table" className="border-2 border-white text-white hover:bg-white hover:text-nike-black px-10 py-5 rounded-nike text-sm font-black uppercase tracking-widest transition-all text-center sm:text-left">
              Live Standings
            </Link>
          </div>
        </div>
      </section>

      <SponsorTicker />

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 space-y-24 mt-12">
        {/* Stats - Nike Style */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          <StatCard icon={Users}   label="Teams"           value={stats.teams}   sub="2 POOLS OF 5" />
          <StatCard icon={Swords}  label="Matches"         value={stats.matches} sub="ROUND ROBIN" />
          <StatCard icon={Target}  label="Goals"           value={stats.goals}   sub="TOTAL SCORED" />
          <StatCard icon={Users}   label="Players"        value={stats.players} sub="REGISTERED" />
        </section>

        {/* Featured Matches */}
        <section>
          <div className="flex items-end justify-between mb-8 border-b-2 border-light-gray pb-4">
            <div>
              <p className="section-subtitle mb-2">LIVE & UPCOMING</p>
              <h2 className="nike-headline text-5xl">THE MATCHUP</h2>
            </div>
            <Link to="/schedule" className="text-nike-black font-black text-xs uppercase tracking-widest hover:text-nike-blue">
              View All Matches
            </Link>
          </div>
          
          {matches.length === 0 ? (
            <div className="bg-light-gray h-40 flex items-center justify-center text-nike-secondary font-bold uppercase tracking-widest">
              No active or upcoming matches
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {matches.map(m => <MatchCard key={m.id} match={m} />)}
            </div>
          )}
        </section>

        {/* Explore Categories - Nike Style Image Cards */}
        <section>
          <p className="section-subtitle mb-6 text-center">EXPLORE THE LEAGUE</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { to: '/teams',        label: 'THE ROSTERS', img: 'file:///C:/Users/Admin.DESKTOP-HOGQNHQ/.gemini/antigravity/brain/a6d11d5b-5cd3-481b-a9d9-b2019bc9738b/home_categories_set_1776189569000_1776190501850.png', pos: 'top left', scale: 'scale-[2.2]' },
              { to: '/points-table', label: 'THE STANDINGS', img: 'file:///C:/Users/Admin.DESKTOP-HOGQNHQ/.gemini/antigravity/brain/a6d11d5b-5cd3-481b-a9d9-b2019bc9738b/home_categories_set_1776189569000_1776190501850.png', pos: 'right', scale: 'scale-[1.8]' },
              { to: '/top-scorers',  label: 'THE GOALS', img: 'file:///C:/Users/Admin.DESKTOP-HOGQNHQ/.gemini/antigravity/brain/a6d11d5b-5cd3-481b-a9d9-b2019bc9738b/home_categories_set_1776189569000_1776190501850.png', pos: 'bottom left', scale: 'scale-[2.2]' },
            ].map(l => (
              <Link key={l.to} to={l.to} className="relative group overflow-hidden h-[250px] md:h-[400px] bg-nike-black">
                <img 
                  src={l.img} 
                  alt={l.label} 
                  className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${l.scale} origin-${l.pos}`}
                />
                <div className="absolute inset-0 bg-black/20 md:bg-black/30 group-hover:bg-black/10 transition-colors" />
                <div className="absolute bottom-10 left-10">
                  <span className="text-white text-5xl font-nike font-black uppercase leading-none drop-shadow-lg">{l.label}</span>
                  <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                    <span className="bg-white text-nike-black px-6 py-2 rounded-nike text-xs font-black uppercase tracking-widest">Shop All</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>

  )
}
