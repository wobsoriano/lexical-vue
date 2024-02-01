<script setup lang="ts">
import { inject, onMounted, ref, useAttrs } from 'vue'

defineProps<{
  title?: string
}>()
const button = ref<HTMLButtonElement | null>(null)

const ctx = inject<{ registerItem: (itemRef: HTMLButtonElement) => void }>('DropDownContext')

if (!ctx?.registerItem)
  throw new Error('DropDownItem must be used within a DropDown')

onMounted(() => {
  if (button.value)
    ctx.registerItem(button.value)
})
</script>

<template>
  <button ref="button" :title="title">
    <slot />
  </button>
</template>
