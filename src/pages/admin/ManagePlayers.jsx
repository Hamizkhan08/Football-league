import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, Plus, Edit2, Trash2, Save, X, Search, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function ManagePlayers() {
  const [players, setPlayers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [teamFilter, setTeamFilter] = useState('all')
  const [editingPlayer, setEditingPlayer] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [photoFile, setPhotoFile] = useState(null)
  const [formData, setFormData] = useState({ 
    name: '', team_id: '', jersey_no: '', position: 'Forward', is_captain: false 
  })

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    setLoading(true)
    const [playersRes, teamsRes] = await Promise.all([
      supabase.from('players').select('*, team:team_id(name)').order('name'),
      supabase.from('teams').select('id, name').order('name')
    ])
    
    if (playersRes.error) toast.error('Error fetching players')
    else setPlayers(playersRes.data)
    
    if (teamsRes.error) toast.error('Error fetching teams')
    else {
      setTeams(teamsRes.data)
      if (teamsRes.data.length > 0) setFormData(prev => ({ ...prev, team_id: teamsRes.data[0].id }))
    }
    setLoading(false)
  }

  async function handleFileUpload(file) {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
    
    const { error: uploadError } = await supabase.storage
      .from('players')
      .upload(fileName, file)

    if (uploadError) throw uploadError

    const { data: uploadData } = supabase.storage
      .from('players')
      .getPublicUrl(fileName)
      
    return uploadData.publicUrl
  }

  async function handleAdd(e) {
    e.preventDefault()
    setIsUploading(true)
    try {
      let publicUrl = null
      if (photoFile) {
        publicUrl = await handleFileUpload(photoFile)
      }

      const payload = { ...formData, image_url: publicUrl }
      const { data, error } = await supabase.from('players').insert([payload]).select()
      
      if (error) throw error
      
      toast.success('Player added successfully!')
      setPlayers([...players, { ...data[0], team: teams.find(t => t.id === formData.team_id) }])
      setFormData({ name: '', jersey_no: '', is_captain: false, team_id: formData.team_id, position: 'Forward' })
      setPhotoFile(null)
      setShowAddForm(false)
    } catch (err) {
      console.error(err)
      toast.error('Failed to register player')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleUpdate(e) {
    e.preventDefault()
    setIsUploading(true)
    try {
      let publicUrl = editingPlayer.image_url
      
      if (photoFile) {
        publicUrl = await handleFileUpload(photoFile)
      }

      const { team, ...updateData } = editingPlayer
      const payload = { ...updateData, image_url: publicUrl }
      
      const { error } = await supabase.from('players').update(payload).eq('id', payload.id)
      if (error) throw error
      
      toast.success('Player updated!')
      setPlayers(players.map(p => p.id === payload.id ? { ...payload, team: teams.find(t => t.id === payload.team_id) } : p))
      setEditingPlayer(null)
      setPhotoFile(null)
    } catch (err) {
      console.error(err)
      toast.error('Failed to update player')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleDelete(id, imageUrl) {
    if (!confirm('Are you sure?')) return
    
    if (imageUrl) {
      const fileName = imageUrl.split('/').pop()
      if (fileName) {
         await supabase.storage.from('players').remove([fileName]).catch(console.error)
      }
    }
    
    const { error } = await supabase.from('players').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Player removed')
      setPlayers(players.filter(p => p.id !== id))
    }
  }

  const filteredPlayers = players.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase())
    const matchesTeam = teamFilter === 'all' || p.team_id === teamFilter
    return matchesSearch && matchesTeam
  })

  if (loading && players.length === 0) return <PageLoader />

  return (
    <div className="animate-in pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-16 border-b border-light-gray flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <p className="section-subtitle mb-3">Team Management</p>
          <h1 className="nike-display text-6xl md:text-8xl uppercase">Athletes</h1>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary py-4 px-8 text-[10px] font-black uppercase tracking-widest flex items-center gap-2"
        >
          {showAddForm ? <X size={16} /> : <Plus size={16} />} 
          {showAddForm ? 'CANCEL' : 'REGISTER PLAYER'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-10">
        {/* Add/Edit Form */}
        {(showAddForm || editingPlayer) && (
          <div className="bg-nike-black p-8 border border-nike-black mb-12 animate-slide-in">
            <h2 className="nike-headline text-white text-3xl mb-8 uppercase">
              {editingPlayer ? 'Modify Athlete Bio' : 'Register New Talent'}
            </h2>
            <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" onSubmit={editingPlayer ? handleUpdate : handleAdd}>
              <div className="space-y-2 lg:col-span-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Athlete Name</label>
                <input 
                  required
                  placeholder="Full Legal Name"
                  className="w-full bg-white border border-light-gray px-4 py-3 text-sm font-bold focus:outline-none"
                  value={editingPlayer ? editingPlayer.name : formData.name}
                  onChange={e => editingPlayer 
                    ? setEditingPlayer({...editingPlayer, name: e.target.value}) 
                    : setFormData({...formData, name: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Contracted Team</label>
                <select 
                  required
                  className="w-full bg-white border border-light-gray px-4 py-3 text-sm font-bold focus:outline-none"
                  value={editingPlayer ? editingPlayer.team_id : formData.team_id}
                  onChange={e => editingPlayer 
                    ? setEditingPlayer({...editingPlayer, team_id: e.target.value}) 
                    : setFormData({...formData, team_id: e.target.value})}
                >
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">On-Field Position</label>
                <select 
                  className="w-full bg-white border border-light-gray px-4 py-3 text-sm font-bold focus:outline-none"
                  value={editingPlayer ? editingPlayer.position : formData.position}
                  onChange={e => editingPlayer 
                    ? setEditingPlayer({...editingPlayer, position: e.target.value}) 
                    : setFormData({...formData, position: e.target.value})}
                >
                  <option value="Forward">Forward</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Defender">Defender</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Kit Number (#)</label>
                <input 
                  type="number"
                  placeholder="00"
                  className="w-full bg-white border border-light-gray px-4 py-3 text-sm font-bold focus:outline-none"
                  value={editingPlayer ? editingPlayer.jersey_no : formData.jersey_no}
                  onChange={e => editingPlayer 
                    ? setEditingPlayer({...editingPlayer, jersey_no: parseInt(e.target.value)}) 
                    : setFormData({...formData, jersey_no: parseInt(e.target.value)})}
                />
              </div>

              <div className="lg:col-span-2 space-y-2">
                 <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Personnel Image (Optional)</label>
                 <div className="w-full bg-white px-4 py-3 flex items-center justify-between border border-light-gray focus-within:ring-2 focus-within:ring-nike-red">
                  <span className="text-xs font-black uppercase tracking-widest text-nike-black truncate">
                    {photoFile ? photoFile.name : (editingPlayer?.image_url ? 'Existing photo linked...' : 'Choose file...')}
                  </span>
                  <label className="cursor-pointer bg-nike-black text-white px-3 py-1 text-[10px] uppercase font-black tracking-widest hover:bg-nike-secondary transition-colors">
                    Browse
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={e => setPhotoFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 lg:col-span-1">
                <input 
                  type="checkbox"
                  id="is_captain"
                  className="w-6 h-6 border-2 border-white bg-transparent accent-white cursor-pointer"
                  checked={editingPlayer ? editingPlayer.is_captain : formData.is_captain}
                  onChange={e => editingPlayer 
                    ? setEditingPlayer({...editingPlayer, is_captain: e.target.checked}) 
                    : setFormData({...formData, is_captain: e.target.checked})}
                />
                <label htmlFor="is_captain" className="text-[10px] font-black text-white uppercase tracking-widest cursor-pointer">TEAM CAPTAIN</label>
              </div>

              <div className="flex items-end">
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className="w-full bg-white text-nike-black font-black uppercase tracking-widest text-[10px] py-4 hover:bg-light-gray transition-all disabled:opacity-50"
                >
                  {isUploading ? 'Processing...' : (editingPlayer ? 'Apply Updates' : 'Authorize Entry')}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters & Search */}
        <div className="space-y-6 mb-12">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-nike-secondary" />
              <input 
                placeholder="SEARCH ATHLETE BY NAME..."
                className="w-full bg-snow border border-light-gray pl-16 pr-6 py-5 text-sm font-black uppercase tracking-widest focus:outline-none focus:border-nike-black"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-4 bg-snow border border-light-gray pl-6 pr-4 py-2">
              <Filter size={16} className="text-nike-secondary" />
              <select 
                className="bg-transparent text-[10px] font-black uppercase tracking-widest text-nike-black focus:outline-none min-w-[150px]"
                value={teamFilter}
                onChange={e => setTeamFilter(e.target.value)}
              >
                <option value="all">ALL SQUADS</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Athletes Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map(player => (
            <div key={player.id} className="bg-white border border-light-gray group hover:border-nike-black transition-all overflow-hidden flex flex-col">
              <div className="p-8 flex items-start gap-6">
                <div className="w-20 h-24 bg-light-gray shrink-0 border border-light-gray overflow-hidden">
                  {player.image_url ? (
                    <img src={player.image_url} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Users size={32} className="text-nike-secondary/30" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <span className="nike-display text-4xl text-nike-black leading-none">{player.jersey_no}</span>
                    {player.is_captain && (
                      <span className="text-[8px] bg-nike-black text-white px-2 py-0.5 font-black uppercase tracking-widest">Captain</span>
                    )}
                  </div>
                  <h3 className="nike-headline text-2xl mb-1 truncate">{player.name}</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-nike-secondary truncate mb-4">{player.team?.name}</p>
                </div>
              </div>
              
              <div className="mt-auto px-8 py-6 bg-snow border-t border-light-gray flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-widest text-nike-secondary border border-light-gray px-3 py-1 bg-white">
                  {player.position}
                </span>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => { setEditingPlayer(player); setShowAddForm(false); window.scrollTo(0, 0) }}
                    className="text-nike-black hover:text-nike-secondary transition-colors"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(player.id, player.image_url)}
                    className="text-nike-black hover:text-nike-red transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredPlayers.length === 0 && (
          <div className="py-32 text-center border-2 border-dashed border-light-gray">
            <p className="text-nike-secondary text-[10px] font-black uppercase tracking-widest">No matching personnel discovered</p>
          </div>
        )}
      </div>
    </div>
  )
}
