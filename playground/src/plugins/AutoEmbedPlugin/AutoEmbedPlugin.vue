<script setup lang="ts">
import { AutoEmbedOption, LexicalAutoEmbedPlugin } from 'lexical-vue'
import { EmbedConfigs } from '.'
import type { PlaygroundEmbedConfig } from '.'

function openEmbedModal() {}

function getMenuOptions(activeEmbedConfig: PlaygroundEmbedConfig, embedFn: () => void, dismissFn: () => void) {
  return [
    new AutoEmbedOption('Dismiss', {
      onSelect: dismissFn,
    }),
    new AutoEmbedOption(`Embed ${activeEmbedConfig.contentName}`, {
      onSelect: embedFn,
    }),
  ]
}
</script>

<template>
  <LexicalAutoEmbedPlugin
    v-slot="{ anchorElementRef, listItemProps: { options, selectedIndex, setHighlightedIndex, selectOptionAndCleanUp } }"
    :embed-configs="EmbedConfigs"
    :get-menu-options="getMenuOptions"
    @open-embed-modal-for-config="openEmbedModal"
  >
    <Teleport :to="anchorElementRef">
      <div class="typeahead-popover auto-embed-menu">
        <div class="typeahead-popover">
          <ul>
            <li
              v-for="(option, i) in options"
              :id="`typeahead-item-${i}`"
              :key="option.key"
              tabindex="-1"
              role="option"
              :aria-selected="selectedIndex === i"
              class="item"
              :class="{ selected: selectedIndex === i }"
              @click="{
                setHighlightedIndex(i);
                selectOptionAndCleanUp(option);
              }"
              @mouseenter="setHighlightedIndex(i)"
            >
              <span class="text">{{ option.title }}</span>
            </li>
          </ul>
        </div>
      </div>
    </Teleport>
  </LexicalAutoEmbedPlugin>
</template>
