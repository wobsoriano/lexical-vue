<script setup lang="ts">
import { ref } from 'vue'
import type { EmbedMatchResult } from 'lexical-vue'
import { URL_MATCHER, useLexicalComposer } from 'lexical-vue'
import type { PlaygroundEmbedConfig } from './shared'
import DialogActions from '@/ui/DialogActions.vue'
import Button from '@/ui/Button.vue'

const props = defineProps<{
  embedConfig: PlaygroundEmbedConfig
}>()

const emit = defineEmits(['close'])

const text = ref('')
const editor = useLexicalComposer()
const embedResult = ref<EmbedMatchResult | null>(null)

function debounce(callback: (text: string) => void, delay: number) {
  let timeoutId: number
  return (text: string) => {
    window.clearTimeout(timeoutId)
    timeoutId = window.setTimeout(() => {
      callback(text)
    }, delay)
  }
}

const validateText = debounce((inputText: string) => {
  const urlMatch = URL_MATCHER.exec(inputText)
  if (props.embedConfig != null && inputText != null && urlMatch != null) {
    Promise.resolve(props.embedConfig.parseUrl(inputText)).then(
      (parseResult) => {
        embedResult.value = parseResult
      },
    )
  }
  else if (embedResult.value != null) {
    embedResult.value = null
  }
}, 200)

function onClick() {
  if (embedResult.value != null) {
    props.embedConfig.insertNode(editor, embedResult.value)
    emit('close')
  }
}

function onChange(e: Event) {
  const { value } = e.target as HTMLInputElement
  text.value = value
  validateText(value)
}
</script>

<template>
  <div style="width: '600px'">
    <div class="Input__wrapper">
      <input
        type="text"
        class="Input__input"
        :placeholder="embedConfig.exampleUrl"
        :value="text"
        :data-test-id="`${embedConfig.type}-embed-modal-url`"
        @change="onChange"
      >
    </div>
    <DialogActions>
      <Button
        :disabled="!embedResult"
        :data-test-id="`${embedConfig.type}-embed-modal-submit-btn`"
        @click="onClick"
      >
        Embed
      </Button>
    </DialogActions>
  </div>
</template>

<style>
.Input__wrapper {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
}
.Input__label {
  display: flex;
  flex: 1;
  color: #666;
}
.Input__input {
  display: flex;
  flex: 2;
  border: 1px solid #999;
  padding-top: 7px;
  padding-bottom: 7px;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 16px;
  border-radius: 5px;
  min-width: 0;
}
</style>
