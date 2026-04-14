import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Menu, X, Trophy, LogOut, User } from 'lucide-react'
import toast from 'react-hot-toast'

const navLinks = [
  { to: '/',             label: 'Home' },
  { to: '/teams',        label: 'Teams' },
  { to: '/points-table', label: 'Points Table' },
  { to: '/top-scorers',  label: 'Top Scorers' },
  { to: '/schedule',     label: 'Schedule' },
  { to: '/knockout',     label: 'Knockout' },
]

export default function Navbar() {
  const { user, signOut, isAdmin } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navigate = useNavigate()

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) toast.error('Sign out failed')
    else { toast.success('Signed out'); navigate('/') }
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <Trophy size={28} className="text-nike-black stroke-[2.5px]" />
            <div className="leading-tight">
              <span className="text-nike-black font-nike font-black text-2xl uppercase tracking-tighter">CPL 2026</span>
              <p className="text-[8px] font-black text-nike-secondary uppercase tracking-[0.2em] leading-none">College Premier League</p>
            </div>
          </Link>

          {/* Desktop Nav - Centered */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `text-sm font-bold uppercase tracking-wide transition-all duration-200 relative py-1 ${
                    isActive
                      ? 'text-nike-black after:absolute after:bottom-0 after:left-0 after:w-full after:h-[2px] after:bg-nike-black font-black'
                      : 'text-nike-black hover:text-nike-secondary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Admin-only section */}
          <div className="hidden md:flex items-center gap-6">
            {isAdmin && (
              <>
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `text-sm font-bold uppercase tracking-wide transition-all duration-200 ${
                      isActive ? 'text-nike-red' : 'text-nike-black hover:text-nike-red'
                    }`
                  }
                >
                  ADMIN
                </NavLink>
                
                <div className="h-6 w-[1px] bg-light-gray" />

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-nike bg-snow text-nike-black text-xs font-bold border border-light-gray">
                    <User size={14} className="stroke-[2.5px]" />
                    <span className="max-w-[100px] truncate uppercase">{user?.email.split('@')[0]}</span>
                  </div>
                  <button onClick={handleSignOut} className="text-nike-black hover:text-nike-red transition-all">
                    <LogOut size={20} className="stroke-[2.5px]" />
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile menu btn */}
          <button
            className="md:hidden p-2 rounded-nike text-nike-black hover:bg-light-gray transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-light-gray animate-fade-in absolute w-full left-0 shadow-xl overflow-hidden">
          <div className="px-4 pt-6 pb-8 space-y-4">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `block text-2xl font-nike font-black uppercase tracking-tighter ${
                    isActive ? 'text-nike-black' : 'text-nike-secondary'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            {isAdmin && (
              <>
                <div className="h-[1px] bg-light-gray my-4" />
                <NavLink
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  className="block text-2xl font-nike font-black uppercase tracking-tighter text-nike-red"
                >
                  ADMIN
                </NavLink>
                <div className="pt-4">
                  <button onClick={handleSignOut} className="btn-primary w-full justify-center flex items-center gap-2 py-4">
                    <LogOut size={20} /> SIGN OUT
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
