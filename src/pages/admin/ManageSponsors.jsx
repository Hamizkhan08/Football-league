import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Plus, Trash2, Globe, Image as ImageIcon, X } from 'lucide-react'
import toast from 'react-hot-toast'
import { PageLoader } from '../../components/ui/LoadingSpinner'

export default function ManageSponsors() {
  const [sponsors, setSponsors] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', logo_url: '', website_url: '' })

  useEffect(() => {
    fetchSponsors()
  }, [])

  async function fetchSponsors() {
    setLoading(true)
    const { data, error } = await supabase.from('sponsors').select('*').order('created_at', { ascending: true })
    if (error) {
      console.error('Error fetching sponsors:', error)
      toast.error('Error fetching sponsors')
    } else {
      setSponsors(data || [])
    }
    setLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const { data, error } = await supabase.from('sponsors').insert([formData]).select().single()
    
    if (error) toast.error(error.message)
    else {
      toast.success('Sponsor added!')
      setSponsors([...sponsors, data])
      setFormData({ name: '', logo_url: '', website_url: '' })
      setShowForm(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure? This will remove the sponsor from the ticker.')) return
    const { error } = await supabase.from('sponsors').delete().eq('id', id)
    if (error) toast.error(error.message)
    else {
      toast.success('Sponsor removed')
      setSponsors(sponsors.filter(s => s.id !== id))
    }
  }

  if (loading && sponsors.length === 0) return <PageLoader />

  return (
    <div className="animate-in pb-20">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12 border-b border-light-gray flex flex-col xl:flex-row xl:items-end justify-between gap-10">
        <div>
          <p className="section-subtitle">Tournament Partners</p>
          <h1 className="nike-display text-5xl md:text-8xl italic uppercase leading-none">Sponsors</h1>
        </div>
        
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-nike-black text-white py-4 px-10 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-nike-secondary transition-all"
        >
          {showForm ? <X size={16} /> : <Plus size={16} />} 
          {showForm ? 'Cancel' : 'Add Sponsor'}
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 py-12">
        {/* Form */}
        {showForm && (
          <div className="bg-nike-black p-8 border border-nike-black mb-12 animate-slide-in">
            <h2 className="nike-headline text-white text-3xl mb-6 uppercase tracking-tight italic">New Partner</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Brand Name</label>
                <input 
                  required
                  type="text"
                  placeholder="e.g. Nike"
                  className="w-full bg-white border-0 px-4 py-4 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-nike-red outline-none"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Logo URL (SVG Preferred)</label>
                <input 
                  required
                  type="url"
                  placeholder="https://..."
                  className="w-full bg-white border-0 px-4 py-4 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-nike-red outline-none"
                  value={formData.logo_url}
                  onChange={e => setFormData({...formData, logo_url: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-widest">Website URL (Optional)</label>
                <input 
                  type="url"
                  placeholder="https://..."
                  className="w-full bg-white border-0 px-4 py-4 text-xs font-black uppercase tracking-widest focus:ring-2 focus:ring-nike-red outline-none"
                  value={formData.website_url}
                  onChange={e => setFormData({...formData, website_url: e.target.value})}
                />
              </div>
              <div className="lg:col-span-3 flex justify-end gap-4 mt-4">
                 <button type="submit" className="bg-white text-nike-black font-black uppercase tracking-widest text-[10px] py-4 px-12 hover:bg-light-gray transition-all">
                   Save Partner
                 </button>
              </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sponsors.map(sponsor => (
            <div key={sponsor.id} className="bg-white border border-light-gray p-8 flex flex-col items-center group relative shadow-sm hover:shadow-xl transition-all">
              <button 
                onClick={() => handleDelete(sponsor.id)}
                className="absolute top-4 right-4 text-light-gray hover:text-nike-red opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={18} />
              </button>
              
              <div className="h-24 w-full flex items-center justify-center mb-6">
                <img 
                  src={sponsor.logo_url} 
                  alt={sponsor.name}
                  className="h-full w-auto object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
              
              <h3 className="nike-headline text-xl uppercase italic mb-2">{sponsor.name}</h3>
              
              {sponsor.website_url && (
                <a 
                  href={sponsor.website_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-[10px] font-black text-nike-secondary hover:text-nike-black uppercase tracking-widest flex items-center gap-2"
                >
                  <Globe size={12} /> Visit Site
                </a>
              )}
            </div>
          ))}
          
          {sponsors.length === 0 && (
            <div className="col-span-full py-24 text-center border-2 border-dashed border-light-gray">
               <ImageIcon size={48} className="mx-auto text-light-gray mb-4" />
               <p className="nike-headline text-nike-secondary italic uppercase text-xl">No sponsors registered</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
