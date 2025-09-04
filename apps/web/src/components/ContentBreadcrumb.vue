<script setup>
import { HardDrive, ChevronRight } from 'lucide-vue-next'
import { computed } from 'vue';

const props = defineProps({
  folder: { type: Object, default: null } // { path, name }
})
const parts = computed(() =>
  props.folder?.path ? props.folder.path.split('/').filter(Boolean) : []
)
</script>

<template>
  <div v-if="folder" class="flex items-center gap-1 text-sm text-muted-foreground">
    <HardDrive class="w-4 h-4" />
    <template v-for="(part, idx) in parts" :key="idx">
      <div class="flex items-center gap-1">
        <ChevronRight class="w-3 h-3" />
        <span :class="idx === parts.length - 1 ? 'text-foreground font-medium' : ''">{{ part }}</span>
      </div>
    </template>
  </div>
</template>
