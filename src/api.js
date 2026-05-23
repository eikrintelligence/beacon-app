const BASE = 'https://sja.eikr.ee/api'

export async function getWorkspace() {
  const res = await fetch(`${BASE}/workspace`)
  return res.json()
}

export async function updateGoal(data) {
  const res = await fetch(`${BASE}/workspace/goal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  return res.json()
}

export async function connectShopify(storeUrl, accessToken) {
  const res = await fetch(`${BASE}/shopify/connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ store_url: storeUrl, access_token: accessToken })
  })
  return res.json()
}

export async function testShopify() {
  const res = await fetch(`${BASE}/shopify/test`)
  return res.json()
}

export async function getRevenue() {
  const res = await fetch(`${BASE}/shopify/revenue`)
  return res.json()
}

export async function getProducts() {
  const res = await fetch(`${BASE}/shopify/products`)
  return res.json()
}

export async function getCustomers() {
  const res = await fetch(`${BASE}/shopify/customers`)
  return res.json()
}

export async function askAI(question, history = []) {
  const res = await fetch(`${BASE}/ai/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, history })
  })
  return res.json()
}

export async function getDigest() {
  const res = await fetch(`${BASE}/ai/digest`)
  return res.json()
}
