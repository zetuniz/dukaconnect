import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../firebase/config'
import { ArrowLeft, User, Lock, LogOut } from 'lucide-react'
import './Settings.css'

const MIJI = ['Mbeya', 'Dar es Salaam', 'Mwanza', 'Arusha', 'Dodoma', 'Moshi', 'Tanga', 'Morogoro']

export default function Settings() {
  const { profile, user, signOut } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    jina: profile?.jina || '',
    simu: profile?.simu || '',
    jiji: profile?.jiji || 'Mbeya',
  })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState('success')

  // Password change
  const [pwForm, setPwForm] = useState({ current: '', mpya: '', thibitisha: '' })
  const [savingPw, setSavingPw] = useState(false)
  const [showPw, setShowPw] = useState(false)

  function backPath() {
    return profile?.role === 'jumla' ? '/jumla' : '/rejareja'
  }

  function showMsg(text, type = 'success') {
    setMsg(text)
    setMsgType(type)
    setTimeout(() => setMsg(''), 4000)
  }

  async function saveProfile(e) {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase
      .from('profiles')
      .update({ jina: form.jina, simu: form.simu, jiji: form.jiji })
      .eq('id', user.id)

    if (!error) {
      showMsg('✅ Maelezo yamehifadhiwa!')
      // Refresh profile in context by reloading page
      window.location.reload()
    } else {
      showMsg('❌ Hitilafu imetokea. Jaribu tena.', 'error')
    }
    setSaving(false)
  }

  async function changePassword(e) {
    e.preventDefault()
    if (pwForm.mpya !== pwForm.thibitisha) {
      showMsg('❌ Nywila mpya hazifanani.', 'error')
      return
    }
    if (pwForm.mpya.length < 6) {
      showMsg('❌ Nywila lazima iwe na herufi 6 au zaidi.', 'error')
      return
    }
    setSavingPw(true)
    const { error } = await supabase.auth.updateUser({ password: pwForm.mpya })
    if (!error) {
      showMsg('✅ Nywila imebadilishwa!')
      setPwForm({ current: '', mpya: '', thibitisha: '' })
      setShowPw(false)
    } else {
      showMsg('❌ ' + (error.message || 'Hitilafu imetokea.'), 'error')
    }
    setSavingPw(false)
  }

  return (
    <div className="settings-page">
      <header className="settings-header">
        <button className="btn-back-header" onClick={() => navigate(backPath())}>
          <ArrowLeft size={16} /> Rudi
        </button>
        <div className="dash-logo">
          <img src="/logo-light.png" alt="DukaConnect" className="dash-logo-img" />
        </div>
        <div style={{ width: 80 }} />
      </header>

      {msg && (
        <div className={`settings-msg ${msgType === 'error' ? 'msg-error' : 'msg-success'}`}>
          {msg}
        </div>
      )}

      <div className="settings-content">

        {/* AVATAR SECTION */}
        <div className="profile-hero">
          <div className="profile-avatar">
            {profile?.role === 'jumla' ? '🚛' : '🏪'}
          </div>
          <div>
            <h1 className="profile-name">{profile?.jina}</h1>
            <span className="profile-role-badge">
              {profile?.role === 'jumla' ? 'Muuzaji wa Jumla' : 'Duka la Rejareja'}
            </span>
            <p className="profile-email">{user?.email}</p>
          </div>
        </div>

        {/* PROFILE FORM */}
        <div className="settings-card">
          <h2 className="settings-card-title"><User size={18} /> Badilisha Maelezo</h2>
          <form onSubmit={saveProfile}>
            <div className="form-group">
              <label>Jina Kamili / Jina la Duka</label>
              <input
                type="text"
                value={form.jina}
                onChange={e => setForm({ ...form, jina: e.target.value })}
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Namba ya Simu</label>
                <input
                  type="tel"
                  value={form.simu}
                  onChange={e => setForm({ ...form, simu: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Jiji</label>
                <select value={form.jiji} onChange={e => setForm({ ...form, jiji: e.target.value })}>
                  {MIJI.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
              </div>
            </div>
            <div className="settings-readonly">
              <label>Barua Pepe</label>
              <div className="readonly-value">{user?.email}</div>
              <span className="readonly-note">Barua pepe haiwezi kubadilishwa</span>
            </div>
            <button type="submit" className="btn-primary full" disabled={saving}>
              {saving ? 'Inahifadhi...' : 'Hifadhi Mabadiliko'}
            </button>
          </form>
        </div>

        {/* PASSWORD SECTION */}
        <div className="settings-card">
          <div className="settings-card-header">
            <h2 className="settings-card-title"><Lock size={18} /> Nywila</h2>
            <button className="btn-toggle-pw" onClick={() => setShowPw(!showPw)}>
              {showPw ? 'Ficha' : 'Badilisha Nywila'}
            </button>
          </div>

          {showPw && (
            <form onSubmit={changePassword} className="pw-form">
              <div className="form-group">
                <label>Nywila Mpya</label>
                <input
                  type="password"
                  placeholder="Nywila mpya (herufi 6+)"
                  value={pwForm.mpya}
                  onChange={e => setPwForm({ ...pwForm, mpya: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="form-group">
                <label>Thibitisha Nywila Mpya</label>
                <input
                  type="password"
                  placeholder="Rudia nywila mpya"
                  value={pwForm.thibitisha}
                  onChange={e => setPwForm({ ...pwForm, thibitisha: e.target.value })}
                  required
                  minLength={6}
                />
              </div>
              <div className="pw-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowPw(false)}>Ghairi</button>
                <button type="submit" className="btn-primary" disabled={savingPw}>
                  {savingPw ? 'Inabadilisha...' : 'Badilisha Nywila'}
                </button>
              </div>
            </form>
          )}

          {!showPw && (
            <p className="pw-hint">Bonyeza "Badilisha Nywila" kuweka nywila mpya kwenye akaunti yako.</p>
          )}
        </div>

        {/* DANGER ZONE */}
        <div className="settings-card danger-card">
          <h2 className="settings-card-title"><LogOut size={18} /> Toka kwenye Akaunti</h2>
          <p className="danger-desc">Utahitaji kuingia tena unapotaka kutumia DukaConnect.</p>
          <button className="btn-danger" onClick={signOut}>Toka Sasa</button>
        </div>

      </div>
    </div>
  )
}
