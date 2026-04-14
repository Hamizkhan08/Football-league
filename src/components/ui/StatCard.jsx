export default function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-light-gray p-6 flex flex-col gap-3 group hover:bg-hover-gray transition-colors duration-200">
      <div className="flex items-center justify-between">
        <p className="text-nike-secondary text-[10px] font-black uppercase tracking-[0.2em]">{label}</p>
        {Icon && <Icon size={16} className="text-border-primary stroke-[2px]" />}
      </div>
      <p className="text-nike-black text-4xl font-black leading-none tabular-nums">{value}</p>
      {sub && <p className="text-nike-secondary text-[10px] font-bold uppercase tracking-widest">{sub}</p>}
    </div>
  )
}
