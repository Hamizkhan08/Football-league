import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function SponsorTicker() {
  const [sponsors, setSponsors] = useState([])

  useEffect(() => {
    const fetchSponsors = async () => {
      const { data } = await supabase.from('sponsors').select('*').order('created_at', { ascending: true })
      setSponsors(data || [])
    }
    fetchSponsors()
  }, [])

  if (sponsors.length === 0) return null

  // Duplicate the array to create a seamless infinite scroll effect
  const tickerItems = [...sponsors, ...sponsors, ...sponsors, ...sponsors]

  return (
    <div className="w-full bg-snow border-y border-light-gray py-8 overflow-hidden group">
      <div className="flex items-center gap-12 whitespace-nowrap animate-ticker group-hover:[animation-play-state:paused]">
        {tickerItems.map((sponsor, idx) => (
          <div 
            key={`${sponsor.id}-${idx}`}
            className="flex items-center gap-4 transition-all duration-300 px-8 grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
          >
            <div className="h-10 md:h-12 w-auto">
              <img 
                src={sponsor.logo_url} 
                alt={sponsor.name}
                className="h-full w-auto object-contain"
              />
            </div>
            <span className="nike-display text-xl md:text-2xl italic uppercase text-nike-black/20">
              {sponsor.name}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          display: flex;
          width: fit-content;
          animation: ticker 40s linear infinite;
        }
      `}</style>
    </div>
  )
}
