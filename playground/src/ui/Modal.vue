<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const props = withDefaults(defineProps<{
  title: string
  closeOnClickOutside?: boolean
}>(), {
  closeOnClickOutside: false,
})

const emit = defineEmits(['close'])

const modalRef = ref<HTMLDivElement | null>(null)

onMounted(() => {
  if (modalRef.value !== null)
    modalRef.value.focus()
})

onMounted(() => {
  let modalOverlayElement: HTMLElement | null = null
  const handler = (event: KeyboardEvent) => {
    if (event.key === 'Escape')
      emit('close')
  }
  const clickOutsideHandler = (event: MouseEvent) => {
    const target = event.target
    if (
      modalRef.value !== null
      && !modalRef.value.contains(target as Node)
      && props.closeOnClickOutside
    )
      emit('close')
  }
  const modelElement = modalRef.value
  if (modelElement !== null) {
    modalOverlayElement = modelElement.parentElement
    if (modalOverlayElement !== null)
      modalOverlayElement.addEventListener('click', clickOutsideHandler)
  }

  window.addEventListener('keydown', handler)

  onUnmounted(() => {
    window.removeEventListener('keydown', handler)
    if (modalOverlayElement !== null)
      modalOverlayElement?.removeEventListener('click', clickOutsideHandler)
  })
})
</script>

<template>
  <Teleport to="body">
    <div className="Modal__overlay" role="dialog">
      <div ref="modalRef" className="Modal__modal" tabIndex="{-1}">
        <h2 className="Modal__title">
          {{ title }}
        </h2>
        <button
          className="Modal__closeButton"
          aria-label="Close modal"
          type="button"
          @click="$emit('close')"
        >
          X
        </button>
        <div className="Modal__content">
          <slot />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
 .Modal__overlay {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed;
  flex-direction: column;
  top: 0px;
  bottom: 0px;
  left: 0px;
  right: 0px;
  background-color: rgba(40, 40, 40, 0.6);
  flex-grow: 0px;
  flex-shrink: 1px;
  z-index: 100;
}
.Modal__modal {
  padding: 20px;
  min-height: 100px;
  min-width: 300px;
  display: flex;
  flex-grow: 0px;
  background-color: #fff;
  flex-direction: column;
  position: relative;
  box-shadow: 0 0 20px 0 #444;
  border-radius: 10px;
}
.Modal__title {
  color: #444;
  margin: 0px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ccc;
}
.Modal__closeButton {
  border: 0px;
  position: absolute;
  right: 20px;
  border-radius: 20px;
  justify-content: center;
  align-items: center;
  display: flex;
  width: 30px;
  height: 30px;
  text-align: center;
  cursor: pointer;
  background-color: #eee;
}
.Modal__closeButton:hover {
  background-color: #ddd;
}
.Modal__content {
  padding-top: 20px;
}
</style>
