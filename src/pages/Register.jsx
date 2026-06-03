import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Auth.css'

export default function Register() {
  const [form, setForm] = useState({ jina: '', email: '', simu: '', password: '', role: 'rejareja', jiji: 'Mbeya' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuth()
  const navigate = useNavigate()

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const [success, setSuccess] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const result = await signUp(form.email, form.password, form)
      if (!result.session) {
        setSuccess('Akaunti imeundwa! Angalia barua pepe yako na uthibitishe akaunti, kisha urudi kuingia.')
        setLoading(false)
        return
      }
      navigate('/')
    } catch (err) {
      setError(err.message || 'Hitilafu imetokea. Jaribu tena.')
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <img src="/logo-light.png" alt="DukaConnect" className="auth-logo-img" />
        </Link>
        <h2>Tengeneza Akaunti</h2>
        <p className="auth-sub">Jiunge na DukaConnect leo — Bure</p>

        {error && <div className="error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Jina Kamili / Jina la Duka</label>
            <input name="jina" type="text" placeholder="Jina lako au la duka" value={form.jina} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Barua Pepe</label>
            <input name="email" type="email" placeholder="mfano@gmail.com" value={form.email} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Namba ya Simu</label>
            <input name="simu" type="tel" placeholder="+255 7XX XXX XXX" value={form.simu} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Nywila</label>
            <input name="password" type="password" placeholder="Nywila (angalau herufi 6)" value={form.password} onChange={handleChange} required minLength={6} />
          </div>
          <div className="form-group">
            <label>Wewe ni nani?</label>
            <div className="role-select">
              <button
                type="button"
                className={`role-btn ${form.role === 'rejareja' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'rejareja' })}
              >
                🏪 Rejareja
                <span>Mwenye duka ndogo</span>
              </button>
              <button
                type="button"
                className={`role-btn ${form.role === 'jumla' ? 'active' : ''}`}
                onClick={() => setForm({ ...form, role: 'jumla' })}
              >
                🚛 Jumla
                <span>Muuzaji wa jumla</span>
              </button>
            </div>
          </div>
          <div className="form-group">
            <label>Jiji</label>
            <select name="jiji" value={form.jiji} onChange={handleChange}>
              <option value="Mbeya">Mbeya</option>
              <option value="Dar es Salaam">Dar es Salaam</option>
              <option value="Mwanza">Mwanza</option>
              <option value="Arusha">Arusha</option>
              <option value="Dodoma">Dodoma</option>
            </select>
          </div>
          <button type="submit" className="btn-primary full" disabled={loading}>
            {loading ? 'Inasajili...' : 'Jisajili Sasa'}
          </button>
        </form>

        <p className="auth-switch">
          Una akaunti tayari? <Link to="/ingia">Ingia hapa</Link>
        </p>
      </div>
    </div>
  )
}
