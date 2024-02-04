import type { Component } from 'vue'
import { computed, h, shallowRef } from 'vue'

import Modal from '../ui/Modal.vue'

export default function useModal() {
  const modalContent = shallowRef<null | {
    closeOnClickOutside: boolean
    content: Component
    title: string
  }>(null)

  function onClose() {
    modalContent.value = null
  }

  const modal = computed(() => {
    if (modalContent.value === null)
      return null

    const { title, content, closeOnClickOutside } = modalContent.value
    return h(Modal, {
      onClose,
      title,
      closeOnClickOutside,
    }, () => content)
  })

  const showModal = (
    title: string,
    getContent: (onClose: () => void) => Component,
    closeOnClickOutside = false,
  ) => {
    modalContent.value = {
      closeOnClickOutside,
      content: getContent(onClose),
      title,
    }
  }

  return { modal, showModal }
}
