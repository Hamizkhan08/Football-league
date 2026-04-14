import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Calendar, Plus, Save, Trash2, X, Clock, Shield, Trophy, ChevronRight, ChevronLeft, Target, Users, Search } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function ManageMatches() {
  const [matches, setMatches] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [search, setSearch] = useState('')
  const [activeTab, setActiveTab] = useState('league') // 'league' | 'knockout'
  const [adminFilter, setAdminFilter] = useState('all')
  const [formData, setFormData] = useState({ 
    team_a_id: '', team_b_id: '', match_date: '', pool: 'A', status: 'upcoming', is_knockout: false 
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [matchesRes, teamsRes] = await Promise.all([
      supabase.from('matches').select('*, team_a:team_a_id(*), team_b:team_b_id(*)').order('match_date', { ascending: true }),
      supabase.from('teams').select('*').order('name')
    ])
    
    if (matchesRes.error) toast.error('Error fetching matches')
    else setMatches(matchesRes.data)
    
    if (teamsRes.error) toast.error('Error fetching teams')
    else {
      setTeams(teamsRes.data)
      const initialTeams = activeTab === 'league' ? teamsRes.data : teamsRes.data.filter(t => t.is_qualified)
      if (initialTeams.length >= 2) {
        setFormData(prev => ({ 
          ...prev, 
          team_a_id: initialTeams[0].id, 
          team_b_id: initialTeams[1].id,
          pool: initialTeams[0].pool
        }))
      }
    }
    setLoading(false)
  }

  // Update form data when tab changes to ensure valid team selection
  useEffect(() => {
    const availableTeams = activeTab === 'league' ? teams : teams.filter(t => t.is_qualified)
    if (availableTeams.length >= 2) {
      setFormData(prev => ({
        ...prev,
        team_a_id: availableTeams[0].id,
        team_b_id: availableTeams[1].id,
        is_knockout: activeTab === 'knockout'
      }))
    }
  }, [activeTab, teams])

  const filteredMatches = matches.filter(m => {
    // Tab Filter
    const matchesTab = activeTab === 'knockout' ? m.is_knockout : !m.is_knockout
    
    // Pool Filter (Only for league)
    const matchesPool = activeTab === 'knockout' || adminFilter === 'all' 
      || (adminFilter === 'A' && m.pool === 'A')
      || (adminFilter === 'B' && m.pool === 'B')
    
    // Search filter
    const matchesSearch = !search 
      || m.team_a?.name?.toLowerCase()?.includes(search.toLowerCase())
      || m.team_b?.name?.toLowerCase()?.includes(search.toLowerCase())
    
    return matchesTab && matchesPool && matchesSearch
  })

  const formTeams = activeTab === 'league' ? teams : teams.filter(t => t.is_qualified)

  async function handleAdd(e) {
    e.preventDefault()
    if (formData.team_a_id === formData.team_b_id) {
      return toast.error("A team can't play against itself!")
    }

    const { data, error } = await supabase.from('matches').insert([formData]).select('*, team_a:team_a_id(*), team_b:team_b_id(*)')

    if (error) toast.error(error.message)
    else {
      toast.success('Match scheduled!')
      setMatches([...matches, data[0]])
      setShowAddForm(false)
    }
  }

  async function updateMatch(matchId, updates) {
    const { error } = await supabase.from('matches').update(updates).eq('id', matchId)
    if (error) {
      toast.error(error.message)
    } else {
      setMatches(prev => prev.map(m => m.id === matchId ? { ...m, ...updates } : m))
      toast.success('Match updated')
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure? This will delete all associated goals!')) return
    const { error } = await supabase.from('matches').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Match deleted')
      setMatches(matches.filter(m => m.id !== id))
    }
  }

  if (loading && matches.length === 0) return <PageLoader />

  return (
    <div className="animate-in pb-20">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 border-b border-light-gray flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div className="space-y-4">
          <p className="section-subtitle">Tournament Control</p>
          <h1 className="nike-display text-5xl md:text-8xl italic uppercase leading-none">Fixtures</h1>
          
          {/* Section Toggles */}
          <div className="flex bg-snow border-2 border-nike-black p-1 w-fit mt-6">
            <button 
              onClick={() => setActiveTab('league')}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'league' ? 'bg-nike-black text-white' : 'text-nike-secondary hover:bg-white'}`}
            >
              League Matches
            </button>
            <button 
              onClick={() => setActiveTab('knockout')}
              className={`px-8 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'knockout' ? 'bg-nike-black text-white' : 'text-nike-secondary hover:bg-white'}`}
            >
              Knockout Phase
            </button>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
           {/* Search & Pool Filter Bar */}
           <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-light-gray" size={18} />
              <input 
                type="text"
                placeholder="Find match..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white border-2 border-light-gray px-12 py-4 w-full text-xs font-black uppercase tracking-widest focus:outline-none focus:border-nike-black transition-all"
              />
           </div>
           
           {activeTab === 'league' && (
             <div className="flex bg-snow border-2 border-light-gray p-1">
                {['all', 'A', 'B'].map(pool => (
                  <button
                    key={pool}
                    onClick={() => setAdminFilter(pool)}
                    className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                      adminFilter === pool 
                        ? 'bg-nike-black text-white shadow-lg' 
                        : 'text-nike-secondary hover:bg-white/50'
                    }`}
                  >
                    {pool === 'all' ? 'All Pools' : `Pool ${pool}`}
                  </button>
                ))}
             </div>
           )}

           <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-nike-black text-white py-4 px-8 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-nike-secondary transition-all shadow-xl active:scale-95"
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />} 
            {showAddForm ? 'Cancel' : `Add ${activeTab === 'league' ? 'League' : 'Knockout'} Match`}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10">
        {/* Add Match Form */}
        {showAddForm && (
          <div className="bg-nike-black p-8 border border-nike-black mb-12 animate-slide-in shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]">
            <h2 className="nike-headline text-white text-3xl mb-2 uppercase tracking-tight italic">
              New {activeTab === 'knockout' ? 'Knockout' : 'League'} Fixture
            </h2>
            {activeTab === 'knockout' && (
              <p className="text-[10px] font-black text-nike-red uppercase tracking-widest mb-8">
                Note: Only teams promoted to the Qualifiers are available for knockout scheduling.
              </p>
            )}
            <form onSubmit={handleAdd} className="space-y-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Team A</label>
                  <select 
                    required
                    className="w-full bg-white border border-light-gray px-4 py-4 text-xs font-black uppercase focus:outline-none"
                    value={formData.team_a_id}
                    onChange={e => setFormData({...formData, team_a_id: e.target.value})}
                  >
                    {formTeams.map(t => <option key={t.id} value={t.id}>{t.name} (Pool {t.pool})</option>)}
                    {formTeams.length === 0 && <option disabled>No {activeTab === 'knockout' ? 'Qualified' : ''} teams found</option>}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Team B</label>
                  <select 
                    required
                    className="w-full bg-white border border-light-gray px-4 py-4 text-xs font-black uppercase focus:outline-none"
                    value={formData.team_b_id}
                    onChange={e => setFormData({...formData, team_b_id: e.target.value})}
                  >
                    {formTeams.map(t => <option key={t.id} value={t.id}>{t.name} (Pool {t.pool})</option>)}
                    {formTeams.length === 0 && <option disabled>No {activeTab === 'knockout' ? 'Qualified' : ''} teams found</option>}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Stage</label>
                  <select 
                    className="w-full bg-white border border-light-gray px-4 py-4 text-xs font-black uppercase focus:outline-none"
                    value={formData.pool}
                    disabled={activeTab === 'knockout'}
                    onChange={e => setFormData({...formData, pool: e.target.value})}
                  >
                    <option value="A">Pool A</option>
                    <option value="B">Pool B</option>
                    <option value="Finals">Finals</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Date & Time</label>
                  <input 
                    type="datetime-local"
                    required
                    className="w-full bg-white border border-light-gray px-4 py-4 text-xs font-black uppercase focus:outline-none"
                    value={formData.match_date}
                    onChange={e => setFormData({...formData, match_date: e.target.value})}
                  />
                </div>
              </div>

              <button type="submit" disabled={formTeams.length < 2} className="bg-white text-nike-black font-black uppercase tracking-widest text-[10px] py-5 px-12 hover:bg-light-gray transition-all shadow-lg active:scale-95 disabled:opacity-50">
                Confirm {activeTab === 'knockout' ? 'Knockout' : 'League'} Schedule
              </button>
            </form>
          </div>
        )}

        {/* Match Cards List */}
        <div className="grid grid-cols-1 gap-12">
          {filteredMatches.map(match => (
            <MatchEditCard 
              key={match.id} 
              match={match} 
              onUpdate={(updates) => updateMatch(match.id, updates)}
              onDelete={() => handleDelete(match.id)}
            />
          ))}
          {filteredMatches.length === 0 && (
            <div className="bg-snow p-24 text-center border-2 border-dashed border-light-gray">
              <Calendar size={48} className="mx-auto text-light-gray mb-4" />
              <p className="nike-headline text-nike-secondary text-xl font-black italic uppercase">No {activeTab} fixtures scheduled</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


function MatchEditCard({ match, onUpdate, onDelete }) {
  const [localDate, setLocalDate] = useState(match.match_date?.slice(0, 16) || '')
  const [goals, setGoals] = useState([])
  const [playersA, setPlayersA] = useState([])
  const [playersB, setPlayersB] = useState([])
  const [showScorerSelect, setShowScorerSelect] = useState(null) // 'a' | 'b' | null
  const [loadingGoals, setLoadingGoals] = useState(true)

  useEffect(() => {
    fetchMatchDetails()
    setLocalDate(match.match_date?.slice(0, 16) || '')
  }, [match.id])

  async function fetchMatchDetails() {
    setLoadingGoals(true)
    const [goalsRes, playersARes, playersBRes] = await Promise.all([
      supabase.from('match_goals').select('*, player:player_id(*)').eq('match_id', match.id).order('created_at', { ascending: true }),
      supabase.from('players').select('*').eq('team_id', match.team_a_id).order('name'),
      supabase.from('players').select('*').eq('team_id', match.team_b_id).order('name')
    ])
    setGoals(goalsRes.data || [])
    setPlayersA(playersARes.data || [])
    setPlayersB(playersBRes.data || [])
    setLoadingGoals(false)
  }

  async function recordGoal(player, teamType) {
    const minute = prompt("Goal Minute (optional):", "")
    const { data, error } = await supabase.from('match_goals').insert({
      match_id: match.id,
      player_id: player.id,
      team_id: player.team_id,
      minute: parseInt(minute) || null
    }).select('*, player:player_id(*)').single()

    if (error) return toast.error(error.message)

    // Update Scores & Player Stats
    const newScoreA = teamType === 'a' ? match.score_a + 1 : match.score_a
    const newScoreB = teamType === 'b' ? match.score_b + 1 : match.score_b
    
    await Promise.all([
      supabase.from('matches').update({ score_a: newScoreA, score_b: newScoreB }).eq('id', match.id),
      supabase.from('players').update({ goals: player.goals + 1 }).eq('id', player.id)
    ])

    setGoals([...goals, data])
    onUpdate({ score_a: newScoreA, score_b: newScoreB })
    setShowScorerSelect(null)
    toast.success(`Goal recorded for ${player.name}!`)
  }

  async function removeGoal(goal) {
    if (!confirm('Are you sure you want to remove this goal?')) return
    const { error } = await supabase.from('match_goals').delete().eq('id', goal.id)
    if (error) return toast.error(error.message)

    const isTeamA = goal.team_id === match.team_a_id
    const newScoreA = isTeamA ? Math.max(0, match.score_a - 1) : match.score_a
    const newScoreB = !isTeamA ? Math.max(0, match.score_b - 1) : match.score_b

    await Promise.all([
      supabase.from('matches').update({ score_a: newScoreA, score_b: newScoreB }).eq('id', match.id),
      supabase.from('players').update({ goals: Math.max(0, (goal.player?.goals || 1) - 1) }).eq('id', goal.player_id)
    ])

    setGoals(goals.filter(g => g.id !== goal.id))
    onUpdate({ score_a: newScoreA, score_b: newScoreB })
    toast.success('Goal removed')
  }

  return (
    <div className="bg-white border border-light-gray overflow-hidden transition-all shadow-sm hover:shadow-xl">
      {/* Card Header */}
      <div className="bg-nike-black p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-8 w-full md:w-auto">
          <div className="flex-1 text-right">
            <h3 className="nike-headline text-white text-2xl md:text-3xl truncate uppercase">{match.team_a?.name}</h3>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Team A (Pool {match.pool})</span>
          </div>
          <div className="nike-display text-4xl text-white/20 italic">VS</div>
          <div className="flex-1 text-left">
            <h3 className="nike-headline text-white text-2xl md:text-3xl truncate uppercase">{match.team_b?.name}</h3>
            <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Team B (Pool {match.pool})</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <select 
            value={match.status}
            onChange={(e) => onUpdate({ status: e.target.value })}
            className={`px-6 py-3 text-[10px] font-black uppercase tracking-widest border transition-all cursor-pointer ${
              match.status === 'live' ? 'bg-nike-red border-nike-red text-white' : 
              match.status === 'completed' ? 'bg-white text-nike-black border-white' : 
              'bg-transparent border-white/30 text-white hover:border-white'
            }`}
          >
            <option value="upcoming" className="text-nike-black">Upcoming</option>
            <option value="live" className="text-nike-black">Live</option>
            <option value="completed" className="text-nike-black">Completed</option>
          </select>
          <button onClick={onDelete} className="text-white/30 hover:text-nike-red transition-colors active:scale-95">
            <Trash2 size={24} />
          </button>
          
          <Link 
            to={`/admin/matches/${match.id}/control`}
            className="bg-nike-blue text-white py-3 px-6 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-black transition-all"
          >
            <Settings size={14} /> Live Control
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-light-gray">
        {/* Left Side: Score & Scorer Selection */}
        <div className="p-8 md:p-12 space-y-12 bg-white">
          <div className="flex items-center justify-center gap-12">
            {/* Team A Scorer Control */}
            <div className="flex flex-col items-center gap-6">
               <button 
                onClick={() => setShowScorerSelect(showScorerSelect === 'a' ? null : 'a')}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${showScorerSelect === 'a' ? 'bg-nike-black text-white rotate-45' : 'bg-snow text-nike-black hover:bg-nike-black hover:text-white'}`}
               >
                 <Plus size={32} />
               </button>
               <div className="nike-display text-7xl md:text-8xl">{match.score_a}</div>
               <span className="text-[10px] font-black uppercase tracking-widest text-nike-secondary italic">Record Goal (A)</span>
            </div>

            <div className="nike-display text-6xl text-light-gray">:</div>

            {/* Team B Scorer Control */}
            <div className="flex flex-col items-center gap-6">
               <button 
                onClick={() => setShowScorerSelect(showScorerSelect === 'b' ? null : 'b')}
                className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${showScorerSelect === 'b' ? 'bg-nike-black text-white rotate-45' : 'bg-snow text-nike-black hover:bg-nike-black hover:text-white'}`}
               >
                 <Plus size={32} />
               </button>
               <div className="nike-display text-7xl md:text-8xl">{match.score_b}</div>
               <span className="text-[10px] font-black uppercase tracking-widest text-nike-secondary italic">Record Goal (B)</span>
            </div>
          </div>

          {/* Scorer Selection Dropdown-style list */}
          {showScorerSelect && (
            <div className="border border-nike-black bg-snow animate-in slide-in-from-top-2">
              <div className="bg-nike-black text-white px-4 py-3 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest">Select Goal Scorer</span>
                <button onClick={() => setShowScorerSelect(null)}><X size={14}/></button>
              </div>
              <div className="max-h-60 overflow-y-auto divide-y divide-light-gray">
                {(showScorerSelect === 'a' ? playersA : playersB).map(player => (
                  <button 
                    key={player.id}
                    onClick={() => recordGoal(player, showScorerSelect)}
                    className="w-full text-left px-5 py-4 hover:bg-white flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Target size={14} className="text-light-gray group-hover:text-nike-black" />
                      <span className="font-bold text-sm uppercase">{player.name}</span>
                    </div>
                    <ChevronRight size={14} className="text-light-gray" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Penalty Shootout (Conditional) */}
          {match.is_knockout && (
             <div className="pt-12 border-t border-light-gray space-y-6">
               <div className="flex items-center gap-4 text-nike-red">
                 <Trophy size={16} />
                 <p className="section-subtitle">Penalty Shootout Results</p>
               </div>
               <div className="flex items-center gap-6">
                 <input 
                  type="number" 
                  className="w-full bg-snow border border-light-gray p-6 text-2xl font-black text-center focus:outline-none focus:border-nike-black"
                  placeholder="Team A"
                  defaultValue={match.penalty_score_a}
                  onChange={(e) => onUpdate({ penalty_score_a: parseInt(e.target.value) || 0 })}
                 />
                 <span className="nike-display text-3xl font-black">:</span>
                 <input 
                  type="number" 
                  className="w-full bg-snow border border-light-gray p-6 text-2xl font-black text-center focus:outline-none focus:border-nike-black"
                  placeholder="Team B"
                  defaultValue={match.penalty_score_b}
                  onChange={(e) => onUpdate({ penalty_score_b: parseInt(e.target.value) || 0 })}
                 />
               </div>
             </div>
          )}
        </div>

        {/* Right Side: Timeline & Settings */}
        <div className="p-8 md:p-12 space-y-12 bg-snow">
          {/* Match Timeline / Goals List */}
          <div className="space-y-6">
            <p className="section-subtitle">Match Timeline</p>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {loadingGoals ? (
                <div className="py-10 text-center opacity-20"><PageLoader /></div>
              ) : goals.length === 0 ? (
                <div className="py-10 text-center border border-dashed border-light-gray">
                   <p className="text-[10px] font-black uppercase text-nike-secondary tracking-widest opacity-40 italic">Waiting for Goal Events...</p>
                </div>
              ) : (
                goals.map((goal, idx) => (
                  <div key={goal.id} className="bg-white border border-light-gray p-4 flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 bg-nike-black text-white flex items-center justify-center text-[10px] font-black">
                        {goal.minute ? `${goal.minute}'` : idx+1}
                      </div>
                      <div>
                        <p className="font-bold text-sm uppercase leading-none mb-1">{goal.player?.name}</p>
                        <p className="text-[10px] font-black text-nike-secondary uppercase tracking-tighter opacity-60">
                          {goal.team_id === match.team_a_id ? match.team_a?.name : match.team_b?.name}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => removeGoal(goal)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-nike-secondary hover:text-nike-red transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Time & Misc Controls */}
          <div className="pt-10 border-t border-light-gray space-y-8">
            <div className="flex flex-col gap-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-nike-secondary">Kickoff Schedule</label>
               <div className="flex gap-2">
                 <input 
                  type="datetime-local" 
                  className="flex-1 bg-white border border-light-gray p-4 text-sm font-bold focus:outline-none focus:border-nike-black"
                  value={localDate}
                  onChange={(e) => setLocalDate(e.target.value)}
                 />
                 <button 
                   onClick={() => onUpdate({ match_date: localDate })}
                   className="bg-nike-black text-white p-4 hover:bg-nike-secondary transition-all"
                 >
                   <Save size={20} />
                 </button>
               </div>
            </div>

            <div className="flex items-center justify-between p-5 bg-white border border-light-gray">
               <div className="flex items-center gap-3">
                 <Shield size={16} className="text-nike-blue" />
                 <span className="text-[10px] font-black uppercase tracking-widest italic">Knockout Stage</span>
               </div>
               <input 
                type="checkbox" 
                checked={match.is_knockout} 
                onChange={(e) => onUpdate({ is_knockout: e.target.checked })}
                className="w-6 h-6 border-2 border-nike-black rounded-none checked:bg-nike-black accent-nike-black cursor-pointer"
               />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


