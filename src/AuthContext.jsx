import React, { createContext, useContext, useState, useEffect } from 'react'
import { signIn, signUp, signOut, getMe } from './api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [workspace, setWorkspace] = useState(null)
  const [memberships, setMemberships] = useState([])
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(() => localStorage.getItem('sja_token'))

  useEffect(() => {
    if (token) {
      getMe(token)
        .then(data => {
          if (data.error) {
            localStorage.clear()
            setToken(null)
            setLoading(false)
            return
          }
          setUser(data.user)
          setProfile(data.profile)
          setMemberships(data.memberships || [])
          if (data.memberships?.length > 0) {
            const savedId = localStorage.getItem('sja_workspace_id')
            const m = savedId
              ? (data.memberships.find(m => m.workspaces?.id === savedId) || data.memberships[0])
              : data.memberships[0]
            setWorkspace(m.workspaces)
            setRole(m.role || 'admin')
            localStorage.setItem('sja_workspace_id', m.workspaces.id)
          }
        })
        .catch(() => {
          localStorage.clear()
          setLoading(false)
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [token])

  async function login(email, password) {
    const data = await signIn(email, password)
    if (data.error) throw new Error(data.error)
    localStorage.setItem('sja_token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
    return data
  }

  async function register(email, password, full_name) {
    const data = await signUp(email, password, full_name)
    if (data.error) throw new Error(data.error)
    return data
  }

  function switchWorkspace(m) {
    setWorkspace(m.workspaces)
    setRole(m.role || 'admin')
    localStorage.setItem('sja_workspace_id', m.workspaces.id)
  }

  async function logout() {
    if (token) await signOut(token).catch(() => {})
    localStorage.clear()
    setUser(null)
    setProfile(null)
    setWorkspace(null)
    setRole(null)
    setToken(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, workspace, memberships, role, token, loading, login, register, logout, switchWorkspace }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
