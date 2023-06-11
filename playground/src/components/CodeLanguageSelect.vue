<script setup lang="ts">
defineProps<{
  codeLanguages: string[]
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function change(e: Event) {
  emit('update:modelValue', (e.target as HTMLSelectElement).value)
}
</script>

<template>
  <select class="toolbar-item code-language" :value="modelValue" @change="change">
    <option :hidden="true" value="" />
    <option v-for="lang in codeLanguages" :key="lang" :value="lang">
      {{ lang }}
    </option>
  </select>
</template>
