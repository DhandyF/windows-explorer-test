import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'

const API_PORT = Number(process.env.API_PORT ?? '3000')
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? '*'

type Item = { id: number; name: string; done: boolean }
let nextId = 2
const items: Item[] = [
  { id: 1, name: 'Sample item from API', done: false }
]

const app = new Elysia()
  .use(cors({
    origin: FRONTEND_ORIGIN,
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }))
  .get('/api/health', () => ({ status: 'ok', time: new Date().toISOString() }))
  .get('/api/items', () => items)
  .post('/api/items', ({ body, set }) => {
    // naive body validation
    if (!body || typeof (body as any).name !== 'string' || !(body as any).name.trim()) {
      set.status = 400
      return { error: 'Invalid body: expected { name: string }' }
    }
    const name = (body as any).name.trim()
    const item: Item = { id: nextId++, name, done: false }
    items.push(item)
    return item
  })
  .put('/api/items/:id/toggle', ({ params, set }) => {
    const id = Number(params.id)
    const idx = items.findIndex(i => i.id === id)
    if (idx === -1) {
      set.status = 404
      return { error: 'Item not found' }
    }
    items[idx].done = !items[idx].done
    return items[idx]
  })
  .listen(API_PORT)

console.log(
  `🚀 API ready on http://localhost:${API_PORT} (CORS origin: ${FRONTEND_ORIGIN})`
)