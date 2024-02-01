<script setup lang="ts">
import { computed, onMounted, provide, ref, watchEffect } from 'vue'

const emit = defineEmits(['close'])
const items = ref<HTMLButtonElement[]>()
const highlightedItem = ref<HTMLButtonElement>()

function registerItem(itemRef: HTMLButtonElement) {
  items.value = items.value ? [...items.value, itemRef] : [itemRef]
}

function handleKeyDown(event: KeyboardEvent) {
  if (!items.value)
    return

  const key = event.key

  if (['Escape', 'ArrowUp', 'ArrowDown', 'Tab'].includes(key))
    event.preventDefault()

  if (key === 'Escape' || key === 'Tab') {
    emit('close')
  }
  else if (key === 'ArrowUp') {
    if (!highlightedItem.value) {
      highlightedItem.value = items.value[0]
    }
    else {
      const index = items.value.indexOf(highlightedItem.value) - 1
      highlightedItem.value = items.value[index === -1 ? items.value.length - 1 : index]
    }
  }
  else if (key === 'ArrowDown') {
    if (!highlightedItem.value) {
      highlightedItem.value = items.value[0]
    }
    else {
      const index = items.value.indexOf(highlightedItem.value) + 1
      highlightedItem.value = items.value[index === items.value.length ? 0 : index]
    }
  }
}

onMounted(() => {
  if (items.value && !highlightedItem.value)
    highlightedItem.value = items.value[0]

  if (highlightedItem.value)
    highlightedItem.value.focus()
})

provide('DropDownContext', {
  registerItem,
})

const dropDownRef = ref<HTMLDivElement | null>(null)

defineExpose({
  el: dropDownRef,
})
</script>

<template>
  <div ref="dropDownRef" class="dropdown" @keydown="handleKeyDown">
    <slot />
  </div>
</template>
