<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import DropDownItems from './DropDownItems.vue'

const props = withDefaults(defineProps<{
  disabled?: boolean
  buttonAriaLabel?: string
  buttonClassName: string
  buttonIconClassName?: string
  buttonLabel?: string
  stopCloseOnClickSelf?: boolean
}>(), {
  disabled: false,
})

const dropDownRef = ref<{ el: HTMLDivElement } | null>(null)
const buttonRef = ref<HTMLButtonElement | null>(null)
const showDropDown = ref(false)

function handleClose() {
  showDropDown.value = false
  if (buttonRef.value && buttonRef.value)
    buttonRef.value.focus()
}

watchEffect(() => {
  const button = buttonRef.value
  const dropDown = dropDownRef.value
  if (showDropDown.value && button !== null && dropDown !== null) {
    const { top, left } = button.getBoundingClientRect()
    dropDown.el.style.top = `${top + 40}px`
    dropDown.el.style.left = `${Math.min(
        left,
        window.innerWidth - dropDown.el.offsetWidth - 20,
      )}px`
  }
})

watchEffect((onInvalidate) => {
  const button = buttonRef.value

  if (button !== null && showDropDown.value) {
    const handle = (event: MouseEvent) => {
      const target = event.target
      if (props.stopCloseOnClickSelf) {
        if (
          dropDownRef.value
          && dropDownRef.value.el.contains(target as Node)
        )
          return
      }
      if (!button.contains(target as Node))
        showDropDown.value = false
    }
    document.addEventListener('click', handle)

    onInvalidate(() => {
      document.removeEventListener('click', handle)
    })
  }
})
</script>

<template>
  <button
    ref="buttonRef"
    :aria-label="buttonAriaLabel || buttonLabel"
    :class="buttonClassName"
    @click="showDropDown = !showDropDown"
  >
    <span v-if="buttonIconClassName" :class="buttonIconClassName" />
    <span v-if="buttonLabel" class="text dropdown-button-text">{{ buttonLabel }}</span>
    <i class="chevron-down" />
  </button>

  <Teleport v-if="showDropDown" to="body">
    <DropDownItems ref="dropDownRef" @close="handleClose">
      <slot />
    </DropDownItems>
  </Teleport>
</template>
