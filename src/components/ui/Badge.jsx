export function Badge({ variant = 'default', children, className = '' }) {
  const variants = {
    default:   'bg-light-gray text-nike-secondary border border-border-secondary',
    green:     'bg-nike-black text-white',
    blue:      'bg-light-gray text-nike-blue border border-border-secondary',
    red:       'bg-nike-red text-white',
    gold:      'bg-nike-black text-white',
    silver:    'bg-light-gray text-nike-secondary border border-border-secondary',
    poolA:     'bg-nike-black text-white',
    poolB:     'bg-light-gray text-nike-black border border-border-secondary',
    live:      'bg-nike-red text-white animate-pulse',
    upcoming:  'bg-light-gray text-nike-secondary border border-border-secondary',
    completed: 'bg-nike-black text-white',
    captain:   'bg-nike-black text-white',
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-nike text-[10px] font-black uppercase tracking-widest ${variants[variant] ?? variants.default} ${className}`}>
      {variant === 'live' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />}
      {children}
    </span>
  )
}
