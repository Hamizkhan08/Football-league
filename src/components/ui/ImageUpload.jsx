import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImageUpload({ bucket, folder = '', onUpload, existingUrl = '' }) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(existingUrl)

  async function handleFile(e) {
    try {
      const file = e.target.files?.[0]
      if (!file) return

      // Validate
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = folder ? `${folder}/${fileName}` : fileName

      setUploading(true)

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      setPreview(publicUrl)
      onUpload(publicUrl)
      toast.success('Image uploaded successfully!')
    } catch (error) {
      console.error('Error uploading:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploading(false)
    }
  }

  function clear() {
    setPreview('')
    onUpload('')
  }

  return (
    <div className="space-y-3">
      <div className="relative group w-32 h-32 rounded-2xl bg-dark-700 border-2 border-dashed border-turf-900/50 flex flex-col items-center justify-center overflow-hidden transition-all hover:border-turf-500/50">
        {preview ? (
          <>
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <button 
              onClick={clear}
              className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <label className="cursor-pointer flex flex-col items-center gap-2 p-4 text-center">
            {uploading ? (
              <Loader2 className="animate-spin text-turf-500" />
            ) : (
              <Upload className="text-gray-500 group-hover:text-turf-400" />
            )}
            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-tight">
              {uploading ? 'Uploading...' : 'Click to Upload'}
            </span>
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFile} 
              disabled={uploading} 
            />
          </label>
        )}
      </div>
      <p className="text-[10px] text-gray-600 font-medium">Recommended: Square image, max 2MB</p>
    </div>
  )
}
