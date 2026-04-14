import { TrendingUp } from 'lucide-react'

export default function PoolTable({ standings, poolName, qualifiersCount = 2 }) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <TrendingUp size={18} className="text-nike-black stroke-[2.5px]" />
        <h3 className="font-nike font-black text-2xl uppercase tracking-tight">Pool {poolName} Standings</h3>
      </div>

      <div className="overflow-x-auto border border-light-gray">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-nike-black text-white">
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest w-8">#</th>
              <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest">Team</th>
              <th className="text-center px-3 py-3 text-[10px] font-black uppercase tracking-widest">MP</th>
              <th className="text-center px-3 py-3 text-[10px] font-black uppercase tracking-widest">W</th>
              <th className="text-center px-3 py-3 text-[10px] font-black uppercase tracking-widest">D</th>
              <th className="text-center px-3 py-3 text-[10px] font-black uppercase tracking-widest">L</th>
              <th className="text-center px-3 py-3 text-[10px] font-black uppercase tracking-widest hidden sm:table-cell">GD</th>
              <th className="text-center px-4 py-3 text-[10px] font-black uppercase tracking-widest">Pts</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((row, idx) => {
              const isQualified = idx < qualifiersCount
              const isFirst     = idx === 0
              return (
                <tr
                  key={row.team.id}
                  className={`border-b border-light-gray transition-colors ${
                    isFirst
                      ? 'bg-snow border-l-4 border-l-nike-black'
                      : isQualified
                      ? 'bg-white border-l-4 border-l-border-secondary'
                      : 'bg-white hover:bg-snow'
                  }`}
                >
                  <td className="px-4 py-3.5">
                    {isFirst ? <span className="text-base">🥇</span>
                     : idx === 1 ? <span className="text-base">🥈</span>
                     : <span className="text-nike-secondary font-bold text-xs">{idx + 1}</span>}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 bg-light-gray flex items-center justify-center text-nike-black text-xs font-black overflow-hidden flex-shrink-0">
                        {row.team.logo_url
                          ? <img src={row.team.logo_url} alt={row.team.name} className="w-full h-full object-cover" />
                          : row.team.name.split(' ').slice(0,2).map(w=>w[0]).join('')}
                      </div>
                      <span className={`font-bold text-sm ${isQualified ? 'text-nike-black' : 'text-nike-secondary'}`}>{row.team.name}</span>
                      {isQualified && (
                        <span className="hidden sm:inline text-[9px] bg-nike-black text-white px-2 py-0.5 font-black uppercase tracking-widest">Q</span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-3.5 text-center text-nike-secondary font-bold tabular-nums">{row.mp}</td>
                  <td className="px-3 py-3.5 text-center text-nike-black font-black tabular-nums">{row.w}</td>
                  <td className="px-3 py-3.5 text-center text-nike-secondary font-bold tabular-nums">{row.d}</td>
                  <td className="px-3 py-3.5 text-center text-nike-secondary font-bold tabular-nums">{row.l}</td>
                  <td className={`px-3 py-3.5 text-center font-bold tabular-nums hidden sm:table-cell ${row.gd > 0 ? 'text-nike-black' : row.gd < 0 ? 'text-nike-red' : 'text-nike-secondary'}`}>
                    {row.gd > 0 ? `+${row.gd}` : row.gd}
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span className={`inline-flex items-center justify-center w-9 h-9 font-black text-base ${
                      isFirst ? 'bg-nike-black text-white'
                      : isQualified ? 'bg-light-gray text-nike-black border border-border-secondary'
                      : 'text-nike-secondary'
                    }`}>
                      {row.pts}
                    </span>
                  </td>
                </tr>
              )
            })}
            {standings.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-10 text-nike-secondary font-bold uppercase tracking-widest text-xs">No matches played yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-nike-secondary mt-3 flex items-center gap-2 font-black uppercase tracking-widest">
        <span className="w-3 h-3 bg-nike-black inline-block" />
        Top {qualifiersCount} teams advance to Semi-Finals
      </p>
    </div>
  )
}
