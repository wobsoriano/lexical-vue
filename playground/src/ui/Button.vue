<script setup lang="ts">
defineProps<{
  disabled?: boolean
  small?: boolean
  title?: string
}>()
</script>

<template>
  <button
    :disabled="disabled"
    :title="title"
    :aria-label="title"
    class="Button__root"
    :class="{
      Button__disabled: disabled,
      Button__small: small,
    }"
  >
    <slot />
  </button>
</template>

<style scoped>
.Button__root {
  padding-top: 10px;
  padding-bottom: 10px;
  padding-left: 15px;
  padding-right: 15px;
  border: 0px;
  background-color: #eee;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
}
.Button__root:hover {
  background-color: #ddd;
}
.Button__small {
  padding-top: 5px;
  padding-bottom: 5px;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 13px;
}
.Button__disabled {
  cursor: not-allowed;
}
.Button__disabled:hover {
  background-color: #eee;
}
</style>
