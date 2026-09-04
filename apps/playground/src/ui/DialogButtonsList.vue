<template>
  <div class="DialogButtonsList">
    <slot />
  </div>
</template>

<style>
.DialogButtonsList {
  display: flex;
  flex-direction: column;
  justify-content: right;
  margin-top: 20px;
}

.DialogButtonsList button {
  margin-bottom: 20px;
}
</style>
