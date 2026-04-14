import { Clock } from 'lucide-react'

export default function GoalEvent({ goal, isRight }) {
  const name = goal.player?.name || 'Unknown'
  const team = goal.team?.name || ''

  return (
    <div className={`flex items-center gap-2 py-1.5 animate-fade-in ${isRight ? 'flex-row-reverse' : ''}`}>
      <span className="text-green-400 text-base">⚽</span>
      <div className={`flex-1 ${isRight ? 'text-right' : ''}`}>
        <span className="text-white text-sm font-semibold">{name}</span>
        <span className="text-gray-500 text-xs ml-2">({team})</span>
      </div>
      <div className="flex items-center gap-1 text-gray-500 text-xs flex-shrink-0">
        <Clock size={10} />
        <span>{goal.minute}'</span>
      </div>
    </div>
  )
}
