<script setup lang="ts">
import { ref } from 'vue'
import type { Position } from './shared'

const emit = defineEmits<{
  (e: 'change', payload: Position): void
  (e: 'skipAddingToHistoryStack', payload: boolean): void
}>()
const divRef = ref<HTMLDivElement | null>(null)
const draggedRef = ref(false)

function clamp(value: number, max: number, min: number) {
  return value > max ? max : value < min ? min : value
}

function move(e: MouseEvent): void {
  if (divRef.value) {
    const { value: div } = divRef
    const { width, height, left, top } = div.getBoundingClientRect()

    const x = clamp(e.clientX - left, width, 0)
    const y = clamp(e.clientY - top, height, 0)

    emit('change', { x, y })
  }
}

function onMouseDown(e: MouseEvent): void {
  if (e.button !== 0)
    return

  move(e)

  const onMouseMove = (_e: MouseEvent): void => {
    draggedRef.value = true
    emit('skipAddingToHistoryStack', true)
    move(_e)
  }

  const onMouseUp = (_e: MouseEvent): void => {
    if (draggedRef.value)
      emit('skipAddingToHistoryStack', false)

    document.removeEventListener('mousemove', onMouseMove, false)
    document.removeEventListener('mouseup', onMouseUp, false)

    move(_e)
    draggedRef.value = false
  }

  document.addEventListener('mousemove', onMouseMove, false)
  document.addEventListener('mouseup', onMouseUp, false)
}
</script>

<template>
  <div
    ref="divRef"
    @mousedown="onMouseDown"
  >
    <slot />
  </div>
</template>
