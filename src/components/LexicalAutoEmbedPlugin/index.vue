<script setup lang="ts" generic="TEmbedConfig extends EmbedConfig">
import type {
  CommandListenerPriority,
  MutationListener,
  NodeKey,
  TextNode,
} from 'lexical'

import { $isLinkNode, AutoLinkNode, LinkNode } from '@lexical/link'

import {
  $getNodeByKey,
  $getSelection,
  COMMAND_PRIORITY_EDITOR,
} from 'lexical'

import type { UnwrapRef } from 'vue'
import { computed, ref, watchEffect } from 'vue'
import { mergeRegister } from '@lexical/utils'

import { useLexicalComposer } from '../../composables'
import LexicalNodeMenuPlugin from '../LexicalNodeMenuPlugin.vue'
import type { AutoEmbedOption, EmbedConfig } from './shared'
import { INSERT_EMBED_COMMAND } from './shared'

const props = defineProps<{
  embedConfigs: Array<TEmbedConfig>
  getMenuOptions: (
    activeEmbedConfig: TEmbedConfig,
    embedFn: () => void,
    dismissFn: () => void,
  ) => Array<AutoEmbedOption>
  menuCommandPriority?: CommandListenerPriority
}>()

const emit = defineEmits<{
  (e: 'openEmbedModalForConfig', embedConfig: TEmbedConfig): void
}>()

const editor = useLexicalComposer()
const nodeKey = ref<NodeKey | null>(null)
const activeEmbedConfig = ref<TEmbedConfig | null>(null)

function reset() {
  nodeKey.value = null
  activeEmbedConfig.value = null
}

function checkIfLinkNodeIsEmbeddable(key: NodeKey) {
  editor.getEditorState().read(async () => {
    const linkNode = $getNodeByKey(key)
    if ($isLinkNode(linkNode)) {
      for (let i = 0; i < props.embedConfigs.length; i++) {
        const embedConfig = props.embedConfigs[i]

        const urlMatch = await Promise.resolve(
          embedConfig.parseUrl(linkNode.__url),
        )

        if (urlMatch != null) {
          activeEmbedConfig.value = embedConfig as UnwrapRef<TEmbedConfig>
          nodeKey.value = linkNode.getKey()
        }
      }
    }
  })
}

const listener: MutationListener = (
  nodeMutations,
  { updateTags, dirtyLeaves },
) => {
  for (const [key, mutation] of nodeMutations) {
    if (
      mutation === 'created'
      && updateTags.has('paste')
      && dirtyLeaves.size <= 3
    )
      checkIfLinkNodeIsEmbeddable(key)
    else if (key === nodeKey.value)
      reset()
  }
}

watchEffect((onInvalidate) => {
  const cleanup = mergeRegister(
    ...[LinkNode, AutoLinkNode].map(Klass =>
      editor.registerMutationListener(Klass, (...args) => listener(...args)),
    ),
  )

  onInvalidate(cleanup)
})

watchEffect((onInvalidate) => {
  const cleanup = editor.registerCommand(
    INSERT_EMBED_COMMAND,
    (embedConfigType: TEmbedConfig['type']) => {
      const embedConfig = props.embedConfigs.find(
        ({ type }) => type === embedConfigType,
      )
      if (embedConfig) {
        emit('openEmbedModalForConfig', embedConfig)
        return true
      }
      return false
    },
    COMMAND_PRIORITY_EDITOR,
  )

  onInvalidate(cleanup)
})

async function embedLinkViaActiveEmbedConfig() {
  if (activeEmbedConfig.value != null && nodeKey.value != null) {
    const linkNode = editor.getEditorState().read(() => {
      const node = $getNodeByKey(nodeKey.value!)
      if ($isLinkNode(node))
        return node

      return null
    })

    if ($isLinkNode(linkNode)) {
      const result = await Promise.resolve(
        activeEmbedConfig.value.parseUrl(linkNode.__url),
      )
      if (result != null) {
        editor.update(() => {
          if (!$getSelection())
            linkNode.selectEnd()

          activeEmbedConfig.value?.insertNode(editor, result)
          if (linkNode.isAttached())
            linkNode.remove()
        })
      }
    }
  }
}

const options = computed(() => activeEmbedConfig.value != null && nodeKey.value != null
  ? props.getMenuOptions(activeEmbedConfig.value as TEmbedConfig, embedLinkViaActiveEmbedConfig, reset)
  : [])

function onSelectOption({
  option: selectedOption,
  closeMenu,
  textNodeContainingQuery: targetNode,
}: {
  option: AutoEmbedOption
  textNodeContainingQuery: TextNode | null
  closeMenu: () => void
  matchingString: string
}) {
  editor.update(() => {
    selectedOption.onSelect(targetNode)
    closeMenu()
  })
}
</script>

<template>
  <LexicalNodeMenuPlugin
    v-if="nodeKey !== null"
    :node-key="nodeKey"
    :close="reset"
    :options="options"
    :command-priority="menuCommandPriority"
    @select-option="onSelectOption"
  >
    <template #default="slotProps">
      <slot v-bind="slotProps" />
    </template>
  </LexicalNodeMenuPlugin>
</template>
