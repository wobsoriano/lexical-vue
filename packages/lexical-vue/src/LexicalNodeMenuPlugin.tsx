import type { CommandListenerPriority, NodeKey, TextNode } from 'lexical'
import type { Component } from 'vue'
import type { MenuOption, MenuRenderProps, MenuResolution } from './shared/LexicalMenu'

import { $getNodeByKey } from 'lexical'
import { defineComponent, h, nextTick, ref, watch, watchEffect } from 'vue'
import { useLexicalComposer } from './LexicalComposer'
import { LexicalMenu, useMenuAnchorRef } from './shared/LexicalMenu'

export interface NodeMenuPluginProps<TOption extends MenuOption> {
  options: Array<TOption>
  nodeKey: NodeKey | null
  anchorClassName?: string
  commandPriority?: CommandListenerPriority
  parent?: HTMLElement
}

export const NodeMenuPlugin = defineComponent(
  <TOption extends MenuOption>(
    props: NodeMenuPluginProps<TOption>,
    ctx: {
      emit: {
        (event: 'close'): void
        (event: 'open', payload: MenuResolution): void
        (
          event: 'selectOption',
          payload: {
            option: TOption
            textNodeContainingQuery: TextNode | null
            closeMenu: () => void
            matchingString: string
          },
        ): void
      }
      slots: { default?: (props: MenuRenderProps<TOption>) => any }
    },
  ) => {
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
      const wasOpen = resolution.value !== null
      setResolution(null)
      if (wasOpen) ctx.emit('close')
    }

    function openNodeMenu(res: MenuResolution) {
      const wasClosed = resolution.value === null
      setResolution(res)
      if (wasClosed) ctx.emit('open', res)
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
      } else if (props.nodeKey == null && resolution.value != null) {
        closeNodeMenu()
      }
    }

    watch(() => props.nodeKey, positionOrCloseMenu, { immediate: true })

    watchEffect((onInvalidate) => {
      if (props.nodeKey != null) {
        const unregister = editor.registerUpdateListener(({ dirtyElements }) => {
          if (dirtyElements.get(props.nodeKey!)) positionOrCloseMenu()
        })

        onInvalidate(unregister)
      }
    })

    return () =>
      anchorElementRef.value !== null && resolution.value !== null
        ? h(
            LexicalMenu as Component,
            {
              resolution: resolution.value,
              editor,
              anchorElementRef: anchorElementRef.value,
              options: props.options,
              commandPriority: props.commandPriority,
              close: closeNodeMenu,
              onSelectOption: (payload: any) => ctx.emit('selectOption', payload),
            },
            {
              default: (slotProps: MenuRenderProps<TOption>) => ctx.slots.default?.(slotProps),
            },
          )
        : null
  },
  {
    name: 'NodeMenuPlugin',
    props: ['options', 'nodeKey', 'anchorClassName', 'commandPriority', 'parent'],
    emits: {
      close: () => true,
      open: (_payload: MenuResolution) => true,
      selectOption: (_payload: {
        option: MenuOption
        textNodeContainingQuery: TextNode | null
        closeMenu: () => void
        matchingString: string
      }) => true,
    },
  },
) as unknown as new <TOption extends MenuOption>(
  props: NodeMenuPluginProps<TOption> & {
    onClose?: () => void
    onOpen?: (payload: MenuResolution) => void
    onSelectOption?: (payload: {
      option: TOption
      textNodeContainingQuery: TextNode | null
      closeMenu: () => void
      matchingString: string
    }) => void
  },
) => {
  $props: NodeMenuPluginProps<TOption> & {
    onClose?: () => void
    onOpen?: (payload: MenuResolution) => void
    onSelectOption?: (payload: {
      option: TOption
      textNodeContainingQuery: TextNode | null
      closeMenu: () => void
      matchingString: string
    }) => void
  }
  $slots: { default?: (props: MenuRenderProps<TOption>) => any }
}
