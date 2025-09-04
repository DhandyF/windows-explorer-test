<script setup>
const props = defineProps({
  title: { type: String, default: 'Windows Explorer' },
  loading: { type: Boolean, default: false }
})
</script>

<template>
  <div class="fixed top-0 left-0 right-0 h-12 bg-card border-b border-border flex items-center px-4 z-10">
    <h1 class="text-lg font-semibold text-foreground">{{ title }}</h1>
  </div>
</template>
