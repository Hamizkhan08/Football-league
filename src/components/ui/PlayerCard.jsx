import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Target, Activity, Users, Camera, Upload, Check, Loader2 } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'

const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function PlayerCard({ player }) {
  const [isUploading, setIsUploading] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAdmin(!!session)
    })
  }, [])

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${player.id}-${Math.random()}.${fileExt}`
      const filePath = `${fileName}`

      // Upload to 'players' bucket
      const { error: uploadError } = await supabase.storage
        .from('players')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('players')
        .getPublicUrl(filePath)

      // Update player record
      const { error: updateError } = await supabase
        .from('players')
        .update({ image_url: publicUrl })
        .eq('id', player.id)

      if (updateError) throw updateError
      
      toast.success('Photo updated!')
      window.location.reload() // Simple refresh to see changes
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image')
    } finally {
      setIsUploading(false)
    }
  }
  return (
    <div className="relative group">
      <Link to={`/players/${player.id}`} className="block">
        <div className="bg-white border border-light-gray group-hover:border-nike-black transition-all overflow-hidden flex flex-col h-full">
          <div className="p-4 sm:p-6 flex items-start gap-4 sm:gap-6">
            <div className="w-16 h-20 sm:w-20 sm:h-24 bg-nike-black shrink-0 border border-nike-black overflow-hidden relative group/img shadow-lg">
              {player.image_url ? (
                <img src={player.image_url} className="w-full h-full object-cover" alt={player.name} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-nike-black to-nike-secondary text-white">
                  <span className="nike-display text-2xl sm:text-3xl tracking-tighter leading-none">{getInitials(player.name)}</span>
                  <div className="w-4 h-0.5 bg-nike-red mt-1 opacity-50"></div>
                </div>
              )}
              
              {/* Admin Upload Trigger */}
              {isAdmin && (
                <div className="absolute inset-0 bg-nike-black/60 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity cursor-pointer">
                  {isUploading ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <label className="cursor-pointer p-full w-full h-full flex items-center justify-center">
                      <Camera size={20} className="text-white" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
                    </label>
                  )}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
              <div className="flex items-start justify-between mb-1">
                <span className="nike-display text-4xl sm:text-5xl text-nike-black leading-none">{player.jersey_no || '00'}</span>
                {player.is_captain && (
                  <span className="text-[7px] sm:text-[8px] bg-nike-red text-white px-2 py-0.5 font-black uppercase tracking-widest italic shadow-sm">Captain</span>
                )}
              </div>
              <h3 className="nike-headline text-lg sm:text-2xl mb-1 truncate uppercase italic leading-none">{player.name}</h3>
              <p className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.2em] text-nike-secondary truncate mb-3">{player.team?.name}</p>
              
              {/* Mini Stats Grid */}
              <div className="flex items-center gap-6 mt-1 pt-3 border-t border-light-gray">
                <div className="flex flex-col">
                  <span className="text-sm font-black leading-none text-nike-black">{player.matches_played || 0}</span>
                  <span className="text-[8px] font-black text-nike-secondary uppercase tracking-[0.1em] mt-1">Appearance</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-black text-nike-red leading-none">{player.goals || 0}</span>
                  <span className="text-[8px] font-black text-nike-secondary uppercase tracking-[0.1em] mt-1">Goals</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-auto px-4 sm:px-6 py-3 sm:py-4 bg-snow border-t border-light-gray flex items-center justify-between">
            <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-nike-secondary border border-light-gray px-3 py-1 bg-white">
              {player.position}
            </span>
          </div>
        </div>
      </Link>
    </div>
  )
}
