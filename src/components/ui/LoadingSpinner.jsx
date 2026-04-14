export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' }
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <div className={`${sizes[size]} border-2 border-light-gray border-t-nike-black rounded-full animate-spin`} />
      {text && <p className="text-nike-secondary text-xs font-bold uppercase tracking-widest">{text}</p>}
    </div>
  )
}

export function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-6">
        <div className="w-16 h-16 border-2 border-light-gray border-t-nike-black rounded-full animate-spin" />
        <p className="text-nike-secondary text-xs font-black uppercase tracking-[0.3em]">Loading</p>
      </div>
    </div>
  )
}
