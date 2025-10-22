import type {
  CommandListenerPriority,
  NodeKey,
  TextNode,
} from 'lexical'
import type { MenuOption, MenuRenderProps, MenuResolution } from './shared/LexicalMenu.vine'

import {
  $getNodeByKey,
} from 'lexical'
import { nextTick, ref, watch, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer.vine'
import { LexicalMenu, useMenuAnchorRef } from './shared/LexicalMenu.vine'

export interface NodeMenuPluginProps<TOption extends MenuOption> {
  options: Array<TOption>
  nodeKey: NodeKey | null
  anchorClassName?: string
  commandPriority?: CommandListenerPriority
  parent?: HTMLElement
}

export function NodeMenuPlugin<TOption extends MenuOption>(props: NodeMenuPluginProps<TOption>) {
  const emit = vineEmits<{
    close: []
    open: [payload: MenuResolution]
    selectOption: [payload: {
      option: TOption
      textNodeContainingQuery: TextNode | null
      closeMenu: () => void
      matchingString: string
    }]
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
      const unregister = editor.registerUpdateListener(({ dirtyElements }) => {
        if (dirtyElements.get(props.nodeKey!))
          positionOrCloseMenu()
      })

      onInvalidate(unregister)
    }
  })

  // Can't use MenuRenderProps directly, vue-vine wants an object literal
  vineSlots<{
    default: (props: {
      anchorElementRef: MenuRenderProps<TOption>['anchorElementRef']
      itemProps: MenuRenderProps<TOption>['itemProps']
      matchingString: MenuRenderProps<TOption>['matchingString']
    }) => any
  }>()

  return vine`
    <LexicalMenu
      v-if="anchorElementRef !== null && resolution !== null && editor !== null"
      v-slot="slotProps"
      :resolution
      :editor
      :anchor-element-ref
      :options
      :command-priority
      :close="closeNodeMenu"
      @select-option="emit('selectOption', $event)"
    >
      <slot v-bind="slotProps as unknown as MenuRenderProps<TOption>" />
    </LexicalMenu>
  `
}
