<script setup>
import { Search, X, FolderPlus, FilePlus } from 'lucide-vue-next'

const props = defineProps({
  selectedFolder: { type: Object, default: null },
  searchTerm: { type: String, default: '' }
})

const emit = defineEmits(['update:searchTerm','create-folder', 'create-file'])

function onCreateFolder() {
  const name = window.prompt('New folder name:', 'New Folder')
  if (!name) return
  emit('create-folder', name.trim())
}

function onCreateFile() {
  const name = window.prompt('New file name (with extension):', 'New File.txt')
  if (!name) return
  emit('create-file', name.trim())
}
</script>

<template>
  <div class="p-4 border-b border-border space-y-3">
    <div class="flex items-center justify-between">
      <h2 class="text-lg font-medium text-foreground">
        {{ selectedFolder ? selectedFolder.name : 'Select a folder' }}
      </h2>

      <div>
        <button
          v-if="selectedFolder"
          class="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded bg-primary text-primary-foreground hover:bg-primary/90 transition"
          @click="onCreateFolder"
        >
          <FolderPlus class="w-4 h-4" /> New Folder
        </button>
        <button
            class="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded bg-secondary text-secondary-foreground hover:bg-secondary/90 transition"
            @click="onCreateFile"
          >
            <FilePlus class="w-4 h-4" /> New File
        </button>
      </div>
    </div>

    <slot name="breadcrumb" />

    <div v-if="selectedFolder" class="relative">
      <Search class="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <input
        class="w-full pl-8 pr-8 py-2 text-sm bg-input border border-border rounded focus:outline-none focus:ring-1 focus:ring-ring"
        type="text" placeholder="Search in this folder..."
        :value="searchTerm"
        @input="$emit('update:searchTerm', $event.target.value)"
      />
      <button v-if="searchTerm"
              class="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground hover:text-foreground"
              @click="$emit('update:searchTerm','')">
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
