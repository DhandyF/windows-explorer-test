<script setup>
import { computed } from 'vue'

const props = defineProps({
  text: { type: String, required: true },
  searchTerm: { type: String, default: '' }
})

const parts = computed(() => {
  const term = props.searchTerm
  if (!term) return [props.text]
  const re = new RegExp(`(${term})`, 'gi')
  return props.text.split(re)
})
</script>

<template>
  <span>
    <template v-for="(part, i) in parts" :key="i">
      <span>{{ part }}</span>
    </template>
  </span>
</template>
