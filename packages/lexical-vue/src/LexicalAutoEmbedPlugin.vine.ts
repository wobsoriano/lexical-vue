import type {
  CommandListenerPriority,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  MutationListener,
  NodeKey,
  TextNode,
} from 'lexical'
import { $isLinkNode, AutoLinkNode, LinkNode } from '@lexical/link'

import { mergeRegister } from '@lexical/utils'

import {
  $getNodeByKey,
  $getSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  PASTE_TAG,
} from 'lexical'

import { computed, ref, watchEffect } from 'vue'

import { useLexicalComposer } from './composables'
import { LexicalNodeMenuPlugin } from './LexicalNodeMenuPlugin.vine'
import { MenuOption } from './shared/LexicalMenu.vine'

export interface EmbedMatchResult<TEmbedMatchResult = unknown> {
  url: string
  id: string
  data?: TEmbedMatchResult
}

export interface EmbedConfig<
  TEmbedMatchResultData = unknown,
  TEmbedMatchResult = EmbedMatchResult<TEmbedMatchResultData>,
> {
  // Used to identify this config e.g. youtube, tweet, google-maps.
  type: string
  // Determine if a given URL is a match and return url data.
  parseUrl: (
    text: string,
  ) => Promise<TEmbedMatchResult | null> | TEmbedMatchResult | null
  // Create the Lexical embed node from the url data.
  insertNode: (editor: LexicalEditor, result: TEmbedMatchResult) => void
}

export const URL_MATCHER
  = /((https?:\/\/(www\.)?)|(www\.))[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-\w()@:%+.~#?&/=]*)/

export const INSERT_EMBED_COMMAND: LexicalCommand<EmbedConfig['type']>
  = createCommand('INSERT_EMBED_COMMAND')

export class AutoEmbedOption extends MenuOption {
  title: string
  onSelect: (targetNode: LexicalNode | null) => void
  constructor(
    title: string,
    options: {
      onSelect: (targetNode: LexicalNode | null) => void
    },
  ) {
    super(title)
    this.title = title
    this.onSelect = options.onSelect.bind(this)
  }
}

interface LexicalAutoEmbedPluginProps<TEmbedConfig extends EmbedConfig> {
  embedConfigs: TEmbedConfig[]
  getMenuOptions: (
    activeEmbedConfig: TEmbedConfig,
    embedFn: () => void,
    dismissFn: () => void,
  ) => AutoEmbedOption[]
  menuCommandPriority?: CommandListenerPriority
}

export function LexicalAutoEmbedPlugin<TEmbedConfig extends EmbedConfig>(props: LexicalAutoEmbedPluginProps<TEmbedConfig>) {
  const editor = useLexicalComposer()
  const nodeKey = ref<NodeKey | null>(null)
  const activeEmbedConfig = ref<TEmbedConfig | null>(null)

  const emit = vineEmits<{
    openEmbedModalForConfig: [embedConfig: TEmbedConfig]
  }>()

  function reset() {
    nodeKey.value = null
    activeEmbedConfig.value = null
  }

  async function checkIfLinkNodeIsEmbeddable(key: NodeKey) {
    const url = editor.getEditorState().read(() => {
      const linkNode = $getNodeByKey(key)
      if ($isLinkNode(linkNode)) {
        return linkNode.getURL()
      }
    })
    if (url === undefined) {
      return
    }
    for (const embedConfig of props.embedConfigs) {
      const urlMatch = await Promise.resolve(embedConfig.parseUrl(url))
      if (urlMatch != null) {
        activeEmbedConfig.value = embedConfig
        nodeKey.value = key
      }
    }
  }

  const listener: MutationListener = (
    nodeMutations,
    { updateTags, dirtyLeaves },
  ) => {
    for (const [key, mutation] of nodeMutations) {
      if (
        mutation === 'created'
        && updateTags.has(PASTE_TAG)
        && dirtyLeaves.size <= 3
      ) {
        checkIfLinkNodeIsEmbeddable(key)
      }
      else if (key === nodeKey.value) {
        reset()
      }
    }
  }

  watchEffect((onInvalidate) => {
    const unregister = mergeRegister(
      ...[LinkNode, AutoLinkNode].map(Klass =>
        editor.registerMutationListener(Klass, (...args) => listener(...args), {
          skipInitialization: true,
        }),
      ),
    )

    onInvalidate(unregister)
  })

  watchEffect((onInvalidate) => {
    const unregister = editor.registerCommand(
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

    onInvalidate(unregister)
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

            activeEmbedConfig.value.insertNode(editor, result)
            if (linkNode.isAttached())
              linkNode.remove()
          })
        }
      }
    }
  }

  const options = computed<AutoEmbedOption[]>(() => activeEmbedConfig.value != null && nodeKey.value != null
    ? props.getMenuOptions(activeEmbedConfig.value, embedLinkViaActiveEmbedConfig, reset)
    : [])

  function onSelectOption({
    option: selectedOption,
    closeMenu,
    textNodeContainingQuery: targetNode,
  }: {
    option: AutoEmbedOption
    textNodeContainingQuery: TextNode | null
    closeMenu: () => void
  }) {
    editor.update(() => {
      selectedOption.onSelect(targetNode)
      closeMenu()
    })
  }

  return vine`
    <LexicalNodeMenuPlugin
      v-if="nodeKey !== null"
      :node-key
      :close="reset"
      :options
      :command-priority="menuCommandPriority"
      @select-option="onSelectOption"
      v-slot="slotProps"
    >
      <slot v-bind="slotProps" />
    </LexicalNodeMenuPlugin>
  `
}
