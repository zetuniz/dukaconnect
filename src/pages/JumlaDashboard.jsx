import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../firebase/config'
import { Inbox, Truck, Package, ClipboardList, Settings, Plus, Trash2, Search, Pencil } from 'lucide-react'
import NotifBell from '../components/NotifBell'
import './Dashboard.css'

const UNITS = ['kipande', 'kilo', 'karton', 'debe', 'lita', 'gunia', 'kopo', 'sanduku', 'mfuko', 'roli']

function waLink(simu, text = '') {
  if (!simu) return '#'
  const clean = simu.replace(/\D/g, '')
  const intl = clean.startsWith('0') ? '255' + clean.slice(1) : clean.startsWith('255') ? clean : '255' + clean
  const msg = text ? `?text=${encodeURIComponent(text)}` : ''
  return `https://wa.me/${intl}${msg}`
}

function formatTZS(n) {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(0)}K`
  return Number(n).toLocaleString()
}

const haliColor = { pending: '#f59e0b', accepted: '#16a34a', delivered: '#3b82f6', cancelled: '#ef4444' }
const haliLabel = { pending: 'Inasubiri', accepted: 'Imekubaliwa', delivered: 'Imefika', cancelled: 'Imekataliwa' }

export default function JumlaDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [bidhaa, setBidhaa] = useState([])
  const [tab, setTab] = useState('orders')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')
  const [avgRating, setAvgRating] = useState(null)

  // Bidhaa search
  const [bidhaaQuery, setBidhaaQuery] = useState('')

  // Edit bidhaa
  const [editBidhaa, setEditBidhaa] = useState(null)
  const [editForm, setEditForm] = useState({ jina: '', bei: '', unit: 'kipande' })
  const [savingEdit, setSavingEdit] = useState(false)

  // Risiti
  const [risiti, setRisiti] = useState(null)

  // Bidhaa form state
  const [showBidhaaForm, setShowBidhaaForm] = useState(false)
  const [bidhaaForm, setBidhaaForm] = useState({ jina: '', bei: '', unit: 'kipande' })
  const [savingBidhaa, setSavingBidhaa] = useState(false)

  useEffect(() => {
    fetchOrders()
    fetchBidhaa()
    fetchAvgRating()

    const channel = supabase
      .channel('orders-jumla')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'orders',
        filter: `jumla_id=eq.${profile?.id}`
      }, () => fetchOrders())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [profile])

  async function fetchOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, rejareja:rejareja_id(jina, simu)')
      .eq('jumla_id', profile?.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
    setLoading(false)
  }

  async function fetchAvgRating() {
    const { data } = await supabase
      .from('ratings')
      .select('nyota')
      .eq('jumla_id', profile?.id)
    if (data?.length) {
      const avg = data.reduce((s, r) => s + r.nyota, 0) / data.length
      setAvgRating({ avg: avg.toFixed(1), count: data.length })
    }
  }

  async function fetchBidhaa() {
    const { data } = await supabase
      .from('bidhaa')
      .select('*')
      .eq('jumla_id', profile?.id)
      .order('created_at', { ascending: false })
    setBidhaa(data || [])
  }

  async function updateHali(orderId, hali) {
    const { error } = await supabase.from('orders').update({ hali }).eq('id', orderId)
    if (!error) {
      const msgs = { accepted: '✅ Agizo limekubaliwa!', delivered: '✅ Imewekwa kuwa imefika!', cancelled: '❌ Agizo limekataliwa' }
      setMsg(msgs[hali])
      fetchOrders()
      setTimeout(() => setMsg(''), 3000)

      // Tuma arifa kwa rejareja (independently)
      const order = orders.find(o => o.id === orderId)
      if (order) {
        const notifData = {
          accepted: { kichwa: 'Agizo Limekubaliwa ✅', ujumbe: `${profile?.jina} amekubali agizo lako la ${order.bidhaa}`, aina: 'success' },
          delivered: { kichwa: 'Bidhaa Imefika! 🚚', ujumbe: `Agizo lako la ${order.bidhaa} limefika. Angalia risiti yako.`, aina: 'success' },
          cancelled: { kichwa: 'Agizo Limekataliwa ❌', ujumbe: `${profile?.jina} amekataa agizo lako la ${order.bidhaa}`, aina: 'warning' },
        }
        if (notifData[hali]) {
          supabase.from('notifications').insert({
            user_id: order.rejareja_id,
            ...notifData[hali],
          }).then(({ error: ne }) => { if (ne) console.warn('Notif error:', ne.message) })
        }
      }
    }
  }

  async function saveBidhaa(e) {
    e.preventDefault()
    setSavingBidhaa(true)
    const { error } = await supabase.from('bidhaa').insert({
      jumla_id: profile?.id,
      jina: bidhaaForm.jina,
      bei: parseFloat(bidhaaForm.bei),
      unit: bidhaaForm.unit,
      ipo: true,
    })
    if (!error) {
      setBidhaaForm({ jina: '', bei: '', unit: 'kipande' })
      setShowBidhaaForm(false)
      fetchBidhaa()
      setMsg('✅ Bidhaa imeongezwa!')
      setTimeout(() => setMsg(''), 3000)
    }
    setSavingBidhaa(false)
  }

  async function toggleIpo(item) {
    await supabase.from('bidhaa').update({ ipo: !item.ipo }).eq('id', item.id)
    fetchBidhaa()
  }

  async function deleteBidhaa(id) {
    await supabase.from('bidhaa').delete().eq('id', id)
    fetchBidhaa()
  }

  function openEditBidhaa(item) {
    setEditBidhaa(item)
    setEditForm({ jina: item.jina, bei: item.bei, unit: item.unit })
  }

  async function saveEditBidhaa(e) {
    e.preventDefault()
    setSavingEdit(true)
    const { error } = await supabase.from('bidhaa').update({
      jina: editForm.jina,
      bei: parseFloat(editForm.bei),
      unit: editForm.unit,
    }).eq('id', editBidhaa.id)
    if (!error) {
      setEditBidhaa(null)
      fetchBidhaa()
      setMsg('✅ Bidhaa imebadilishwa!')
      setTimeout(() => setMsg(''), 3000)
    }
    setSavingEdit(false)
  }

  const pending = orders.filter(o => o.hali === 'pending')
  const active = orders.filter(o => o.hali === 'accepted')
  const history = orders.filter(o => ['delivered', 'cancelled'].includes(o.hali))
  const mwanzaMwezi = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const mapatoMwezi = orders
    .filter(o => o.hali === 'delivered' && o.bei_kwa_unit > 0 && o.idadi && new Date(o.created_at) >= mwanzaMwezi)
    .reduce((sum, o) => sum + (o.bei_kwa_unit * o.idadi), 0)

  function OrderCard({ order, showActions }) {
    const hasTotal = order.bei_kwa_unit > 0 && order.idadi != null
    const jumlaYaBei = hasTotal ? order.bei_kwa_unit * order.idadi : 0

    return (
      <div className="order-card">
        <div className="order-top">
          <div>
            <h3>{order.bidhaa}</h3>
            <p>Kiasi: {order.kiasi}</p>
            {hasTotal && (
              <p className="order-bei-info">
                TZS {Number(order.bei_kwa_unit).toLocaleString()} × {order.idadi} {order.unit_order} =&nbsp;
                <strong>TZS {Number(jumlaYaBei).toLocaleString()}</strong>
              </p>
            )}
            {order.maelezo && <p className="order-note">{order.maelezo}</p>}
          </div>
          <span className="hali-badge" style={{ background: haliColor[order.hali] }}>
            {haliLabel[order.hali]}
          </span>
        </div>
        <div className="order-bottom">
          <span>🏪 {order.rejareja?.jina}</span>
          <a
            href={waLink(order.rejareja?.simu, `Habari ${order.rejareja?.jina}, kuhusu agizo lako la ${order.bidhaa} kwenye DukaConnect`)}
            target="_blank"
            rel="noopener noreferrer"
            className="order-wa-link"
          >💬 {order.rejareja?.simu}</a>
          <span>🕒 {new Date(order.created_at).toLocaleDateString('sw-TZ')}</span>
        </div>
        {showActions && (
          <div className="order-actions">
            {order.hali === 'pending' && (
              <>
                <button className="btn-accept" onClick={() => updateHali(order.id, 'accepted')}>✅ Kubali</button>
                <button className="btn-cancel" onClick={() => updateHali(order.id, 'cancelled')}>❌ Kataa</button>
              </>
            )}
            {order.hali === 'accepted' && (
              <button className="btn-deliver" onClick={() => updateHali(order.id, 'delivered')}>🚚 Weka Imefika</button>
            )}
            {order.hali === 'delivered' && hasTotal && (
              <button className="btn-risiti" onClick={() => setRisiti(order)}>🧾 Ona Risiti</button>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="dashboard">
      <header className="dash-header">
        <div className="dash-logo">
          <img src="/logo-light.png" alt="DukaConnect" className="dash-logo-img" />
        </div>
        <div className="dash-user">
          <NotifBell />
          <button className="btn-settings" onClick={() => navigate('/settings')}>
            <Settings size={15} /> {profile?.jina}
          </button>
        </div>
      </header>

      {msg && <div className="msg-banner">{msg}</div>}

      <div className="stats-row">
        <div className="stat-card">
          <span className="stat-num">{pending.length}</span>
          <span className="stat-label">Zinasubiri</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{active.length}</span>
          <span className="stat-label">Zinafanya Kazi</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{bidhaa.filter(b => b.ipo).length}</span>
          <span className="stat-label">Bidhaa Zinazopatikana</span>
        </div>
        <div className="stat-card">
          <span className="stat-num">{avgRating ? `${avgRating.avg}★` : '—'}</span>
          <span className="stat-label">Tathmini {avgRating ? `(${avgRating.count})` : ''}</span>
        </div>
        <div className="stat-card stat-mapato">
          <span className="stat-num stat-num-green">
            {mapatoMwezi > 0 ? `TZS ${formatTZS(mapatoMwezi)}` : '—'}
          </span>
          <span className="stat-label">Mapato Mwezi Huu</span>
        </div>
      </div>

      <div className="dash-tabs">
        <button className={tab === 'orders' ? 'tab active' : 'tab'} onClick={() => setTab('orders')}>
          <Inbox size={16} /> Maagizo Mapya
          {pending.length > 0 && <span className="badge">{pending.length}</span>}
        </button>
        <button className={tab === 'active' ? 'tab active' : 'tab'} onClick={() => setTab('active')}>
          <Truck size={16} /> Yanayoendelea
        </button>
        <button className={tab === 'bidhaa' ? 'tab active' : 'tab'} onClick={() => setTab('bidhaa')}>
          <Package size={16} /> Bidhaa Zangu
          {bidhaa.length > 0 && <span className="badge-count">{bidhaa.length}</span>}
        </button>
        <button className={tab === 'history' ? 'tab active' : 'tab'} onClick={() => setTab('history')}>
          <ClipboardList size={16} /> Historia
        </button>
      </div>

      <div className="dash-content">
        {loading ? <div className="loading-sm">Inapakia...</div> : (
          <>
            {tab === 'orders' && (
              <div>
                <h2>Maagizo Mapya</h2>
                <p className="sub">Maagizo yanayosubiri jibu lako</p>
                {pending.length === 0
                  ? <div className="empty">Hakuna maagizo mapya kwa sasa.</div>
                  : pending.map(o => <OrderCard key={o.id} order={o} showActions={true} />)
                }
              </div>
            )}

            {tab === 'active' && (
              <div>
                <h2>Yanayoendelea</h2>
                <p className="sub">Maagizo uliyokubali</p>
                {active.length === 0
                  ? <div className="empty">Hakuna maagizo yanayoendelea sasa hivi.</div>
                  : active.map(o => <OrderCard key={o.id} order={o} showActions={true} />)
                }
              </div>
            )}

            {tab === 'bidhaa' && (
              <div>
                <div className="section-header">
                  <div>
                    <h2>Bidhaa Zangu</h2>
                    <p className="sub">Bidhaa unazouza — rejareja wataona catalog hii</p>
                  </div>
                  <button className="btn-primary" onClick={() => setShowBidhaaForm(true)}>
                    <Plus size={15} style={{ marginRight: 4 }} /> Ongeza Bidhaa
                  </button>
                </div>

                {showBidhaaForm && (
                  <div className="bidhaa-form-card">
                    <h3>Bidhaa Mpya</h3>
                    <form onSubmit={saveBidhaa} className="bidhaa-form">
                      <div className="form-group">
                        <label>Jina la Bidhaa</label>
                        <input
                          type="text"
                          placeholder="Mfano: Maji Kilimanjaro 500ml"
                          value={bidhaaForm.jina}
                          onChange={e => setBidhaaForm({ ...bidhaaForm, jina: e.target.value })}
                          required
                        />
                      </div>
                      <div className="bidhaa-form-row">
                        <div className="form-group">
                          <label>Bei (TZS)</label>
                          <input
                            type="number"
                            placeholder="0"
                            min="0"
                            value={bidhaaForm.bei}
                            onChange={e => setBidhaaForm({ ...bidhaaForm, bei: e.target.value })}
                            required
                          />
                        </div>
                        <div className="form-group">
                          <label>Kwa kila</label>
                          <select
                            value={bidhaaForm.unit}
                            onChange={e => setBidhaaForm({ ...bidhaaForm, unit: e.target.value })}
                          >
                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="bidhaa-form-actions">
                        <button type="button" className="btn-secondary" onClick={() => setShowBidhaaForm(false)}>Ghairi</button>
                        <button type="submit" className="btn-primary" disabled={savingBidhaa}>
                          {savingBidhaa ? 'Inahifadhi...' : 'Hifadhi Bidhaa'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {bidhaa.length > 3 && (
                  <div className="bidhaa-search-bar">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Tafuta bidhaa yako..."
                      value={bidhaaQuery}
                      onChange={e => setBidhaaQuery(e.target.value)}
                    />
                  </div>
                )}

                {bidhaa.length === 0 && !showBidhaaForm ? (
                  <div className="empty">
                    Bado hujaorodhesha bidhaa yoyote.<br />
                    <button className="link-btn" onClick={() => setShowBidhaaForm(true)}>Ongeza bidhaa yako ya kwanza →</button>
                  </div>
                ) : (
                  <div className="bidhaa-list">
                    {bidhaa.filter(b => b.jina.toLowerCase().includes(bidhaaQuery.toLowerCase())).map(item => (
                      <div key={item.id} className={`bidhaa-item ${!item.ipo ? 'bidhaa-haipi' : ''}`}>
                        <div className="bidhaa-info">
                          <div className="bidhaa-name">{item.jina}</div>
                          <div className="bidhaa-bei">
                            <span className="bei-amount">TZS {Number(item.bei).toLocaleString()}</span>
                            <span className="bei-unit">/ {item.unit}</span>
                          </div>
                        </div>
                        <div className="bidhaa-actions">
                          <button
                            className={`toggle-ipo ${item.ipo ? 'ipo-yes' : 'ipo-no'}`}
                            onClick={() => toggleIpo(item)}
                          >
                            {item.ipo ? '✓ Ipo' : '✗ Haipi'}
                          </button>
                          <button className="btn-edit" onClick={() => openEditBidhaa(item)} title="Hariri"><Pencil size={14} /></button>
                          <button className="btn-delete" onClick={() => deleteBidhaa(item.id)} title="Futa"><Trash2 size={15} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === 'history' && (
              <div>
                <h2>Historia ya Maagizo</h2>
                <p className="sub">Maagizo yaliyokamilika au kukataliwa</p>
                {history.length === 0
                  ? <div className="empty">Hakuna historia bado.</div>
                  : history.map(o => <OrderCard key={o.id} order={o} showActions={false} />)
                }
              </div>
            )}
          </>
        )}
      </div>
      {/* EDIT BIDHAA MODAL */}
      {editBidhaa && (
        <div className="modal-overlay" onClick={() => setEditBidhaa(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Hariri Bidhaa</h3>
            <form onSubmit={saveEditBidhaa}>
              <div className="form-group">
                <label>Jina la Bidhaa</label>
                <input
                  type="text"
                  value={editForm.jina}
                  onChange={e => setEditForm({ ...editForm, jina: e.target.value })}
                  required
                />
              </div>
              <div className="bidhaa-form-row">
                <div className="form-group">
                  <label>Bei (TZS)</label>
                  <input
                    type="number"
                    min="0"
                    value={editForm.bei}
                    onChange={e => setEditForm({ ...editForm, bei: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Kwa kila</label>
                  <select
                    value={editForm.unit}
                    onChange={e => setEditForm({ ...editForm, unit: e.target.value })}
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setEditBidhaa(null)}>Ghairi</button>
                <button type="submit" className="btn-primary" disabled={savingEdit}>
                  {savingEdit ? 'Inahifadhi...' : 'Hifadhi Mabadiliko'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RISITI MODAL */}
      {risiti && (
        <div className="modal-overlay" onClick={() => setRisiti(null)}>
          <div className="modal risiti-modal" onClick={e => e.stopPropagation()}>
            <div className="risiti-header">
              <img src="/logo-light.png" alt="DukaConnect" className="risiti-logo-img" />
              <p className="risiti-title">RISITI YA AGIZO</p>
            </div>
            <div className="risiti-body">
              <div className="risiti-row">
                <span>Tarehe</span>
                <span>{new Date(risiti.created_at).toLocaleDateString('sw-TZ', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
              </div>
              <div className="risiti-row">
                <span>Rejareja</span>
                <span>{risiti.rejareja?.jina}</span>
              </div>
              <div className="risiti-row">
                <span>Jumla</span>
                <span>{profile?.jina}</span>
              </div>
              <div className="risiti-divider" />
              <div className="risiti-bidhaa-header">
                <span>Bidhaa</span>
                <span>Idadi</span>
                <span>Bei</span>
              </div>
              <div className="risiti-bidhaa-row">
                <span>{risiti.bidhaa}</span>
                <span>{risiti.idadi != null ? `${risiti.idadi} ${risiti.unit_order || ''}` : risiti.kiasi}</span>
                <span>{risiti.bei_kwa_unit > 0 ? `TZS ${Number(risiti.bei_kwa_unit).toLocaleString()}` : '—'}</span>
              </div>
              <div className="risiti-divider" />
              <div className="risiti-total">
                <span>JUMLA YA KULIPA</span>
                <strong>
                  {risiti.bei_kwa_unit > 0 && risiti.idadi
                    ? `TZS ${Number(risiti.bei_kwa_unit * risiti.idadi).toLocaleString()}`
                    : '—'}
                </strong>
              </div>
              <div className="risiti-status">
                <span className="hali-badge" style={{ background: haliColor[risiti.hali] }}>
                  {haliLabel[risiti.hali]}
                </span>
              </div>
            </div>
            <button className="btn-secondary full" style={{ marginTop: 16 }} onClick={() => setRisiti(null)}>Funga</button>
          </div>
        </div>
      )}
    </div>
  )
}
