import { useState, useEffect, useRef } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { supabase } from '../firebase/config'
import { useAuth } from '../context/AuthContext'
import './NotifBell.css'

export default function NotifBell() {
  const { profile } = useAuth()
  const [notifs, setNotifs] = useState([])
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!profile?.id) return
    fetchNotifs()

    const channel = supabase
      .channel(`notifs-${profile.id}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${profile.id}`
      }, () => fetchNotifs())
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [profile])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function fetchNotifs() {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .limit(30)
    setNotifs(data || [])
  }

  async function markAllRead() {
    await supabase
      .from('notifications')
      .update({ imesomwa: true })
      .eq('user_id', profile.id)
      .eq('imesomwa', false)
    fetchNotifs()
  }

  async function markOne(id) {
    await supabase.from('notifications').update({ imesomwa: true }).eq('id', id)
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, imesomwa: true } : n))
  }

  const unread = notifs.filter(n => !n.imesomwa).length

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="notif-bell-btn" onClick={() => { setOpen(!open); if (!open && unread > 0) {} }}>
        <Bell size={20} />
        {unread > 0 && <span className="notif-badge">{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className="notif-dropdown">
          <div className="notif-dd-header">
            <span className="notif-dd-title">Arifa {unread > 0 && <span className="notif-dd-count">{unread} mpya</span>}</span>
            {unread > 0 && (
              <button className="notif-read-all" onClick={markAllRead}>
                <CheckCheck size={13} /> Soma zote
              </button>
            )}
          </div>
          <div className="notif-list">
            {notifs.length === 0 ? (
              <div className="notif-empty">
                <Bell size={28} />
                <p>Hakuna arifa bado</p>
              </div>
            ) : notifs.map(n => (
              <div
                key={n.id}
                className={`notif-item notif-${n.aina} ${!n.imesomwa ? 'notif-unread' : ''}`}
                onClick={() => !n.imesomwa && markOne(n.id)}
              >
                <div className="notif-dot" />
                <div className="notif-content">
                  <p className="notif-kichwa">{n.kichwa}</p>
                  <p className="notif-ujumbe">{n.ujumbe}</p>
                  <span className="notif-time">{timeAgo(n.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Sasa hivi'
  if (mins < 60) return `Dakika ${mins} zilizopita`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Saa ${hrs} zilizopita`
  return new Date(dateStr).toLocaleDateString('sw-TZ')
}
