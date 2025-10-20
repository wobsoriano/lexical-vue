<script setup lang="ts">
import { LexicalTypeaheadMenuPlugin, MenuOption, useBasicTypeaheadTriggerMatch, useLexicalComposer } from 'lexical-vue'

import type {
  TextNode,
} from 'lexical'
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
} from 'lexical'
import { computed, onMounted, ref } from 'vue'

class EmojiOption extends MenuOption {
  title: string
  emoji: string
  keywords: Array<string>

  constructor(
    title: string,
    emoji: string,
    options: {
      keywords?: Array<string>
    },
  ) {
    super(title)
    this.title = title
    this.emoji = emoji
    this.keywords = options.keywords || []
  }
}

interface Emoji {
  emoji: string
  description: string
  category: string
  aliases: Array<string>
  tags: Array<string>
  unicode_version: string
  ios_version: string
  skin_tones?: boolean
}

const MAX_EMOJI_SUGGESTION_COUNT = 10

const editor = useLexicalComposer()

const queryString = ref<string | null>(null)

const emojis = ref<Array<Emoji>>([])

onMounted(() => {
  import('../utils/emoji-list')
    .then((file) => {
      emojis.value = file.default
    })
})

const emojiOptions = computed(() => emojis.value != null
  ? emojis.value.map(
    ({ emoji, aliases, tags }) =>
      new EmojiOption(aliases[0], emoji, {
        keywords: [...aliases, ...tags],
      }),
  )
  : [])

const checkForTriggerMatch = useBasicTypeaheadTriggerMatch(':', {
  minLength: 0,
})

const options = computed<Array<EmojiOption>>(() => {
  return emojiOptions.value
    .filter((option: EmojiOption) => {
      return queryString.value != null
        ? new RegExp(queryString.value, 'gi').exec(option.title)
        || option.keywords != null
          ? option.keywords.some((keyword: string) =>
            new RegExp(queryString.value!, 'gi').exec(keyword),
          )
          : false
        : emojiOptions
    })
    .slice(0, MAX_EMOJI_SUGGESTION_COUNT)
})

function onSelectOption({
  option: selectedOption,
  textNodeContainingQuery: nodeToRemove,
  closeMenu,
}: {
  option: EmojiOption
  textNodeContainingQuery: TextNode | null
  closeMenu: () => void
  matchingString: string
}) {
  editor.update(() => {
    const selection = $getSelection()

    if (!$isRangeSelection(selection) || selectedOption == null)
      return

    if (nodeToRemove)
      nodeToRemove.remove()

    selection.insertNodes([$createTextNode(selectedOption.emoji)])

    closeMenu()
  })
}
</script>

<template>
  <LexicalTypeaheadMenuPlugin
    v-slot="{ anchorElementRef, listItemProps: { selectedIndex, setHighlightedIndex, selectOptionAndCleanUp } }"
    :trigger-fn="checkForTriggerMatch"
    :options="options"
    @query-change="queryString = $event"
    @select-option="onSelectOption"
  >
    <Teleport :disabled="anchorElementRef == null || options.length === 0" :to="anchorElementRef">
      <div class="typeahead-popover emoji-menu">
        <ul>
          <li
            v-for="(option, index) in options"
            :id="`typeahead-item-${index}`"
            :key="option.key"
            :ref="option.setRefElement"
            tabindex="-1"
            role="option"
            class="item"
            :class="{ selected: selectedIndex === index }"
            @mouseenter="setHighlightedIndex(index)"
            @click="setHighlightedIndex(index); selectOptionAndCleanUp(option)"
          >
            <span className="text">
              {{ option.emoji }} {{ option.title }}
            </span>
          </li>
        </ul>
      </div>
    </Teleport>
  </LexicalTypeaheadMenuPlugin>
</template>
