const BASE = 'https://sja.eikr.ee/api'

function authHeaders(token) {
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

// Auth
export async function signUp(email, password, full_name) {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name })
  })
  return res.json()
}

export async function signIn(email, password) {
  const res = await fetch(`${BASE}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return res.json()
}

export async function signOut(token) {
  const res = await fetch(`${BASE}/auth/signout`, {
    method: 'POST',
    headers: authHeaders(token)
  })
  return res.json()
}

export async function getMe(token) {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: authHeaders(token)
  })
  return res.json()
}

// Workspace
export async function getWorkspace(token, workspaceId) {
  const res = await fetch(`${BASE}/workspace/${workspaceId}`, {
    headers: authHeaders(token)
  })
  return res.json()
}

export async function createWorkspace(token, data) {
  const res = await fetch(`${BASE}/workspace`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function updateGoal(token, workspaceId, data) {
  const res = await fetch(`${BASE}/workspace/${workspaceId}/goal`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function inviteMember(token, workspaceId, email, role) {
  const res = await fetch(`${BASE}/workspace/${workspaceId}/invite`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ email, role })
  })
  return res.json()
}

// Shopify
export async function connectShopify(token, workspaceId, storeUrl, accessToken) {
  const res = await fetch(`${BASE}/shopify/connect`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ store_url: storeUrl, access_token: accessToken, workspace_id: workspaceId })
  })
  return res.json()
}

export async function testShopify(token) {
  const res = await fetch(`${BASE}/shopify/test`, {
    headers: authHeaders(token)
  })
  return res.json()
}

export async function getRevenue(token, workspaceId) {
  const res = await fetch(`${BASE}/shopify/revenue?workspace_id=${workspaceId}`, {
    headers: authHeaders(token)
  })
  return res.json()
}

export async function getProducts(token, workspaceId) {
  const res = await fetch(`${BASE}/shopify/products?workspace_id=${workspaceId}`, {
    headers: authHeaders(token)
  })
  return res.json()
}

export async function getCustomers(token, workspaceId) {
  const res = await fetch(`${BASE}/shopify/customers?workspace_id=${workspaceId}`, {
    headers: authHeaders(token)
  })
  return res.json()
}

// AI
export async function askAI(token, workspaceId, question, history = []) {
  const res = await fetch(`${BASE}/ai/ask`, {
    method: 'POST',
    headers: authHeaders(token),
    body: JSON.stringify({ question, history, workspace_id: workspaceId })
  })
  return res.json()
}

export async function getDigest(token, workspaceId) {
  const res = await fetch(`${BASE}/ai/digest?workspace_id=${workspaceId}`, {
    headers: authHeaders(token)
  })
  return res.json()
}
