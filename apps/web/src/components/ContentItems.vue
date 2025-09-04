<script setup>
import { Folder, File as FileIcon, FileText, Image as ImageIcon, Music, Video } from 'lucide-vue-next'

const props = defineProps({
  items: { type: Array, default: () => [] },          // (Folder|FileItem)[]
  selectedKeys: { type: Object, required: true }
})
const emit = defineEmits(['item-click','item-contextmenu'])

function keyOf(item) { return `${('file_type' in item) ? 'file' : 'folder'}-${item.id}` }

function formatFileSize(bytes = 0) {
  if (!bytes) return '0 Bytes'
  const sizes = ['Bytes','KB','MB','GB']
  const i = Math.min(Math.floor(Math.log(bytes)/Math.log(1024)), sizes.length-1)
  return `${parseFloat((bytes/Math.pow(1024,i)).toFixed(2))} ${sizes[i]}`
}

function iconForFileType(fileType, size='md') {
  const map = { sm:'w-4 h-4', md:'w-8 h-8', lg:'w-12 h-12' }
  const cls = map[size] || map.md
  if (!fileType) return { comp: FileIcon, cls: `${cls} text-muted-foreground` }
  const t = String(fileType).toLowerCase()
  if (['jpg','jpeg','png','gif','webp','svg'].includes(t)) return { comp: ImageIcon, cls: `${cls} text-blue-500` }
  if (['mp3','wav','flac','aac'].includes(t)) return { comp: Music, cls: `${cls} text-green-500` }
  if (['mp4','avi','mkv','mov'].includes(t)) return { comp: Video, cls: `${cls} text-red-500` }
  if (['txt','md','pdf','doc','docx'].includes(t)) return { comp: FileText, cls: `${cls} text-orange-500` }
  return { comp: FileIcon, cls: `${cls} text-muted-foreground` }
}
</script>

<template>
  <div class="space-y-1">
    <div class="grid grid-cols-12 gap-4 p-2 text-sm font-medium text-muted-foreground border-b border-border">
      <div class="col-span-6">Name</div>
      <div class="col-span-2">Size</div>
      <div class="col-span-2">Type</div>
      <div class="col-span-2">Modified</div>
    </div>
    <div v-for="item in items" :key="keyOf(item)"
         class="grid grid-cols-12 gap-4 p-2 rounded cursor-pointer transition-colors text-sm"
         :class="selectedKeys.has(keyOf(item)) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent hover:text-accent-foreground'"
         @click="$emit('item-click', item, $event)"
         @contextmenu.prevent="$emit('item-contextmenu', $event, item)"
    >
      <div class="col-span-6 flex items-center gap-2 min-w-0">
        <template v-if="!('file_type' in item)">
          <Folder class="w-4 h-4 text-primary flex-shrink-0" />
        </template>
        <template v-else>
          <component :is="iconForFileType(item.file_type, 'sm').comp"
                     :class="iconForFileType(item.file_type, 'sm').cls" />
        </template>
        <span class="truncate">{{ item.name }}</span>
      </div>
      <div class="col-span-2">{{ !('file_type' in item) ? '—' : formatFileSize(item.file_size) }}</div>
      <div class="col-span-2">{{ !('file_type' in item) ? 'Folder' : (item.file_type?.toUpperCase() || 'File') }}</div>
      <div class="col-span-2">{{ new Date(item.updated_at).toLocaleDateString() }}</div>
    </div>
  </div>
</template>
