<script setup lang="ts" generic="TOption extends MenuOption">
import type {
  CommandListenerPriority,
  TextNode,
} from 'lexical'
import { isDOMNode } from 'lexical'
import { onMounted, onUnmounted, ref } from 'vue'
import { calculateZoomLevel } from '@lexical/utils'
import { useLexicalComposer } from '../composables'

import type { MenuOption, MenuResolution } from './LexicalMenu/shared'
import { useMenuAnchorRef } from './LexicalMenu/shared'
import LexicalMenu from './LexicalMenu/index.vue'

const props = defineProps<{
  options: Array<TOption>
  anchorClassName?: string
  commandPriority?: CommandListenerPriority
  parent?: HTMLElement
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open', payload: MenuResolution): void
  (e: 'willOpen', event: MouseEvent): void
  (e: 'selectOption', payload: {
    option: TOption
    textNodeContainingQuery: TextNode | null
    closeMenu: () => void
    matchingString: string
  }): void
}>()
const editor = useLexicalComposer()
const resolution = ref<MenuResolution | null>(null)
const menuRef = ref<HTMLElement | null>(null)

const anchorElementRef = useMenuAnchorRef(
  resolution,
  setResolution,
  props.anchorClassName,
  props.parent,
)

function setResolution(res: MenuResolution | null) {
  resolution.value = res
}

const PRE_PORTAL_DIV_SIZE = 1

function closeNodeMenu() {
  setResolution(null)
  if (resolution.value !== null)
    emit('close')
}

function openNodeMenu(res: MenuResolution) {
  setResolution(res)
  if (resolution.value === null)
    emit('open', res)
}

function handleContextMenu(event: MouseEvent) {
  event.preventDefault()
  emit('willOpen', event)
  const zoom = calculateZoomLevel(event.target as Element)
  openNodeMenu({
    getRect: () =>
      new DOMRect(
        event.clientX / zoom,
        event.clientY / zoom,
        PRE_PORTAL_DIV_SIZE,
        PRE_PORTAL_DIV_SIZE,
      ),
  })
}

function handleClick(event: MouseEvent) {
  if (
    resolution.value !== null
    && menuRef.value != null
    && event.target != null
    && isDOMNode(event.target)
    && !menuRef.value.contains(event.target as Node)
  ) {
    closeNodeMenu()
  }
}

onMounted(() => {
  const editorElement = editor.getRootElement()
  if (editorElement) {
    editorElement.addEventListener('contextmenu', handleContextMenu)

    onUnmounted(() => {
      editorElement.removeEventListener('contextmenu', handleContextMenu)
    })
  }
})

onMounted(() => {
  document.addEventListener('click', handleClick)

  onUnmounted(() => {
    document.removeEventListener('click', handleClick)
  })
})
</script>

<template>
  <LexicalMenu
    v-if="anchorElementRef !== null && resolution !== null && editor !== null"
    :close="closeNodeMenu"
    :resolution="resolution!"
    :editor="editor"
    :anchor-element-ref="anchorElementRef"
    :options="options"
    :command-priority="commandPriority"
    @select-option="$emit('selectOption', $event)"
  >
    <template #default="{ anchorElementRef: anchorRef, listItemProps }">
      <slot
        v-bind="{
          anchorElementRef: anchorRef,
          listItemProps,
          menuProps: {
            setMenuRef: (el: HTMLElement | null) => {
              menuRef = el
            },
          },
        }"
      />
    </template>
  </LexicalMenu>
</template>
