import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError('Barua pepe au nywila si sahihi. Jaribu tena.')
    }
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img src="/logo-light.png" alt="DukaConnect" className="auth-logo-img" />
        </Link>
        <h2>Karibu Tena</h2>
        <p className="auth-sub">Ingia kwenye akaunti yako</p>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Barua Pepe</label>
            <input
              type="email"
              placeholder="mfano@gmail.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Nywila</label>
            <input
              type="password"
              placeholder="Nywila yako"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary full" disabled={loading}>
            {loading ? 'Inaingia...' : 'Ingia'}
          </button>
        </form>

        <p className="auth-switch">
          Huna akaunti? <Link to="/jisajili">Jisajili hapa</Link>
        </p>
      </div>
    </div>
  )
}
