import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'

import Home           from './pages/Home'
import Teams          from './pages/Teams'
import TeamDetail     from './pages/TeamDetail'
import Bracket        from './pages/Bracket'
import PlayerDetail   from './pages/PlayerDetail'
import PointsTable    from './pages/PointsTable'
import TopScorers     from './pages/TopScorers'
import MatchSchedule  from './pages/MatchSchedule'
import LiveMatchDetail from './pages/LiveMatchDetail'
import Login          from './pages/auth/Login'
import Signup         from './pages/auth/Signup'

// Admin Pages
import AdminDashboard       from './pages/admin/Dashboard'
import ManageTeams        from './pages/admin/ManageTeams'
import TeamManagementDetail from './pages/admin/TeamManagementDetail'
import ManagePlayers      from './pages/admin/ManagePlayers'
import ManageMatches      from './pages/admin/ManageMatches'
import TournamentSettings from './pages/admin/TournamentSettings'
import ManageQualification from './pages/admin/ManageQualification'
import LiveMatchAdmin      from './pages/admin/LiveMatchAdmin'
import ManageSponsors      from './pages/admin/ManageSponsors'

/**
 * Higher-order component to protect admin-only routes
 */
function PrivateRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth()
  if (loading) return null
  if (!user || !isAdmin) return <Navigate to="/admin" replace />
  return children
}

function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-4">
      <div className="text-6xl">⚽</div>
      <h1 className="text-3xl font-black text-white">404 — Off the Pitch</h1>
      <p className="text-gray-500">This page doesn't exist.</p>
      <a href="/" className="btn-primary mt-2">Go Home</a>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/"              element={<Home />} />
            <Route path="/teams"         element={<Teams />} />
            <Route path="/teams/:id"     element={<TeamDetail />} />
            <Route path="/players/:id"   element={<PlayerDetail />} />
            <Route path="/points-table"  element={<PointsTable />} />
            <Route path="/top-scorers"   element={<TopScorers />} />
            <Route path="/schedule"      element={<MatchSchedule />} />
            <Route path="/knockout"      element={<Bracket />} />
            <Route path="/match/:id"     element={<LiveMatchDetail />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/signup"        element={<Signup />} />

            {/* Admin Routes */}
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/admin/settings" element={<AdminRoute><TournamentSettings /></AdminRoute>} />
            <Route path="/admin/teams" element={<AdminRoute><ManageTeams /></AdminRoute>} />
            <Route path="/admin/teams/:id" element={<AdminRoute><TeamManagementDetail /></AdminRoute>} />
            <Route path="/admin/players" element={<AdminRoute><ManagePlayers /></AdminRoute>} />
            <Route path="/admin/matches" element={<AdminRoute><ManageMatches /></AdminRoute>} />
            <Route path="/admin/qualifications" element={<AdminRoute><ManageQualification /></AdminRoute>} />
            <Route path="/admin/matches/:id/control" element={<AdminRoute><LiveMatchAdmin /></AdminRoute>} />
            <Route path="/admin/sponsors" element={<AdminRoute><ManageSponsors /></AdminRoute>} />

            <Route path="*"              element={<NotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </BrowserRouter>
  )
}

