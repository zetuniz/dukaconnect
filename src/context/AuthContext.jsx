import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../firebase/config'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) fetchProfile(session.user)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        fetchProfile(session.user)
      }
      else { setProfile(null); setLoading(false) }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchProfile(authUser) {
    const { data } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()

    if (!data) {
      // Profile missing — try to create it from user_metadata (set during signup)
      const meta = authUser.user_metadata
      if (meta?.role) {
        const profileData = {
          id: authUser.id,
          email: authUser.email,
          jina: meta.jina,
          simu: meta.simu,
          role: meta.role,
          jiji: meta.jiji || 'Mbeya',
        }
        const { error } = await supabase.from('profiles').insert(profileData)
        if (!error) {
          setProfile(profileData)
          setLoading(false)
          return
        }
      }
      // No metadata or insert failed — sign out cleanly
      await supabase.auth.signOut()
      return
    }

    setProfile(data)
    setLoading(false)
  }

  async function signUp(email, password, userData) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          jina: userData.jina,
          simu: userData.simu,
          role: userData.role,
          jiji: userData.jiji,
        }
      }
    })
    if (error) throw error

    if (data.user && data.session) {
      // Email confirmation disabled — create profile immediately
      const profileData = {
        id: data.user.id,
        email,
        jina: userData.jina,
        simu: userData.simu,
        role: userData.role,
        jiji: userData.jiji,
      }
      const { error: insertError } = await supabase.from('profiles').insert(profileData)
      if (insertError) throw insertError
      setProfile(profileData)
    }

    return data
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
