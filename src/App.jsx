import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import RejarejaDashboard from './pages/RejarejaDashboard'
import JumlaDashboard from './pages/JumlaDashboard'
import Settings from './pages/Settings'
import './App.css'

function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()
  if (loading) return <div className="loading"><div className="spinner"></div><p>Inapakia...</p></div>
  if (!user) return <Navigate to="/ingia" />
  if (role && profile?.role !== role) return <Navigate to="/" />
  return children
}

function AppRoutes() {
  const { user, profile, loading } = useAuth()

  if (loading) return <div className="loading"><div className="spinner"></div><p>Inapakia...</p></div>

  return (
    <Routes>
      <Route path="/" element={
        user
          ? profile?.role === 'jumla'
            ? <Navigate to="/jumla" />
            : <Navigate to="/rejareja" />
          : <Landing />
      } />
      <Route path="/ingia" element={<Login />} />
      <Route path="/jisajili" element={<Register />} />
      <Route path="/rejareja" element={
        <ProtectedRoute role="rejareja"><RejarejaDashboard /></ProtectedRoute>
      } />
      <Route path="/jumla" element={
        <ProtectedRoute role="jumla"><JumlaDashboard /></ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute><Settings /></ProtectedRoute>
      } />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
