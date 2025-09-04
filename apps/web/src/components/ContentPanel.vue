<script setup>
import { ref, computed, watch } from 'vue'
import ContentHeader from './ContentHeader.vue'
import ContentBreadcrumb from './ContentBreadcrumb.vue'
import ContentItems from './ContentItems.vue'
import { Folder as FolderIcon, File as FileIcon } from 'lucide-vue-next'
import {
  getSubfolders,
  getFilesInFolder,
  createFolder,
  createFile
} from '../composables/api'

const props = defineProps({
  selectedFolder: { type: Object, default: null }  // FolderType | null
})

const emit = defineEmits(['open-folder'])

// state
const subfolders = ref([])
const files = ref([])
const loading = ref(false)
const error = ref('')

const searchTerm = ref('')

const selectedKeys = ref(new Set())

// effects
watch(() => props.selectedFolder, (f) => {
  selectedKeys.value = new Set()
  searchTerm.value = ''
  if (f?.id != null) loadFolderContent(f.id)
  else { subfolders.value = []; files.value = [] }
}, { immediate: true })

async function loadFolderContent(folderId) {
  try {
    loading.value = true
    error.value = ''
    const [sub, fls] = await Promise.all([
      getSubfolders(folderId),
      getFilesInFolder(folderId)
    ])
    subfolders.value = Array.isArray(sub) ? sub : []
    files.value = Array.isArray(fls) ? fls : []
  } catch (e) {
    error.value = e?.message || 'Failed to load folder content'
    console.error(e)
  } finally {
    loading.value = false
  }
}

// compute list
const itemsComputed = computed(() => {
  const all = [...subfolders.value, ...files.value]
  const filtered = searchTerm.value
    ? all.filter(i => i.name?.toLowerCase?.().includes(searchTerm.value.toLowerCase()))
    : all

  return filtered
})

function keyOf(item) { return `${('file_type' in item) ? 'file' : 'folder'}-${item.id}` }

// selection + context menu
function onItemClick(item, e) {
  const k = keyOf(item)
  const next = new Set(selectedKeys.value)
  
  if (e?.ctrlKey || e?.metaKey) {
    next.has(k) ? next.delete(k) : next.add(k)
  } else if (e?.shiftKey && selectedKeys.value.size > 0) {
    next.clear(); next.add(k)
  } else {
    next.clear(); next.add(k)
  }
  selectedKeys.value = next
  emit('open-folder', item)
}

function onItemContextMenu(e, item) {
  const k = keyOf(item)
  let next = new Set(selectedKeys.value)
  if (!next.has(k)) next = new Set([k])
  selectedKeys.value = next
}

async function handleCreateFolder(name) {
  if (!props.selectedFolder?.id) return
  try {
    loading.value = true
    error.value = ''
    const created = await createFolder(props.selectedFolder.id, name)

    await loadFolderContent(props.selectedFolder.id)
  } catch (e) {
    console.error(e)
    error.value = e?.message || 'Failed to create folder'
  } finally {
    loading.value = false
  }
}

async function handleCreateFile(name) {
  if (!props.selectedFolder?.id) return
  try {
    loading.value = true
    error.value = ''
    await createFile(props.selectedFolder.id, name)
    await loadFolderContent(props.selectedFolder.id)
  } catch (e) {
    console.error(e)
    error.value = e?.message || 'Failed to create file'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col h-full">
    <ContentHeader
      :selectedFolder="selectedFolder"
      :searchTerm="searchTerm"
      @update:searchTerm="searchTerm = $event"
      @create-folder="handleCreateFolder"
      @create-file="handleCreateFile"
    >
      <template #breadcrumb>
        <ContentBreadcrumb :folder="selectedFolder" />
      </template>
    </ContentHeader>

    <div class="flex-1 overflow-auto p-4">
      <div v-if="!selectedFolder" class="flex items-center justify-center h-full text-muted-foreground">
        <div class="text-center">
          <FolderIcon class="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p>Select a folder from the left panel to view its contents</p>
        </div>
      </div>

      <div v-else-if="loading" class="flex items-center justify-center h-full">
        <div class="animate-pulse text-muted-foreground">Loading content...</div>
      </div>

      <div v-else-if="error" class="text-destructive text-sm">
        Error: {{ error }}
      </div>

      <div v-else-if="itemsComputed.length === 0" class="text-center text-muted-foreground py-8">
        <FileIcon class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>{{ searchTerm ? 'No items match your search' : 'This folder is empty' }}</p>
      </div>

      <ContentItems
        v-else
        :items="itemsComputed"
        :selectedKeys="selectedKeys"
        @item-click="onItemClick"
        @item-contextmenu="onItemContextMenu"
      />
    </div>
  </div>
</template>
