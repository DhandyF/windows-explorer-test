<script setup>
import { ref, watch, computed } from 'vue'
import { Search, X } from 'lucide-vue-next'
import FolderNode from './FolderNode.vue'

const props = defineProps({
  folders: { type: Array, default: () => [] },
  selectedFolder: { type: Object, default: null },
  loading: { type: Boolean, default: false }
})
const emit = defineEmits(['select', 'new-folder', 'rename', 'delete'])

const searchTerm = ref('')
const expandedFolders = ref(new Set()) // Set<number>
const searchInputRef = ref(null)

function toggleExpand(folderId) {
  expandedFolders.value = new Set(
    expandedFolders.value.has(folderId)
      ? [...expandedFolders.value].filter(id => id !== folderId)
      : [...expandedFolders.value, folderId]
  )
}
function handleSelect(folder) {
  emit('select', folder)
}

// Auto-expand while searching
watch(searchTerm, (term) => {
  if (!term) return
  const ids = new Set()
  const collect = (list) => {
    for (const f of list) {
      if (Array.isArray(f.children) && f.children.length) {
        ids.add(f.id)
        collect(f.children)
      }
    }
  }
  collect(props.folders)
  expandedFolders.value = ids
})

const empty = computed(() => !props.loading && (!props.folders || props.folders.length === 0))

function clearSearch() {
  searchTerm.value = ''
  searchInputRef.value?.focus?.()
}
</script>

<template>
  <div class="flex flex-col h-full">
    <!-- Search -->
    <div class="p-3 border-b border-sidebar-border">
      <div class="relative">
        <Search class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref="searchInputRef"
          type="text"
          placeholder="Search folders..."
          v-model="searchTerm"
          class="w-full pl-8 pr-8 py-1.5 text-sm bg-input border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          v-if="searchTerm"
          @click="clearSearch"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- States -->
    <div v-if="loading" class="p-4 text-center text-muted-foreground text-sm">
      <div class="animate-pulse">Loading folders...</div>
    </div>
    <div v-else-if="empty" class="p-4 text-center text-muted-foreground text-sm">
      No folders found
    </div>

    <!-- Tree -->
    <div v-else class="flex-1 overflow-auto py-2" role="tree" aria-label="Folder tree">
      <FolderNode
        v-for="folder in folders"
        :key="folder.id"
        :folder="folder"
        :selectedFolder="selectedFolder"
        :level="0"
        :searchTerm="searchTerm"
        :expandedFolders="expandedFolders"
        @toggle-expand="toggleExpand"
        @select="handleSelect"
        @new-folder="$emit('new-folder', $event)"
        @rename="$emit('rename', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>
