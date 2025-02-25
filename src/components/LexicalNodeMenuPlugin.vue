<script setup lang="ts" generic="TOption extends MenuOption">
import type {
  CommandListenerPriority,
  NodeKey,
  TextNode,
} from 'lexical'
import {
  $getNodeByKey,
} from 'lexical'

import { nextTick, ref, watch, watchEffect } from 'vue'
import { useLexicalComposer } from '../composables'
import type { MenuOption, MenuResolution } from './LexicalMenu/shared'
import { useMenuAnchorRef } from './LexicalMenu/shared'
import LexicalMenu from './LexicalMenu/index.vue'

const props = defineProps<{
  options: Array<TOption>
  nodeKey: NodeKey | null
  anchorClassName?: string
  commandPriority?: CommandListenerPriority
  parent?: HTMLElement
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'open', payload: MenuResolution): void
  (e: 'selectOption', payload: {
    option: TOption
    textNodeContainingQuery: TextNode | null
    closeMenu: () => void
    matchingString: string
  }): void
}>()

const editor = useLexicalComposer()
const resolution = ref<MenuResolution | null>(null)

function setResolution(payload: MenuResolution | null) {
  resolution.value = payload
}

const anchorElementRef = useMenuAnchorRef(
  resolution,
  setResolution,
  props.anchorClassName,
  props.parent,
)

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

function positionOrCloseMenu() {
  if (props.nodeKey) {
    editor.update(() => {
      const node = $getNodeByKey(props.nodeKey!)
      const domElement = editor.getElementByKey(props.nodeKey!)
      if (node != null && domElement != null) {
        if (resolution.value == null) {
          nextTick(() =>
            openNodeMenu({
              getRect: () => domElement.getBoundingClientRect(),
            }),
          )
        }
      }
    })
  }
  else if (props.nodeKey == null && resolution.value != null) {
    closeNodeMenu()
  }
}

watch(() => props.nodeKey, positionOrCloseMenu, { immediate: true })

watchEffect((onInvalidate) => {
  if (props.nodeKey != null) {
    const fn = editor.registerUpdateListener(({ dirtyElements }) => {
      if (dirtyElements.get(props.nodeKey!))
        positionOrCloseMenu()
    })

    onInvalidate(fn)
  }
})
</script>

<template>
  <LexicalMenu
    v-if="resolution !== null && editor !== null"
    v-slot="slotProps"
    :resolution="resolution!"
    :editor="editor"
    :anchor-element-ref="anchorElementRef"
    :options="options"
    :command-priority="commandPriority"
    :close="closeNodeMenu"
    @select-option="$emit('selectOption', $event)"
  >
    <slot v-bind="slotProps" />
  </LexicalMenu>
</template>
