<script setup>
import { ref, onMounted } from 'vue'
import { Plus, RefreshCw, CheckCircle2, Circle } from 'lucide-vue-next'
import { useApi } from './composables/api'

const api = useApi()
const items = ref([])
const newName = ref('')
const loading = ref(false)
const error = ref('')

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = await api.getItems()
  } catch (e) {
    error.value = e.message || 'Failed to load'
  } finally {
    loading.value = false
  }
}

async function create() {
  if (!newName.value.trim()) return
  loading.value = true
  error.value = ''
  try {
    const created = await api.addItem(newName.value.trim())
    items.value.push(created)
    newName.value = ''
  } catch (e) {
    error.value = e.message || 'Failed to create'
  } finally {
    loading.value = false
  }
}

async function toggle(item) {
  loading.value = true
  try {
    const updated = await api.toggleItem(item.id)
    const idx = items.value.findIndex(i => i.id === updated.id)
    if (idx !== -1) items.value[idx] = updated
  } catch (e) {
    error.value = e.message || 'Failed to toggle'
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>

<template>
  <div class="mx-auto max-w-2xl p-6">
    <header class="mb-6 flex items-center justify-between">
      <h1 class="text-2xl font-bold">Vue 3 + Tailwind v4 + lucide</h1>
      <button
        class="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm hover:bg-gray-100 active:scale-[.98]"
        @click="load"
        :disabled="loading"
        title="Reload"
      >
        <RefreshCw class="size-4" />
        Reload
      </button>
    </header>

    <section class="rounded-2xl border bg-white p-5 shadow-sm">
      <div class="mb-4 flex items-center gap-2">
        <input
          v-model="newName"
          type="text"
          placeholder="New item name..."
          class="flex-1 rounded-xl border px-3 py-2 outline-none focus:ring"
        />
        <button
          class="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2 text-white hover:opacity-90 active:scale-[.98]"
          @click="create"
          :disabled="loading || !newName.trim()"
        >
          <Plus class="size-4" />
          Add
        </button>
      </div>

      <p v-if="error" class="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">
        {{ error }}
      </p>

      <ul class="space-y-2">
        <li
          v-for="item in items"
          :key="item.id"
          class="flex items-center justify-between rounded-xl border px-4 py-3"
        >
          <div class="flex items-center gap-3">
            <button class="p-1" @click="toggle(item)" :title="item.done ? 'Mark undone' : 'Mark done'">
              <CheckCircle2 v-if="item.done" class="size-5" />
              <Circle v-else class="size-5" />
            </button>
            <span :class="['text-sm', item.done ? 'line-through text-gray-400' : '']">
              {{ item.name }}
            </span>
          </div>
          <span class="text-xs text-gray-500">#{{ item.id }}</span>
        </li>
      </ul>

      <div v-if="loading" class="mt-4 text-sm text-gray-500">Loading…</div>
    </section>

    <footer class="mt-8 text-center text-xs text-gray-400">
      API: <code>{{ api.apiBase }}</code>
    </footer>
  </div>
</template>

<style scoped>
.size-4 { width: 1rem; height: 1rem; }
.size-5 { width: 1.25rem; height: 1.25rem; }
</style>