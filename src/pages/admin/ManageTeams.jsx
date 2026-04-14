import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { Shield, Plus, Edit2, Trash2, Search, ArrowRight, Settings, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function ManageTeams() {
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', captain_name: '', logo_url: '', pool: 'A' })

  useEffect(() => {
    fetchTeams()
  }, [])

  async function fetchTeams() {
    setLoading(true)
    const { data, error } = await supabase.from('teams').select('*').order('name')
    if (error) toast.error('Error fetching teams')
    else setTeams(data)
    setLoading(false)
  }

  async function handleAdd(e) {
    e.preventDefault()
    const { data, error } = await supabase.from('teams').insert([formData]).select()
    if (error) toast.error(error.message)
    else {
      toast.success('Team registered!')
      setTeams([...teams, data[0]])
      setFormData({ name: '', captain_name: '', logo_url: '', pool: 'A' })
      setShowAddForm(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure? This will delete all players and stats for this team!')) return
    const { error } = await supabase.from('teams').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Team deleted')
      setTeams(teams.filter(t => t.id !== id))
    }
  }

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    t.captain_name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading && teams.length === 0) return <PageLoader />

  return (
    <div className="animate-in pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 border-b border-light-gray flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="section-subtitle mb-3">Organization</p>
          <h1 className="nike-display text-6xl md:text-8xl">TEAMS</h1>
        </div>
        <div className="flex items-center gap-4">
           <Link to="/admin/settings" className="p-4 bg-snow text-nike-black border border-light-gray hover:bg-light-gray transition-all" title="Tournament Settings">
             <Settings size={20} />
           </Link>
           <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary py-4 px-8 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
          >
            {showAddForm ? <X size={16} /> : <Plus size={16} />}
            {showAddForm ? 'CANCEL' : 'REGISTER TEAM'}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10">
        {/* Quick Add Form */}
        {showAddForm && (
          <div className="bg-nike-black p-8 border border-nike-black mb-12 animate-slide-in">
            <h2 className="nike-headline text-white text-3xl mb-8 uppercase">Establish New Squad</h2>
            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" onSubmit={handleAdd}>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Team Name</label>
                <input 
                  required
                  placeholder="e.g. Thunder FC"
                  className="w-full bg-white border border-light-gray px-4 py-3 text-sm font-bold focus:outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Captain Name</label>
                <input 
                  required
                  placeholder="Full Name"
                  className="w-full bg-white border border-light-gray px-4 py-3 text-sm font-bold focus:outline-none"
                  value={formData.captain_name}
                  onChange={e => setFormData({...formData, captain_name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Initial Pool</label>
                <select 
                  className="w-full bg-white border border-light-gray px-4 py-3 text-sm font-bold focus:outline-none"
                  value={formData.pool}
                  onChange={e => setFormData({...formData, pool: e.target.value})}
                >
                  <option value="A">Pool A</option>
                  <option value="B">Pool B</option>
                </select>
              </div>
              <div className="flex items-end">
                <button type="submit" className="w-full bg-white text-nike-black font-black uppercase tracking-widest text-[10px] py-4 hover:bg-light-gray transition-all">
                  Register Now
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search & Team Grid */}
        <div className="space-y-10">
          <div className="relative">
            <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-nike-secondary" />
            <input 
              placeholder="SEARCH SQUADS OR CAPTAINS..."
              className="w-full bg-snow border border-light-gray pl-16 pr-6 py-5 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-nike-black"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map(team => (
              <div key={team.id} className="bg-white border border-light-gray group hover:border-nike-black transition-all">
                <div className="p-8 pb-4 flex items-start justify-between">
                  <div className="w-16 h-16 bg-nike-black flex items-center justify-center text-white font-black text-xl overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                    {team.logo_url ? <img src={team.logo_url} className="w-full h-full object-cover" /> : team.name[0]}
                  </div>
                  <div className="flex flex-col items-end gap-3">
                     <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest ${team.pool === 'A' ? 'bg-snow text-nike-black border border-light-gray' : 'bg-nike-blue text-white'}`}>
                      Pool {team.pool}
                    </span>
                    <button onClick={() => handleDelete(team.id)} className="p-2 text-nike-secondary hover:text-nike-red transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="px-8 py-6 pt-0">
                  <h3 className="nike-headline text-3xl mb-1 truncate">{team.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-nike-secondary mb-8">CAPTAIN: {team.captain_name}</p>
                  
                  <Link 
                    to={`/admin/teams/${team.id}`}
                    className="w-full py-4 bg-nike-black text-white text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-nike-secondary transition-all active:scale-[0.98]"
                  >
                    MANAGE SQUAD <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
          
          {filteredTeams.length === 0 && (
            <div className="py-32 text-center border-2 border-dashed border-light-gray">
              <p className="text-nike-secondary text-[10px] font-black uppercase tracking-widest">No matching teams discovered</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
