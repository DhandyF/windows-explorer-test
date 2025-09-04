const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const DEFAULT_TIMEOUT = 15000

function withQuery(path, query) {
  if (!query || Object.keys(query).length === 0) return path
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(query)) {
    if (v === undefined || v === null) continue
    Array.isArray(v) ? v.forEach((x) => sp.append(k, String(x))) : sp.set(k, String(v))
  }
  return `${path}?${sp.toString()}`
}

async function request(path, opts = {}) {
  const {
    method = 'GET',
    headers = {},
    body,
    query,
    timeout = DEFAULT_TIMEOUT,
    raw = false, // set true if you want the raw Response
  } = opts

  const controller = new AbortController()
  const t = setTimeout(() => controller.abort('timeout'), timeout)

  try {
    const init = {
      method,
      headers: {
        Accept: 'application/json',
        ...headers,
      },
      signal: controller.signal,
    }

    if (api.token) init.headers.Authorization = `Bearer ${api.token}`

    if (body !== undefined) {
      if (body instanceof FormData) {
        init.body = body // browser sets boundary
      } else if (typeof body === 'string') {
        init.body = body
        if (!init.headers['Content-Type']) init.headers['Content-Type'] = 'text/plain'
      } else {
        init.body = JSON.stringify(body)
        if (!init.headers['Content-Type']) init.headers['Content-Type'] = 'application/json'
      }
    }

    const url = `${BASE}${withQuery(path, query)}`
    const res = await fetch(url, init)
    if (raw) return res

    const ctype = res.headers.get('content-type') || ''
    const data = ctype.includes('application/json') ? await res.json() : await res.text()

    if (!res.ok) {
      const message = (data && (data.error || data.message)) || (typeof data === 'string' ? data : `HTTP ${res.status}`)
      const err = new Error(message)
      err.status = res.status
      err.data = data
      throw err
    }
    return data
  } finally {
    clearTimeout(t)
  }
}

export const api = {
  token: null,
  setToken(token) { this.token = token },

  health() {
    return request('/api/health')
  },

  folders: {
    list() { return request('/api/folders') },
    get(id) { return request(`/api/folders/${id}`) },
    subfolders(id) { return request(`/api/folders/${id}/subfolders`) },
    files(id) { return request(`/api/folders/${id}/files`) },

    create(parentId, name) {
      return request('/api/folders', {
        method: 'POST',
        body: { parentId, name }
      })
    },
  },

  files: {
    download(id) { return request(`/api/files/${id}/download`, { raw: true }) },
    create(folderId, name, extra = {}) {
      // extra can include { fileType, fileSize }
      return request('/api/files', {
        method: 'POST',
        body: { folderId, name, ...extra }
      })
    },
  },
}

// (Optional) Compatibility helpers if you're already using these names:
export const getAllFolders = () => api.folders.list()
export const getSubfolders = (id) => api.folders.subfolders(id)
export const getFilesInFolder = (id) => api.folders.files(id)
export const createFolder = (parentId, name) => api.folders.create(parentId, name)
export const createFile = (folderId, name, extra) => api.files.create(folderId, name, extra)
