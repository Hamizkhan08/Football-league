import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Trophy, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function Login() {
  const { signIn } = useAuth()
  const navigate    = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) { toast.error('Fill in all fields'); return }
    setLoading(true)
    const { data, error } = await signIn(email, password)
    if (error) { toast.error(error.message); setLoading(false) }
    else {
      toast.success('Welcome back! ⚽')
      const isUserAdmin = data?.user?.user_metadata?.is_admin === true
      if (isUserAdmin) {
        navigate('/admin')
      } else {
        navigate('/')
      }
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-in">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-turf-600 flex items-center justify-center mx-auto mb-4 shadow-turf-lg">
            <Trophy size={26} className="text-white" />
          </div>
          <h1 className="text-2xl font-black text-white">Sign In</h1>
          <p className="text-gray-400 text-sm mt-1">Access match management controls</p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-dark-700 border border-turf-900/50 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-turf-600 transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-dark-700 border border-turf-900/50 rounded-xl px-4 py-3 pr-10 text-white placeholder-gray-600 focus:outline-none focus:border-turf-600 transition-colors text-sm"
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 text-base font-bold disabled:opacity-60"
            >
              {loading ? 'Signing In…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/signup" className="text-turf-400 hover:text-turf-300 font-semibold">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
