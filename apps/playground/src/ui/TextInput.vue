<script setup lang="ts">
import type { InputTypeHTMLAttribute } from 'vue'

withDefaults(defineProps<{
  label: string
  placeholder?: string
  type?: InputTypeHTMLAttribute
}>(), {
  placeholder: '',
  type: 'text',
})

const model = defineModel()
</script>

<template>
  <div className="Input__wrapper">
    <label class="Input__label">{{ label }}</label>
    <input v-model="model" :type="type" class="Input__input" :placeholder="placeholder">
  </div>
</template>

<style scoped>
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
