export function useApi() {
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3000'

  async function handle(res) {
    if (!res.ok) {
      let msg = ''
      try { msg = await res.text() } catch {}
      throw new Error(msg || `Request failed: ${res.status}`)
    }
    return res.json()
  }

  return {
    apiBase,
    async health() {
      const res = await fetch(`${apiBase}/api/health`)
      return handle(res)
    },
    async getItems() {
      const res = await fetch(`${apiBase}/api/items`)
      return handle(res)
    },
    async addItem(name) {
      const res = await fetch(`${apiBase}/api/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      })
      return handle(res)
    },
    async toggleItem(id) {
      const res = await fetch(`${apiBase}/api/items/${id}/toggle`, {
        method: 'PUT'
      })
      return handle(res)
    }
  }
}