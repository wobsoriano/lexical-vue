<script setup lang="ts">
import Editor from './components/Editor.vue'
</script>

<template>
  <div class="App">
    <h1>Lexical Vue Demo</h1>
    <p>Note: this is an experimental build of Lexical</p>
    <Editor />
    <div className="other">
      <h2>View source</h2>
      <ul>
        <li>
          <a
            href="https://github.com/wobsoriano/lexical-vue/tree/master/packages/playground"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>
