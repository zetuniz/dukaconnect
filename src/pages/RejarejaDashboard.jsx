import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../firebase/config'
import { Store, Package, Settings, ArrowLeft, ShoppingCart, Search, X, MapPin, Phone } from 'lucide-react'
import NotifBell from '../components/NotifBell'
import './Dashboard.css'

const haliColor = { pending: '#f59e0b', accepted: '#16a34a', delivered: '#3b82f6', cancelled: '#ef4444' }
const haliLabel = { pending: 'Inasubiri', accepted: 'Imekubaliwa', delivered: 'Imefika', cancelled: 'Imekataliwa' }

function StarBar({ nyota }) {
  return (
    <span className="star-bar">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={i <= Math.round(nyota) ? 'star-full' : 'star-empty'}>★</span>
      ))}
    </span>
  )
}

export default function RejarejaDashboard() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [maduka, setMaduka] = useState([])
  const [orders, setOrders] = useState([])
  const [tab, setTab] = useState('maduka')
  const [loading, setLoading] = useState(true)
  const [msg, setMsg] = useState('')

  // Search
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null) // null = not searching
  const [searching, setSearching] = useState(false)

  // Duka selection + catalog
  const [selectedDuka, setSelectedDuka] = useState(null)
  const [catalog, setCatalog] = useState([])
  const [loadingCatalog, setLoadingCatalog] = useState(false)

  // Order form
  const [orderModal, setOrderModal] = useState(false)
  const [orderForm, setOrderForm] = useState({ bidhaa: '', kiasi: '', maelezo: '', bei: 0, unit: '', idadi: 1 })
  const [sending, setSending] = useState(false)

  // Risiti
  const [risiti, setRisiti] = useState(null)

  // Ratings
  const [myRatings, setMyRatings] = useState([])
  const [dukaRatings, setDukaRatings] = useState({})
  const [ratingModal, setRatingModal] = useState(null)
  const [ratingForm, setRatingForm] = useState({ nyota: 0, maoni: '' })
  const [hoverStar, setHoverStar] = useState(0)
  const [submittingRating, setSubmittingRating] = useState(false)

  useEffect(() => {
    fetchMaduka()
    fetchMyOrders()
    fetchMyRatings()
  }, [])

  // Debounce search
  useEffect(() => {
    if (!query.trim()) { setSearchResults(null); return }
    const timer = setTimeout(() => doSearch(query.trim()), 350)
    return () => clearTimeout(timer)
  }, [query])

  async function fetchMaduka() {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'jumla')
      .eq('jiji', profile?.jiji || 'Mbeya')
    setMaduka(data || [])
    setLoading(false)
    if (data?.length) fetchDukaRatings(data.map(d => d.id))
  }

  async function fetchMyOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*, jumla:jumla_id(jina, simu)')
      .eq('rejareja_id', profile?.id)
      .order('created_at', { ascending: false })
    setOrders(data || [])
  }

  async function fetchMyRatings() {
    const { data } = await supabase
      .from('ratings')
      .select('order_id, nyota')
      .eq('rejareja_id', profile?.id)
    setMyRatings(data || [])
  }

  async function fetchDukaRatings(dukaIds) {
    if (!dukaIds.length) return
    const { data } = await supabase
      .from('ratings')
      .select('jumla_id, nyota')
      .in('jumla_id', dukaIds)
    const avgs = {}
    dukaIds.forEach(id => {
      const list = (data || []).filter(r => r.jumla_id === id)
      if (list.length > 0) {
        avgs[id] = {
          avg: (list.reduce((s, r) => s + r.nyota, 0) / list.length).toFixed(1),
          count: list.length,
        }
      }
    })
    setDukaRatings(avgs)
  }

  async function submitRating(e) {
    e.preventDefault()
    if (!ratingForm.nyota) return
    setSubmittingRating(true)
    const { error } = await supabase.from('ratings').insert({
      order_id: ratingModal.id,
      rejareja_id: profile?.id,
      jumla_id: ratingModal.jumla_id,
      nyota: ratingForm.nyota,
      maoni: ratingForm.maoni || null,
    })
    if (!error) {
      setMsg('✅ Asante! Tathmini yako imehifadhiwa.')
      setRatingModal(null)
      setRatingForm({ nyota: 0, maoni: '' })
      setHoverStar(0)
      fetchMyRatings()
      setTimeout(() => setMsg(''), 3000)
    }
    setSubmittingRating(false)
  }

  async function doSearch(q) {
    setSearching(true)

    const [{ data: bidhaaData }, filteredMaduka] = await Promise.all([
      supabase
        .from('bidhaa')
        .select('*, jumla:jumla_id(id, jina, simu, jiji)')
        .ilike('jina', `%${q}%`)
        .eq('ipo', true),
      Promise.resolve(
        maduka.filter(d => d.jina.toLowerCase().includes(q.toLowerCase()))
      ),
    ])

    const bidhaaKatikaMji = (bidhaaData || []).filter(
      b => b.jumla?.jiji === profile?.jiji
    )

    setSearchResults({ bidhaa: bidhaaKatikaMji, maduka: filteredMaduka })
    setSearching(false)
  }

  function clearSearch() {
    setQuery('')
    setSearchResults(null)
  }

  async function selectDuka(duka) {
    clearSearch()
    setSelectedDuka(duka)
    setCatalog([])
    setLoadingCatalog(true)
    const { data } = await supabase
      .from('bidhaa')
      .select('*')
      .eq('jumla_id', duka.id)
      .order('ipo', { ascending: false })
      .order('jina')
    setCatalog(data || [])
    setLoadingCatalog(false)
  }

  function openOrderModal(bidhaaJina = '', duka = null, bei = 0, unit = '') {
    if (duka) setSelectedDuka(duka)
    setOrderForm({ bidhaa: bidhaaJina, kiasi: '', maelezo: '', bei, unit, idadi: 1 })
    setOrderModal(true)
  }

  async function sendOrder(e) {
    e.preventDefault()
    if (!selectedDuka) return
    setSending(true)
    const fromCatalog = orderForm.bei > 0
    const orderData = {
      rejareja_id: profile?.id,
      jumla_id: selectedDuka.id,
      bidhaa: orderForm.bidhaa,
      kiasi: fromCatalog ? `${orderForm.idadi} ${orderForm.unit}` : orderForm.kiasi,
      maelezo: orderForm.maelezo,
      hali: 'pending',
      jiji: profile?.jiji,
    }
    if (fromCatalog) {
      orderData.bei_kwa_unit = parseFloat(orderForm.bei)
      orderData.idadi = parseFloat(orderForm.idadi)
      orderData.unit_order = orderForm.unit
    }

    const { error } = await supabase.from('orders').insert(orderData)
    if (!error) {
      setMsg('✅ Agizo limetumwa! Subiri jumla akubali.')
      setOrderModal(false)
      setOrderForm({ bidhaa: '', kiasi: '', maelezo: '', bei: 0, unit: '', idadi: 1 })
      fetchMyOrders()
      setTab('orders')

      // Tuma arifa kwa jumla (independently — error hapa haizuii agizo)
      supabase.from('notifications').insert({
        user_id: selectedDuka.id,
        kichwa: 'Agizo Jipya! 🛒',
        ujumbe: `${profile?.jina} ametuma agizo la ${orderForm.bidhaa}`,
        aina: 'info',
      }).then(({ error: ne }) => { if (ne) console.warn('Notif error:', ne.message) })
    } else {
      console.error('Order INSERT error:', error)
      setMsg('❌ ' + (error.message || 'Hitilafu imetokea. Jaribu tena.'))
    }
    setSending(false)
    setTimeout(() => setMsg(''), 4000)
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

      <div className="dash-tabs">
        <button className={tab === 'maduka' ? 'tab active' : 'tab'} onClick={() => { setTab('maduka'); setSelectedDuka(null); clearSearch() }}>
          <Store size={16} /> Maduka ya Jumla
        </button>
        <button className={tab === 'orders' ? 'tab active' : 'tab'} onClick={() => setTab('orders')}>
          <Package size={16} /> Maagizo Yangu
          {orders.filter(o => o.hali === 'accepted').length > 0 &&
            <span className="badge">{orders.filter(o => o.hali === 'accepted').length}</span>}
        </button>
      </div>

      <div className="dash-content">

        {/* MADUKA TAB — LIST */}
        {tab === 'maduka' && !selectedDuka && (
          <div>
            <h2>Maduka ya Jumla — {profile?.jiji}</h2>
            <p className="sub">Tafuta bidhaa au chagua duka</p>

            {/* SEARCH BAR */}
            <div className="search-bar">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Tafuta bidhaa au duka... (mfano: Unga, Maji)"
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="search-input"
              />
              {query && (
                <button className="search-clear" onClick={clearSearch}>
                  <X size={16} />
                </button>
              )}
            </div>

            {/* SEARCH RESULTS */}
            {searchResults !== null ? (
              <div className="search-results">
                {searching ? (
                  <div className="loading-sm">Inatafuta...</div>
                ) : (
                  <>
                    {/* Bidhaa results */}
                    {searchResults.bidhaa.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-label">
                          <Package size={14} /> Bidhaa — {searchResults.bidhaa.length} matokeo
                        </div>
                        <div className="search-bidhaa-list">
                          {searchResults.bidhaa.map(item => (
                            <div key={item.id} className="search-bidhaa-item">
                              <div className="search-bidhaa-info">
                                <span className="search-bidhaa-name">{item.jina}</span>
                                <span className="search-bidhaa-duka">{item.jumla?.jina}</span>
                              </div>
                              <div className="search-bidhaa-right">
                                <span className="search-bidhaa-bei">
                                  TZS {Number(item.bei).toLocaleString()}
                                  <span className="search-unit">/{item.unit}</span>
                                </span>
                                <button
                                  className="btn-agiza-sm"
                                  onClick={() => openOrderModal(item.jina, item.jumla, item.bei, item.unit)}
                                >
                                  Agiza
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Maduka results */}
                    {searchResults.maduka.length > 0 && (
                      <div className="search-section">
                        <div className="search-section-label">
                          <Store size={14} /> Maduka — {searchResults.maduka.length} matokeo
                        </div>
                        <div className="duka-grid">
                          {searchResults.maduka.map(duka => (
                            <div key={duka.id} className="duka-card" onClick={() => selectDuka(duka)}>
                              <div className="duka-icon">🏬</div>
                              <h3>{duka.jina}</h3>
                              <p><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />{duka.jiji}</p>
                              <p><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />{duka.simu}</p>
                              {dukaRatings[duka.id] && (
                                <div className="duka-rating">
                                  <StarBar nyota={parseFloat(dukaRatings[duka.id].avg)} />
                                  <span className="rating-count">{dukaRatings[duka.id].avg} ({dukaRatings[duka.id].count})</span>
                                </div>
                              )}
                              <button className="btn-order">Tazama Bidhaa →</button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {searchResults.bidhaa.length === 0 && searchResults.maduka.length === 0 && (
                      <div className="empty">
                        Hakuna matokeo kwa "<strong>{query}</strong>"<br />
                        <span style={{ fontSize: 13 }}>Jaribu neno lingine au tazama maduka yote hapa chini</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              /* NORMAL MADUKA LIST */
              loading ? <div className="loading-sm">Inapakia...</div> : (
                <div className="duka-grid">
                  {maduka.length === 0 ? (
                    <div className="empty" style={{ gridColumn: '1/-1' }}>
                      Hakuna maduka ya jumla yaliyosajiliwa bado katika {profile?.jiji}
                    </div>
                  ) : maduka.map(duka => (
                    <div key={duka.id} className="duka-card" onClick={() => selectDuka(duka)}>
                      <div className="duka-icon">🏬</div>
                      <h3>{duka.jina}</h3>
                      <p><MapPin size={12} style={{ display: 'inline', marginRight: 4 }} />{duka.jiji}</p>
                      <p><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />{duka.simu}</p>
                      {dukaRatings[duka.id] && (
                        <div className="duka-rating">
                          <StarBar nyota={parseFloat(dukaRatings[duka.id].avg)} />
                          <span className="rating-count">{dukaRatings[duka.id].avg} ({dukaRatings[duka.id].count})</span>
                        </div>
                      )}
                      <button className="btn-order">Tazama Bidhaa →</button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        )}

        {/* CATALOG VIEW */}
        {tab === 'maduka' && selectedDuka && (
          <div>
            <button className="btn-back" onClick={() => setSelectedDuka(null)}>
              <ArrowLeft size={16} /> Rudi kwa Maduka
            </button>

            <div className="duka-detail-header">
              <div className="duka-detail-icon">🏬</div>
              <div>
                <h2>{selectedDuka.jina}</h2>
                <p className="sub" style={{ marginBottom: 0 }}>
                  <MapPin size={13} style={{ display: 'inline', marginRight: 4 }} />{selectedDuka.jiji}
                  &nbsp;·&nbsp;
                  <Phone size={13} style={{ display: 'inline', marginRight: 4 }} />{selectedDuka.simu}
                </p>
              </div>
              <button className="btn-primary" style={{ marginLeft: 'auto' }} onClick={() => openOrderModal('')}>
                <ShoppingCart size={15} style={{ marginRight: 6 }} /> Agizo Maalum
              </button>
            </div>

            <div className="catalog-section">
              <h3 className="catalog-title">Bidhaa Zinazopatikana</h3>
              {loadingCatalog ? (
                <div className="loading-sm">Inapakia bidhaa...</div>
              ) : catalog.length === 0 ? (
                <div className="empty">
                  Duka hili bado halijaorodhesha bidhaa zake.<br />
                  <button className="link-btn" onClick={() => openOrderModal('')}>Tuma agizo maalum →</button>
                </div>
              ) : (
                <div className="catalog-grid">
                  {catalog.map(item => (
                    <div key={item.id} className={`catalog-item ${!item.ipo ? 'catalog-haipi' : ''}`}>
                      <div className="catalog-item-top">
                        <span className="catalog-item-name">{item.jina}</span>
                        <span className={`catalog-ipo-badge ${item.ipo ? 'ipo-green' : 'ipo-red'}`}>
                          {item.ipo ? 'Ipo' : 'Haipi'}
                        </span>
                      </div>
                      <div className="catalog-item-bei">
                        TZS {Number(item.bei).toLocaleString()}
                        <span className="catalog-unit"> / {item.unit}</span>
                      </div>
                      {item.ipo && (
                        <button className="btn-agiza" onClick={() => openOrderModal(item.jina, null, item.bei, item.unit)}>
                          Agiza Sasa
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ORDERS TAB */}
        {tab === 'orders' && (
          <div>
            <h2>Maagizo Yangu</h2>
            <p className="sub">Hali ya maagizo yako yote</p>
            {orders.length === 0 ? (
              <div className="empty">
                Hujatuma agizo lolote bado.{' '}
                <button className="link-btn" onClick={() => setTab('maduka')}>Agiza sasa →</button>
              </div>
            ) : (
              <div className="orders-list">
                {orders.map(order => (
                  <div key={order.id} className="order-card">
                    <div className="order-top">
                      <div>
                        <h3>{order.bidhaa}</h3>
                        <p>Kiasi: {order.kiasi}</p>
                        {order.maelezo && <p className="order-note">{order.maelezo}</p>}
                      </div>
                      <span className="hali-badge" style={{ background: haliColor[order.hali] }}>
                        {haliLabel[order.hali]}
                      </span>
                    </div>
                    <div className="order-bottom">
                      <span>{order.jumla?.jina}</span>
                      <span>{order.jumla?.simu}</span>
                      <span>{new Date(order.created_at).toLocaleDateString('sw-TZ')}</span>
                    </div>
                    {order.hali === 'delivered' && (
                      <div className="order-delivered-actions">
                        {order.bei_kwa_unit > 0 && (
                          <button className="btn-risiti" onClick={() => setRisiti(order)}>
                            🧾 Risiti
                          </button>
                        )}
                        {myRatings.some(r => r.order_id === order.id) ? (
                          <div className="rated-stars">
                            <StarBar nyota={myRatings.find(r => r.order_id === order.id).nyota} />
                            <span className="rated-label">Umepiga kura</span>
                          </div>
                        ) : (
                          <button className="btn-rate" onClick={() => { setRatingModal(order); setRatingForm({ nyota: 0, maoni: '' }) }}>
                            ★ Tathmini
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ORDER MODAL */}
      {orderModal && (
        <div className="modal-overlay" onClick={() => setOrderModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Agizo kwa {selectedDuka?.jina}</h3>
            <form onSubmit={sendOrder}>
              <div className="form-group">
                <label>Bidhaa Unayotaka</label>
                <input
                  type="text"
                  placeholder="Mfano: Maji Kilimanjaro, Unga Ndovu..."
                  value={orderForm.bidhaa}
                  onChange={e => setOrderForm({ ...orderForm, bidhaa: e.target.value })}
                  required
                />
              </div>

              {orderForm.bei > 0 ? (
                <>
                  <div className="order-bei-display">
                    <span className="order-bei-label">Bei ya Bidhaa</span>
                    <span className="order-bei-val">TZS {Number(orderForm.bei).toLocaleString()} / {orderForm.unit}</span>
                  </div>
                  <div className="form-group">
                    <label>Idadi (Kiasi)</label>
                    <input
                      type="number"
                      min="1"
                      step="0.5"
                      placeholder="1"
                      value={orderForm.idadi}
                      onChange={e => setOrderForm({ ...orderForm, idadi: e.target.value })}
                      required
                    />
                  </div>
                  <div className="order-total-preview">
                    <span>Jumla ya Kulipa:</span>
                    <strong>TZS {Number(orderForm.bei * (orderForm.idadi || 0)).toLocaleString()}</strong>
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label>Kiasi / Idadi</label>
                  <input
                    type="text"
                    placeholder="Mfano: Karton 2, Debe 5..."
                    value={orderForm.kiasi}
                    onChange={e => setOrderForm({ ...orderForm, kiasi: e.target.value })}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Maelezo Zaidi (si lazima)</label>
                <textarea
                  placeholder="Mfano: Tafadhali lete asubuhi..."
                  value={orderForm.maelezo}
                  onChange={e => setOrderForm({ ...orderForm, maelezo: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setOrderModal(false)}>Ghairi</button>
                <button type="submit" className="btn-primary" disabled={sending}>
                  {sending ? 'Inatuma...' : 'Tuma Agizo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RATING MODAL */}
      {ratingModal && (
        <div className="modal-overlay" onClick={() => setRatingModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Tathmini — {ratingModal.jumla?.jina}</h3>
            <p className="modal-sub">Agizo: <strong>{ratingModal.bidhaa}</strong></p>
            <form onSubmit={submitRating}>
              <div className="rating-stars-input">
                {[1,2,3,4,5].map(i => (
                  <button
                    key={i}
                    type="button"
                    className={`star-btn ${i <= (hoverStar || ratingForm.nyota) ? 'star-active' : ''}`}
                    onMouseEnter={() => setHoverStar(i)}
                    onMouseLeave={() => setHoverStar(0)}
                    onClick={() => setRatingForm({ ...ratingForm, nyota: i })}
                  >★</button>
                ))}
              </div>
              {ratingForm.nyota > 0 && (
                <p className="rating-label-text">{['', 'Mbaya Sana', 'Mbaya', 'Wastani', 'Nzuri', 'Bora Sana'][ratingForm.nyota]}</p>
              )}
              <div className="form-group" style={{ marginTop: 16 }}>
                <label>Maoni (si lazima)</label>
                <textarea
                  placeholder="Sema zaidi kuhusu huduma..."
                  value={ratingForm.maoni}
                  onChange={e => setRatingForm({ ...ratingForm, maoni: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setRatingModal(null)}>Ghairi</button>
                <button type="submit" className="btn-primary" disabled={!ratingForm.nyota || submittingRating}>
                  {submittingRating ? 'Inahifadhi...' : 'Tuma Tathmini'}
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
                <span>{profile?.jina}</span>
              </div>
              <div className="risiti-row">
                <span>Jumla</span>
                <span>{risiti.jumla?.jina}</span>
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
