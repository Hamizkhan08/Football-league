import { Link } from 'react-router-dom'
import { LayoutDashboard, Users, Shield, Calendar, ChevronRight, Activity, Plus, Lock, CheckCircle, Trophy } from 'lucide-react'
import { useTeams } from '../../hooks/useTeams'
import { useMatches } from '../../hooks/useMatches'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { isAdmin, user } = useAuth()
  const { teams } = useTeams()
  const { matches } = useMatches()

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto py-20 px-6 animate-in">
        <div className="bg-nike-black p-12 text-center">
          <div className="w-20 h-20 bg-white/10 flex items-center justify-center mx-auto mb-8">
            <Lock className="text-white" size={40} />
          </div>
          <h1 className="nike-display text-white text-5xl mb-6 leading-tight">ADMIN ACCESS REQUIRED</h1>
          <p className="text-white/60 text-sm font-medium mb-12 max-w-lg mx-auto leading-relaxed">
            You are logged in as <span className="text-white font-black">{user?.email}</span>, but you haven't been granted administrative privileges in the database yet.
          </p>
          
          <div className="space-y-6 text-left bg-white/5 border border-white/10 p-8 mb-12">
            <h2 className="text-[10px] font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4">
               <CheckCircle size={14} /> INITIAL SETUP
            </h2>
            <ol className="space-y-6 text-xs">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 bg-white text-nike-black flex items-center justify-center font-black text-xs">1</span>
                <span className="text-white/80 leading-relaxed font-medium">Open your <strong className="text-white">Supabase Dashboard</strong> and navigate to <strong className="text-white">Authentication → Users</strong>.</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 bg-white text-nike-black flex items-center justify-center font-black text-xs">2</span>
                <span className="text-white/80 leading-relaxed font-medium">Select your account and edit the <strong className="text-white">User Metadata</strong>.</span>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-6 h-6 bg-white text-nike-black flex items-center justify-center font-black text-xs">3</span>
                <span className="text-white/80 leading-relaxed font-medium">Add the following key-value pair: <code className="bg-white/10 px-2 py-0.5 text-white">{`{ "is_admin": true }`}</code> and save.</span>
              </li>
            </ol>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
             <button onClick={() => window.location.reload()} className="bg-white text-nike-black font-black uppercase tracking-widest text-xs py-4 px-10 hover:bg-light-gray transition-all">Verify & Refresh</button>
             <Link to="/" className="border border-white/20 text-white font-black uppercase tracking-widest text-xs py-4 px-10 hover:bg-white/10 transition-all text-center">Back to Home</Link>
          </div>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Total Teams',   value: teams.length,    icon: Shield,   color: 'text-nike-black' },
    { label: 'Total Players', value: teams.reduce((acc, t) => acc + (t.player_count || 0), 0), icon: Users,    color: 'text-nike-blue' },
    { label: 'Live Matches',  value: matches.filter(m => m.status === 'live').length, icon: Activity, color: 'text-nike-red' },
    { label: 'Avg Goals',     value: (matches.reduce((acc, m) => acc + (m.score_a + m.score_b), 0) / (matches.length || 1)).toFixed(1), icon: Calendar, color: 'text-nike-black' },
  ]

  const quickActions = [
    { to: '/admin/teams',   label: 'TEAMS',   icon: Shield,   desc: 'Squads and pools' },
    { to: '/admin/players', label: 'PLAYERS', icon: Users,    desc: 'Roster & Goal Stats' },
    { to: '/admin/matches', label: 'FIXTURES', icon: Calendar, desc: 'Live scoring control' },
    { to: '/admin/qualifications', label: 'STANDINGS', icon: Trophy, desc: 'Manual Promotion' },
    { to: '/admin/sponsors', label: 'SPONSORS', icon: LayoutDashboard, desc: 'Manage Partners' },
  ]

  return (
    <div className="animate-in pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 border-b border-light-gray flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="section-subtitle mb-3">Control Center</p>
          <h1 className="nike-display text-6xl md:text-8xl">ADMINISTRATION</h1>
        </div>
        <Link to="/admin/matches" className="btn-primary py-4 px-10 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
          <Plus size={16} /> NEW FIXTURE
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white border border-light-gray p-8">
              <div className={`mb-4 ${stat.color}`}>
                <stat.icon size={24} strokeWidth={2.5} />
              </div>
              <p className="text-[10px] font-black text-nike-secondary uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="nike-display text-5xl md:text-6xl text-nike-black">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Management Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {quickActions.map((action, idx) => (
            <Link key={idx} to={action.to} className="group bg-nike-black p-10 flex flex-col justify-between hover:bg-nike-secondary transition-all">
              <div className="w-12 h-12 bg-white flex items-center justify-center text-nike-black mb-12">
                <action.icon size={24} strokeWidth={2.5} />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="nike-headline text-white text-3xl">{action.label}</h3>
                  <ChevronRight className="text-white/40 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{action.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Events List */}
        <div className="border border-light-gray overflow-hidden">
          <div className="bg-nike-black px-8 py-6">
            <h2 className="nike-headline text-white text-xl">LATEST FIXTURES</h2>
          </div>
          <div className="bg-white">
            {matches.slice(0, 6).map((match, idx) => (
              <div key={idx} className="flex items-center justify-between px-8 py-6 border-b border-light-gray last:border-0 hover:bg-snow transition-colors">
                 <div className="flex items-center gap-6">
                   <div className={`w-3 h-3 ${match.status === 'live' ? 'bg-nike-red animate-pulse' : 'bg-nike-black'}`} />
                   <div className="flex flex-col">
                     <span className="text-[10px] font-black text-nike-secondary uppercase tracking-widest mb-1">
                        {match.status === 'completed' ? 'Final Result' : match.status === 'live' ? 'LIVE NOW' : 'NEXT UP'}
                     </span>
                     <span className="text-nike-black font-black uppercase text-sm tracking-tight">
                       {match.team_a?.name} <span className="text-nike-secondary mx-1">Vs</span> {match.team_b?.name}
                     </span>
                   </div>
                 </div>
                 <div className="text-right">
                   <span className="text-nike-black font-black text-lg tabular-nums">
                     {match.status !== 'upcoming' ? `${match.score_a} - ${match.score_b}` : new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                 </div>
              </div>
            ))}
            {matches.length === 0 && (
              <div className="p-20 text-center">
                <p className="text-nike-secondary text-[10px] font-black uppercase tracking-widest">No match history</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
