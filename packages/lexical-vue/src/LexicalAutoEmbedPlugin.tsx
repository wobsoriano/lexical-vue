import type {
  CommandListenerPriority,
  LexicalCommand,
  LexicalEditor,
  LexicalNode,
  MutationListener,
  NodeKey,
  TextNode,
} from 'lexical'
import type { MenuRenderProps } from './shared/LexicalMenu'
import type { GenericComponentInstance } from './types'

import { $isLinkNode, AutoLinkNode, LinkNode } from '@lexical/link'
import { mergeRegister } from '@lexical/utils'

import {
  $getNodeByKey,
  $getSelection,
  COMMAND_PRIORITY_EDITOR,
  createCommand,
  PASTE_TAG,
} from 'lexical'

import { computed, defineComponent, getCurrentInstance, h, onUpdated, ref, watchEffect } from 'vue'

import { useLexicalComposer } from './LexicalComposer'
import { NodeMenuPlugin } from './LexicalNodeMenuPlugin'
import { MenuOption } from './shared/LexicalMenu'

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
  parseUrl: (text: string) => Promise<TEmbedMatchResult | null> | TEmbedMatchResult | null
  // Create the Lexical embed node from the url data.
  insertNode: (editor: LexicalEditor, result: TEmbedMatchResult) => void
}

export const URL_MATCHER =
  /((https?:\/\/(www\.)?)|(www\.))[-\w@:%.+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-\w()@:%+.~#?&/=]*)/

export const INSERT_EMBED_COMMAND: LexicalCommand<EmbedConfig['type']> =
  createCommand('INSERT_EMBED_COMMAND')

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

export interface LexicalAutoEmbedPluginEvents<TEmbedConfig extends EmbedConfig> {
  onOpenEmbedModalForConfig?: (embedConfig: TEmbedConfig) => void
}

type LexicalAutoEmbedPluginAttrs<TEmbedConfig extends EmbedConfig> =
  LexicalAutoEmbedPluginProps<TEmbedConfig> & LexicalAutoEmbedPluginEvents<TEmbedConfig>

export const LexicalAutoEmbedPlugin = defineComponent(
  <TEmbedConfig extends EmbedConfig>(
    props: LexicalAutoEmbedPluginProps<TEmbedConfig>,
    ctx: {
      emit: (event: 'openEmbedModalForConfig', embedConfig: TEmbedConfig) => void
      slots: { default?: (props: MenuRenderProps<AutoEmbedOption>) => any }
    },
  ) => {
    const instance = getCurrentInstance()
    const editor = useLexicalComposer()
    const nodeKey = ref<NodeKey | null>(null)
    const activeEmbedConfig = ref<any>(null) // Should be <TEmbedConfig | null> but we need to fix the type inference

    function hasOpenEmbedModalListenerProp() {
      const vnodeProps = instance?.vnode.props
      return (
        vnodeProps != null &&
        ('onOpenEmbedModalForConfig' in vnodeProps || 'onOpenEmbedModalForConfigOnce' in vnodeProps)
      )
    }

    const hasOpenEmbedModalListener = ref(hasOpenEmbedModalListenerProp())

    onUpdated(() => {
      hasOpenEmbedModalListener.value = hasOpenEmbedModalListenerProp()
    })

    function reset() {
      nodeKey.value = null
      activeEmbedConfig.value = null
    }

    async function checkIfLinkNodeIsEmbeddable(key: NodeKey) {
      const url = editor.read('latest', () => {
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

    const listener: MutationListener = (nodeMutations, { updateTags, dirtyLeaves }) => {
      for (const [key, mutation] of nodeMutations) {
        if (mutation === 'created' && updateTags.has(PASTE_TAG) && dirtyLeaves.size <= 3) {
          checkIfLinkNodeIsEmbeddable(key)
        } else if (key === nodeKey.value) {
          reset()
        }
      }
    }

    watchEffect((onInvalidate) => {
      const unregister = mergeRegister(
        ...[LinkNode, AutoLinkNode].map((Klass) =>
          editor.registerMutationListener(Klass, (...args) => listener(...args), {
            skipInitialization: true,
          }),
        ),
      )

      onInvalidate(unregister)
    })

    watchEffect((onInvalidate) => {
      if (!hasOpenEmbedModalListener.value) {
        return
      }

      const unregister = editor.registerCommand(
        INSERT_EMBED_COMMAND,
        (embedConfigType: TEmbedConfig['type']) => {
          const embedConfig = props.embedConfigs.find(({ type }) => type === embedConfigType)
          if (embedConfig) {
            ctx.emit('openEmbedModalForConfig', embedConfig)
            return true
          }
          return false
        },
        COMMAND_PRIORITY_EDITOR,
      )

      onInvalidate(unregister)
    })

    async function embedLinkViaActiveEmbedConfig() {
      const embedConfig = activeEmbedConfig.value
      const activeNodeKey = nodeKey.value
      if (embedConfig != null && activeNodeKey != null) {
        const linkNode = editor.read('latest', () => {
          const node = $getNodeByKey(activeNodeKey)
          if ($isLinkNode(node)) return node

          return null
        })

        if ($isLinkNode(linkNode)) {
          const result = await Promise.resolve(embedConfig.parseUrl(linkNode.__url))
          if (result != null) {
            editor.update(() => {
              if (!$getSelection()) linkNode.selectEnd()

              embedConfig.insertNode(editor, result)
              if (linkNode.isAttached()) linkNode.remove()
            })
          }
        }
      }
    }

    const options = computed<AutoEmbedOption[]>(() =>
      activeEmbedConfig.value != null && nodeKey.value != null
        ? props.getMenuOptions(activeEmbedConfig.value, embedLinkViaActiveEmbedConfig, reset)
        : [],
    )

    function onSelectOption(payload: {
      option: MenuOption
      textNodeContainingQuery: TextNode | null
      closeMenu: () => void
      matchingString: string
    }) {
      const selectedOption = payload.option as AutoEmbedOption
      editor.update(() => {
        selectedOption.onSelect(payload.textNodeContainingQuery)
        payload.closeMenu()
      })
    }

    return () =>
      nodeKey.value !== null
        ? h(
            NodeMenuPlugin,
            {
              nodeKey: nodeKey.value,
              onClose: reset,
              options: options.value,
              commandPriority: props.menuCommandPriority,
              onSelectOption,
            },
            {
              default: (slotProps: MenuRenderProps<AutoEmbedOption>) =>
                ctx.slots.default?.(slotProps),
            },
          )
        : null
  },
  {
    name: 'LexicalAutoEmbedPlugin',
    props: ['embedConfigs', 'getMenuOptions', 'menuCommandPriority'],
    emits: { openEmbedModalForConfig: (_embedConfig: EmbedConfig) => true },
  },
) as unknown as new <TEmbedConfig extends EmbedConfig>(
  props: LexicalAutoEmbedPluginAttrs<TEmbedConfig>,
) => GenericComponentInstance<
  LexicalAutoEmbedPluginAttrs<TEmbedConfig>,
  { default?: (props: MenuRenderProps<AutoEmbedOption>) => any }
>
