<script setup>
import { ref, onMounted } from 'vue'
import HeaderBar from '../components/HeaderBar.vue'
import FolderTree from '../components/FolderTree.vue'
import ContentPanel from '../components/ContentPanel.vue'
import { getAllFolders } from '../composables/api'

// State
const folders = ref([])
const selectedFolder = ref(null)
const loading = ref(true)
const error = ref(null)

// Methods
async function loadFolders() {
  try {
    loading.value = true
    error.value = null
    const data = await getAllFolders()
    folders.value = Array.isArray(data) ? data : []

    if (!selectedFolder.value && folders.value.length) {
      selectedFolder.value = folders.value[0]
    }
  } catch (e) {
    error.value = e?.message || 'Failed to load folders'
    console.error('Error loading folders:', e)
  } finally {
    loading.value = false
  }
}

function handleFolderSelect(folder) {
  selectedFolder.value = folder
}

// Lifecycle
onMounted(loadFolders)
</script>

<template>
  <div class="flex h-screen bg-background">
    <!-- Header Bar -->
    <HeaderBar :loading="loading" />

    <!-- Main Content Area -->
    <div class="flex w-full pt-12">
      <!-- Left Panel - Folder Tree -->
      <div class="w-80 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div class="p-3 border-b border-sidebar-border">
          <h2 class="text-sm font-medium text-sidebar-foreground">Folders</h2>
        </div>

        <div class="flex-1 overflow-auto">
          <div v-if="error" class="p-4 text-destructive text-sm">
            <p>Error: {{ error }}</p>
            <button @click="loadFolders" class="mt-2 text-xs underline hover:no-underline">
              Try again
            </button>
          </div>

          <FolderTree
            v-else
            :folders="folders"
            :selectedFolder="selectedFolder"
            :loading="loading"
            @select="handleFolderSelect"
          />
        </div>
      </div>

      <!-- Right Panel - Content Display -->
      <div class="flex-1 bg-card">
        <ContentPanel
            :selectedFolder="selectedFolder"
            @open-folder="selectedFolder = $event"
        />
      </div>
    </div>
  </div>
</template>
