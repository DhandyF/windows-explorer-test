<script setup>
import { ref, computed } from 'vue'
import {
  ChevronRight, ChevronDown, Folder, FolderOpen, MoreVertical
} from 'lucide-vue-next'
import HighlightedText from './HighlightedText.vue'

const props = defineProps({
  folder: { type: Object, required: true },
  selectedFolder: { type: Object, default: null },
  level: { type: Number, default: 0 },
  searchTerm: { type: String, default: '' },
  expandedFolders: { type: Object, required: true }
})
const emit = defineEmits(['select', 'toggle-expand'])

const contextMenu = ref(null) // { x, y } | null

const hasChildren = computed(() => Array.isArray(props.folder.children) && props.folder.children.length > 0)
const isSelected  = computed(() => props.selectedFolder?.id === props.folder.id)
const isExpanded  = computed(() => props.expandedFolders.has(props.folder.id))

const filteredChildren = computed(() =>
  (props.folder.children || []).filter(c =>
    c.name.toLowerCase().includes(props.searchTerm.toLowerCase())
  )
)

const shouldShow = computed(() =>
  !props.searchTerm ||
  props.folder.name.toLowerCase().includes(props.searchTerm.toLowerCase()) ||
  filteredChildren.value.length > 0
)

function onToggleExpand(e) {
  e?.stopPropagation?.()
  if (hasChildren.value) emit('toggle-expand', props.folder.id)
}

function onSelect() {
  emit('select', props.folder)
}

function onKeyDown(e) {
  switch (e.key) {
    case 'Enter':
    case ' ':
      e.preventDefault()
      onSelect()
      break
    case 'ArrowRight':
      if (hasChildren.value && !isExpanded.value) {
        e.preventDefault()
        emit('toggle-expand', props.folder.id)
      }
      break
    case 'ArrowLeft':
      if (hasChildren.value && isExpanded.value) {
        e.preventDefault()
        emit('toggle-expand', props.folder.id)
      }
      break
  }
}
</script>

<template>
  <div v-if="shouldShow">
    <div
      class="group flex items-center gap-1 py-1 px-2 cursor-pointer hover:bg-sidebar-accent text-sm transition-colors focus:outline-none focus:bg-sidebar-accent focus:ring-1 focus:ring-sidebar-ring text-sidebar-foreground"
      :class="isSelected ? 'bg-sidebar-primary text-sidebar-primary-foreground' : ''"
      :style="{ paddingLeft: `${level * 16 + 8}px` }"
      @click="onSelect"
      @keydown="onKeyDown"
      tabindex="0"
      role="treeitem"
      :aria-expanded="hasChildren ? isExpanded : undefined"
      :aria-selected="isSelected"
    >
      <!-- Expand/Collapse -->
      <button
        @click.stop="onToggleExpand"
        class="w-4 h-4 flex items-center justify-center hover:bg-sidebar-accent rounded transition-colors"
        tabindex="-1"
        :aria-label="hasChildren ? (isExpanded ? 'Collapse folder' : 'Expand folder') : undefined"
      >
        <ChevronDown v-if="hasChildren && isExpanded" class="w-3 h-3" />
        <ChevronRight v-else-if="hasChildren" class="w-3 h-3" />
        <div v-else class="w-3 h-3" />
      </button>

      <!-- Icon -->
      <FolderOpen v-if="isExpanded" class="w-4 h-4 text-sidebar-primary flex-shrink-0" />
      <Folder v-else class="w-4 h-4 text-sidebar-primary flex-shrink-0" />

      <!-- Name (with highlight) -->
      <span class="truncate flex-1">
        <HighlightedText :text="folder.name" :searchTerm="searchTerm" />
      </span>
    </div>

    <!-- Children -->
    <div v-if="hasChildren && isExpanded" role="group">
      <FolderNode
        v-for="child in (searchTerm ? filteredChildren : folder.children)"
        :key="child.id"
        :folder="child"
        :selectedFolder="selectedFolder"
        :level="level + 1"
        :searchTerm="searchTerm"
        :expandedFolders="expandedFolders"
        @select="$emit('select', $event)"
        @toggle-expand="$emit('toggle-expand', $event)"
        @new-folder="$emit('new-folder', $event)"
        @rename="$emit('rename', $event)"
        @delete="$emit('delete', $event)"
      />
    </div>
  </div>
</template>
