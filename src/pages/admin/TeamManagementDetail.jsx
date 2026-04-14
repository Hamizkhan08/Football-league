import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { ArrowLeft, Shield, Users, Plus, Edit2, Trash2, Save, X, Trophy } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageLoader } from '../../components/ui/LoadingSpinner'
import ImageUpload from '../../components/ui/ImageUpload'

export default function TeamManagementDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [team, setTeam] = useState(null)
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [showAddPlayer, setShowAddPlayer] = useState(false)
  const [playerFormData, setPlayerFormData] = useState({ 
    name: '', jersey_no: '', position: 'Forward', image_url: '', is_captain: false 
  })

  useEffect(() => {
    fetchTeamData()
  }, [id])

  async function fetchTeamData() {
    setLoading(true)
    const [teamRes, playersRes] = await Promise.all([
      supabase.from('teams').select('*').eq('id', id).single(),
      supabase.from('players').select('*').eq('team_id', id).order('name')
    ])

    if (teamRes.error) {
      toast.error('Team not found')
      navigate('/admin/teams')
    } else {
      setTeam(teamRes.data)
      setPlayers(playersRes.data || [])
    }
    setLoading(false)
  }

  async function updateTeam(updates) {
    const { error } = await supabase.from('teams').update(updates).eq('id', id)
    if (error) toast.error(error.message)
    else {
      setTeam({ ...team, ...updates })
      toast.success('Team updated!')
    }
  }

  async function handleAddPlayer(e) {
    e.preventDefault()
    const { data, error } = await supabase.from('players').insert([{ ...playerFormData, team_id: id }]).select()
    if (error) toast.error(error.message)
    else {
      toast.success('Player added!')
      setPlayers([...players, data[0]])
      setPlayerFormData({ name: '', jersey_no: '', position: 'Forward', image_url: '', is_captain: false })
      setShowAddPlayer(false)
    }
  }

  async function handleUpdatePlayer(e) {
    e.preventDefault()
    const { error } = await supabase.from('players').update(editingPlayer).eq('id', editingPlayer.id)
    if (error) toast.error(error.message)
    else {
      toast.success('Player updated!')
      setPlayers(players.map(p => p.id === editingPlayer.id ? editingPlayer : p))
      setEditingPlayer(null)
    }
  }

  async function handleDeletePlayer(pid) {
    if (!confirm('Are you sure?')) return
    const { error } = await supabase.from('players').delete().eq('id', pid)
    if (error) toast.error(error.message)
    else {
      toast.success('Player removed')
      setPlayers(players.filter(p => p.id !== pid))
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="animate-in pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 border-b border-light-gray flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <Link to="/admin/teams" className="p-4 bg-snow text-nike-black border border-light-gray hover:bg-light-gray transition-all">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <p className="section-subtitle mb-2">Team Profile</p>
            <h1 className="nike-display text-5xl md:text-7xl uppercase truncate max-w-md">{team.name}</h1>
          </div>
        </div>
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
             <span className="text-[10px] font-black text-nike-secondary uppercase tracking-widest mb-1">Competition Group</span>
             <select 
              className="bg-nike-black text-white px-6 py-3 text-[10px] font-black uppercase tracking-widest focus:outline-none border-0"
              value={team.pool}
              onChange={(e) => updateTeam({ pool: e.target.value })}
             >
               <option value="A">POOL A</option>
               <option value="B">POOL B</option>
             </select>
           </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Identity Section */}
          <div className="lg:col-span-1 border-r border-light-gray pr-0 lg:pr-12">
            <h2 className="nike-headline text-3xl mb-8 uppercase tracking-tight">IDENTITY</h2>
            <div className="space-y-12">
               <div>
                  <label className="block text-[10px] font-black text-nike-secondary uppercase tracking-widest mb-4">TEAM CREST</label>
                  <div className="bg-snow p-8 border border-light-gray">
                    <ImageUpload 
                      bucket="team-logos" 
                      folder={team.id}
                      existingUrl={team.logo_url}
                      onUpload={(url) => updateTeam({ logo_url: url })}
                    />
                  </div>
               </div>
               <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-nike-secondary uppercase tracking-widest">OFFICIAL SQUAD NAME</label>
                    <input 
                      className="w-full bg-snow border border-light-gray px-4 py-3 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-nike-black"
                      value={team.name}
                      onBlur={(e) => updateTeam({ name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-[10px] font-black text-nike-secondary uppercase tracking-widest">SQUAD CAPTAIN</label>
                    <input 
                      className="w-full bg-snow border border-light-gray px-4 py-3 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-nike-black"
                      value={team.captain_name}
                      onBlur={(e) => updateTeam({ captain_name: e.target.value })}
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Roster Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-8">
              <h2 className="nike-headline text-3xl uppercase tracking-tight">SQUAD ROSTER</h2>
              <button 
                onClick={() => setShowAddPlayer(!showAddPlayer)}
                className="btn-primary py-4 px-8 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
              >
                {showAddPlayer ? <X size={14} /> : <Plus size={14} />} ADD PLAYER
              </button>
            </div>

            {(showAddPlayer || editingPlayer) && (
              <div className="bg-nike-black p-8 border border-nike-black mb-12 animate-slide-in">
                <h3 className="nike-headline text-white text-2xl mb-8 uppercase tracking-tight">
                  {editingPlayer ? 'REVISE PERSONNEL' : 'NEW REGISTRATION'}
                </h3>
                <form 
                  className="grid grid-cols-1 md:grid-cols-2 gap-8" 
                  onSubmit={editingPlayer ? handleUpdatePlayer : handleAddPlayer}
                >
                  <div className="space-y-6">
                     <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">FULL NAME</label>
                          <input required className="w-full bg-white px-4 py-3 text-sm font-bold focus:outline-none" value={editingPlayer ? editingPlayer.name : playerFormData.name} onChange={e => editingPlayer ? setEditingPlayer({...editingPlayer, name: e.target.value}) : setPlayerFormData({...playerFormData, name: e.target.value})} />
                        </div>
                        <div className="w-24 space-y-2">
                          <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">KIT #</label>
                          <input type="number" className="w-full bg-white px-4 py-3 text-sm font-bold focus:outline-none" value={editingPlayer ? editingPlayer.jersey_no : playerFormData.jersey_no} onChange={e => editingPlayer ? setEditingPlayer({...editingPlayer, jersey_no: parseInt(e.target.value)}) : setPlayerFormData({...playerFormData, jersey_no: parseInt(e.target.value)})} />
                        </div>
                     </div>
                     <div className="flex gap-4">
                        <div className="flex-1 space-y-2">
                          <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">POSITION</label>
                          <select className="w-full bg-white px-4 py-3 text-sm font-bold focus:outline-none" value={editingPlayer ? editingPlayer.position : playerFormData.position} onChange={e => editingPlayer ? setEditingPlayer({...editingPlayer, position: e.target.value}) : setPlayerFormData({...playerFormData, position: e.target.value})}>
                            <option value="Forward">Forward</option>
                            <option value="Midfielder">Midfielder</option>
                            <option value="Defender">Defender</option>
                            <option value="Goalkeeper">Goalkeeper</option>
                          </select>
                        </div>
                        <div className="flex items-end pb-2">
                           <label className="flex items-center gap-4 cursor-pointer group">
                              <input type="checkbox" className="w-6 h-6 border-2 border-white bg-transparent accent-white cursor-pointer" checked={editingPlayer ? editingPlayer.is_captain : playerFormData.is_captain} onChange={e => editingPlayer ? setEditingPlayer({...editingPlayer, is_captain: e.target.checked}) : setPlayerFormData({...playerFormData, is_captain: e.target.checked})} />
                              <span className="text-[10px] font-black text-white uppercase tracking-widest group-hover:text-light-gray transition-colors">CAPTAIN</span>
                           </label>
                        </div>
                     </div>
                  </div>
                  <div className="space-y-6">
                     <label className="block text-[10px] font-black text-white/50 uppercase tracking-widest">ATHLETE PERSONNEL IMAGE</label>
                     <div className="bg-white/10 p-6 border border-white/20">
                      <ImageUpload 
                        bucket="player-photos" 
                        folder={id}
                        existingUrl={editingPlayer ? editingPlayer.image_url : playerFormData.image_url}
                        onUpload={(url) => editingPlayer ? setEditingPlayer({...editingPlayer, image_url: url}) : setPlayerFormData({...playerFormData, image_url: url})}
                      />
                     </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end gap-6 mt-4 pt-8 border-t border-white/10">
                     <button type="button" onClick={() => { setShowAddPlayer(false); setEditingPlayer(null) }} className="text-white/50 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Abort</button>
                     <button type="submit" className="bg-white text-nike-black py-4 px-12 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-light-gray transition-all">
                       <Save size={16} /> {editingPlayer ? 'Execute Update' : 'Validate Personnel'}
                     </button>
                  </div>
                </form>
              </div>
            )}

            <div className="space-y-4">
               {players.map(player => (
                 <div key={player.id} className="bg-white border border-light-gray px-8 py-6 flex items-center justify-between group hover:border-nike-black transition-all">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 bg-snow overflow-hidden shrink-0 border border-light-gray">
                         {player.image_url ? <img src={player.image_url} className="w-full h-full object-cover" /> : <Users size={24} className="m-auto mt-4 text-nike-secondary/20" />}
                       </div>
                       <div>
                          <div className="flex items-center gap-3 mb-1">
                             <span className="nike-display text-4xl text-nike-black leading-none">{player.jersey_no}</span>
                             <span className="nike-headline text-xl text-nike-black">{player.name}</span>
                             {player.is_captain && <span className="text-[8px] bg-nike-black text-white px-2 py-0.5 font-black uppercase tracking-widest">C</span>}
                          </div>
                          <p className="text-[10px] text-nike-secondary font-black uppercase tracking-widest">{player.position}</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-6">
                       <div className="hidden sm:flex items-center gap-8 mr-8 text-[10px] font-black uppercase tracking-widest text-nike-secondary">
                          <div className="flex flex-col items-center">
                            <span className="text-nike-black text-xl nike-display">{player.goals}</span>
                            <span>Goals</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-nike-black text-xl nike-display">#{player.jersey_no || '00'}</span>
                            <span>Jersey</span>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                         <button onClick={() => { setEditingPlayer(player); setShowAddPlayer(false); window.scrollTo(0, 0) }} className="p-2 text-nike-black hover:text-nike-blue transition-colors">
                           <Edit2 size={18} />
                         </button>
                         <button onClick={() => handleDeletePlayer(player.id)} className="p-2 text-nike-black hover:text-nike-red transition-colors">
                           <Trash2 size={18} />
                         </button>
                       </div>
                    </div>
                 </div>
               ))}
               {players.length === 0 && (
                 <div className="py-32 text-center border-2 border-dashed border-light-gray">
                   <p className="text-nike-secondary text-[10px] font-black uppercase tracking-widest">No personnel assigned to this squad</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
